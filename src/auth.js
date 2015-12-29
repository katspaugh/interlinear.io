'use strict';

/**
 * Configure Passport
 */
let url = require('url');
let cookieParser = require('cookie-parser');
let cookieSession = require('cookie-session');
let passport = require('passport');
let FacebookStrategy = require('passport-facebook').Strategy;


module.exports = function (app) {
    passport.use(
        new FacebookStrategy({
            clientID: process.env.FB_ID,
            clientSecret: process.env.FB_SECRET,
            callbackURL: url.format({
                hostname: process.env.HOST,
                port: process.env.PORT == 3000 ? process.env.PORT : null,
                pathname: '/auth/facebook/callback'
            })
        },

        (accessToken, refreshToken, profile, done) => {
            delete profile._raw;
            delete profile._json;

            app.get('db').collection('users')
                .findAndModify(
                    { id: profile.id },
                    null,
                    { $set: profile },
                    { upsert: true, new: true }
                )
                .then((rec) => done(null, rec.value))
                .catch(done);
        })
    );

    passport.serializeUser((user, done) => done(null, user.id));

    passport.deserializeUser((id, done) => {
        app.get('db').collection('users').findOne({ id: id }, done);
    });

    app.use(cookieParser(process.env.SESSION_SECRET));
    app.use(cookieSession({ secret: process.env.SESSION_SECRET }));
    app.use(passport.initialize());
    app.use(passport.session());
};
