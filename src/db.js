'use strict';

/**
 * Database connection
 */
let MongoClient = require('mongodb').MongoClient;

module.exports = (app) => {
    MongoClient.connect(process.env.MONGOLAB_URI, (err, db) => {
        console.log('Connected to Mongo server');
        app.set('db', db);
    });

    process.on('exit', () => {
        let db = app.get('db');
        db && db.close();
    });
};
