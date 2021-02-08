// Switch these lines once there are useful utils

// const testUtils = require('./utils');
require('./utils');
const supertest = require('supertest');
const express = require('express');

const MaintenanceApp = require('../');

describe('MaintenanceApp', function () {
    const PORT = 3000;
    let request;
    let server;

    before(function () {
        request = supertest.agent(`http://localhost:${PORT}/`);
    });

    beforeEach(function () {
        const maintenanceApp = new MaintenanceApp({
            express

        }).app;

        server = maintenanceApp.listen(PORT);
    });

    afterEach(function () {
        server.close();
    });

    it('Serves a 503 from root route', function () {
        return request.get('/')
            .expect(503)
            .expect(/We'll be right back./);
    });

    it('Serves a 503 from non root route', function () {
        return request.get('/hello')
            .expect(503)
            .expect(/We'll be right back./);
    });
});
