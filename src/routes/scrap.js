'use strict';

/**
 * Extract texts from web-pages using Readability
 */
let request = require('request-promise');

const ALCHEMY_TOKEN = process.env.ALCHEMY_TOKEN;
const ALCHEMY_URL = `http://gateway-a.watsonplatform.net/calls/url/URLGetText?outputMode=json&apikey=${ ALCHEMY_TOKEN }&url=`;

module.exports = (app) => {
    app.get('/scrap', (req, res, next) => {
        let url = ALCHEMY_URL + req.query.url;

        request(url)
            .catch(next)
            .then((json) => {
                let data = JSON.parse(json);
                res.send({ text: data.text });
            })
    });
};
