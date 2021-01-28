const compression = require('compression');
const errors = require('@tryghost/errors');
const constants = require('@tryghost/constants');
const debug = require('ghost-ignition').debug('maintenance:app');

class MaintenanceApp {
    /**
     * Note, this constructor is way too big and needs cleanup one day. Good candidates to consider
     * moving would be servePublicFile and serveFavicon middlewares.
     *
     * @param {Object} options
     * @param {Object} [options.logging] - custom logging handler
     * @param {Object} [options.i18n] - translations handler
     * @param {Function} [options.express] - express application constructor function
     * @param {Object} [options.viewEngine] - express view engine instance
     * @param {String} [options.views] - path to view tamplates
     * @param {Boolean} [options.compress] - flag controling gzip compression
     * @param {Function} [options.servePublicFile] - express middleware handling serving public files
     * @param {Function} [options.serveFavicon] - express middleware handling serving favicon files
     */
    constructor({logging, i18n, express, viewEngine, views, compress, servePublicFile, serveFavicon}) {
        debug('MaintenanceApp setup start');
        const app = express('maintenance');

        if (compress !== false) {
            app.use(compression());
        }

        app.engine('hbs', viewEngine);
        app.set('view engine', 'hbs');
        app.set('views', views);

        // Serve favicon.ico and favicon.png
        app.use(serveFavicon());

        // Serve stylesheets for default templates
        app.use(servePublicFile('public/ghost.css', 'text/css', constants.ONE_HOUR_S));
        app.use(servePublicFile('public/ghost.min.css', 'text/css', constants.ONE_YEAR_S));

        // Serve images for default templates
        app.use(servePublicFile('public/404-ghost@2x.png', 'image/png', constants.ONE_HOUR_S));
        app.use(servePublicFile('public/404-ghost.png', 'image/png', constants.ONE_HOUR_S));

        app.use('/', (req, res) => {
            const error = new errors.MaintenanceError({
                message: i18n.t('errors.general.maintenance')
            });

            logging.error({req: req, res: res, err: error});

            res.render('error', error, (err, html) => {
                // never cache errors
                res.set({
                    'Cache-Control': 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'
                });
                res.status(error.statusCode);
                return res.send(html);
            });
        });

        debug('MaintenanceApp setup end');

        this.app = app;
    }
}

module.exports = MaintenanceApp;
