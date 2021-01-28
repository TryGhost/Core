const fs = require('fs');
const path = require('path');
const debug = require('ghost-ignition').debug('maintenance:app');

class MaintenanceApp {
    /**
     * Creates an instance of an express app serving 503 maintenance page
     *
     * @param {Object} options
     * @param {Function} [options.express] - express application constructor function
     */
    constructor({express}) {
        debug('MaintenanceApp setup start');
        const app = express('maintenance');

        app.use('/', (req, res) => {
            res.set({
                'Cache-Control': 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'
            });
            res.writeHead(503, {'content-type': 'text/html'});
            fs.createReadStream(path.resolve(__dirname, './views/maintenance.html'))
                .pipe(res);
        });

        debug('MaintenanceApp setup end');

        this.app = app;
    }
}

module.exports = MaintenanceApp;
