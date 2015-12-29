'use strict';

let Q = require('q');
let ObjectID = require('mongodb').ObjectID;

const SPECIAL_USER_ID = new ObjectID(process.env.SPECIAL_USER_ID);

module.exports = (app) => {
    let specialUser;
    let getSpecialUser = (callback) => {
        if (specialUser) return callback(null, specialUser);

        app.get('db').collection('users').findOne(
            { _id: SPECIAL_USER_ID },
            (err, user) => {
                specialUser = user;
                callback(err, user);
            }
        );
    };

    let getTextsByIds = (ids) => {
        let query = { _id: { $in: ids } };
        let options = {
            limit: 1000,

            fields: {
                _id: 1,
                lang: 1,
                title: 1,
                author: 1,
                annotations: { $slice: 100 }
            }
        };

        return app.get('db').collection('annotations')
            .find(query, options)
            .toArray();
    };


    /**
     * All texts
     */
    app.get('/texts', (req, res, next) => {
        getSpecialUser((err, user) => {
            if (err) return next(err);

            let ids = user.texts.map((id) => new ObjectID(id));

            getTextsByIds(ids)
                .then((docs) => res.json(docs))
                .catch(next);
        });
    });

    /**
     * Text by id
     */
    app.get('/texts/:id', (req, res, next) => {
        getSpecialUser((err, user) => {
            if (err) return next(err);

            let id = req.params.id;
            let isSpecial = user.texts.indexOf(id) > -1;

            if (!isSpecial && (!req.user || req.user.texts.indexOf(id) == -1)) {
                return res.sendStatus(401);
            }

            if (!ObjectID.isValid(id)) {
                return next('Incorrect object id');
            }

            app.get('db').collection('annotations')
                .findOne({ _id: new ObjectID(id) })
                .then((doc) => {
                    doc.isSpecial = isSpecial;
                    return doc;
                })
                .then((doc) => res.json(doc))
                .catch(next);
        });
    });


    /**
     * User texts
     */
    app.get('/user/texts', (req, res, next) => {
        if (!req.user) return res.sendStatus(401);

        let texts = req.user.texts || [];

        if (!texts.length) return res.json([]);

        let ids = texts.map((id) => new ObjectID(id));

        getTextsByIds(ids)
            .then((docs) => res.json(docs))
            .catch(next);
    });


    /**
     * Remove user text
     */
    app.delete('/texts/:id', (req, res, next) => {
        getSpecialUser((err, user) => {
            if (err) return next(err);

            let db = app.get('db');
            let id = req.params.id;

            if (user.texts.indexOf(id) == -1 && (!req.user || req.user.texts.indexOf(id) == -1)) {
                return res.sendStatus(401);
            }

            if (!ObjectID.isValid(id)) {
                return next('Incorrect object id');
            }

            req.user.texts.splice(req.user.texts.indexOf(id), 1)

            let vocabId = req.user.vocab && req.user.vocab[id];
            if (vocabId) {
                delete req.user.vocab[id];
                db.collection('vocab').deleteOne({ _id: new ObjectID(vocabId) });
            }

            db.collection('annotations').deleteOne({ _id: new ObjectID(id) });

            db.collection('users')
                .updateOne(
                    { id: req.user.id },
                    { $set: { vocab: req.user.vocab, texts: req.user.texts } }
                )
                .then(() => res.json({ ok: true }))
                .catch(next);
        });
    });
};
