'use strict';

/**
 * Modules
 */
let express = require('express');
let bodyParser = require('body-parser');

/**
 * Default config
 */
try {
    let config = require('../etc/config.json');
    for (let key in config) {
        if (null == process.env[key]) {
            process.env[key] = config[key];
        }
    }
} catch (e) {}

const publicDir = __dirname + '/../public';

/**
 * Create the app
 */
let app = express();

app.use(express.static(publicDir));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

require('./db')(app);
require('./auth')(app);

/**
 * Routes
 */
require('./routes/facebook')(app)
require('./routes/texts')(app);
require('./routes/wiktionary')(app);
require('./routes/translate')(app);
require('./routes/vocab')(app);
require('./routes/scrap')(app);

/**
 * Catch-all route for Angular
 */
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: publicDir });
});

app.get('/*', (req, res) => {
    res.sendFile('index.html', { root: publicDir });
});

/**
 * Start the server
 */
let port = process.env.PORT;
app.listen(port, () => {
    console.log('App listening on port %s', port);
});
