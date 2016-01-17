'use strict';

let ObjectID = require('mongodb').ObjectID;

/**
 * User vocab
 */
module.exports = (app) => {
    /**
     * Vocab per text
     */
    app.get('/vocab/:bookId', (req, res, next) => {
        if (!req.user) return res.sendStatus(401);

        app.get('db').collection('vocab')
            .find({ bookId: req.params.bookId, userId: req.user.id })
            .toArray()
            .then((doc) => res.json(doc))
            .catch(next);
    });

    /**
     * Add a word to vocab
     */
    app.post('/vocab', (req, res, next) => {
        if (!req.user) return res.sendStatus(401);

        let db = app.get('db');

        let vocab = req.body;
        vocab.userId = req.user.id;

        db.collection('vocab')
            .insert([ vocab ])
            .then(records => records[0])
            .catch(next);
    });

    /**
     * Delete a word from vocab
     */
    app.delete('/vocab', (req, res, next) => {
        if (!req.user) return res.sendStatus(401);

        let db = app.get('db');
        let vocabId = req.body._id;

        if (!ObjectID.isValid(vocabId)) {
            return next('Incorrect object id');
        }

        db.collection('vocab')
            .remove({ _id: new ObjectID(vocabId), userId: req.user.id })
            .then(result => res.json(result))
            .catch(next);
    });
};
