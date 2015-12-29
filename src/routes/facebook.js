'use strict';

/**
 * Auth routes
 */
let passport = require('passport');

module.exports = (app) => {
    app.get('/auth/facebook/login', passport.authenticate('facebook'));

    app.get('/auth/facebook/logout', (req, res) => {
        req.logout();
        res.redirect('/');
    });

    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
        successRedirect: '/',
        failureRedirect: '/'
    }));

    app.get('/user/profile', (req, res, next) => {
        if (!req.user) return res.sendStatus(401);

        res.json(req.user);
    });
};
