'use strict';

let ObjectID = require('mongodb').ObjectID;

/**
 * User vocab
 */
module.exports = (app) => {
    /**
     * Vocab per text
     */
    app.get('/user/vocab/:id', (req, res, next) => {
        if (!req.user) return res.sendStatus(401);

        let vocabId = req.user.vocab && req.user.vocab[req.params.id];

        if (!vocabId) {
            return next('No vocab');
        }

        app.get('db').collection('vocab')
            .findOne({ _id: new ObjectID(vocabId) })
            .then((doc) => res.json(doc))
            .catch(next);
    });

    /**
     * Add a word to vocab
     */
    app.put('/user/vocab/:id', (req, res, next) => {
        if (!req.user) return res.sendStatus(401);

        let db = app.get('db');
        let textId = req.params.id;
        let vocabId = req.user.vocab && req.user.vocab[textId];

        if (vocabId) {
            db.collection('vocab')
                .updateOne(
                    { _id: new ObjectID(vocabId) },
                    { $addToSet: { words: req.body.word } }
                )
                .then(() => res.json({ ok: true }))
                .catch(next);
            return;
        }

        db.collection('vocab')
            .insertOne({ words: [ req.body.word ] })
            .then((rec) => {
                let vocabId = rec.insertedId.toString();
                req.user.vocab = req.user.vocab || {};
                req.user.vocab[textId] = vocabId;

                db.collection('users')
                    .updateOne(
                        { id: req.user.id },
                        { $set: { vocab: req.user.vocab } }
                    )
                    .then((rec) => res.json({ ok: true }))
                    .catch(next);
            });
    });


    /**
     * Delete a word from vocab
     */
    app.put('/user/vocab/:id/remove', (req, res, next) => {
        if (!req.user) return res.sendStatus(401);

        let db = app.get('db');
        let textId = req.params.id;
        let vocabId = req.user.vocab[textId];

        if (!vocabId) { next('Incorrect object id'); }

        db.collection('vocab')
            .updateOne(
                { _id: new ObjectID(vocabId) },
                { $pull: { words: req.body.word } }
            )
            .then((rec) => res.json({ ok: true }))
            .catch(next);
    });
};
