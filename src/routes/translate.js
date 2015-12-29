'use strict';

/**
 * Translate word-for-word via Yandex.Translate
 */
let Q = require('q');
let request = require('request-promise');

const API_URL = 'https://translate.yandex.net/api/v1.5/tr.json/translate';
const PUNCTUATION = /[–,.;:'"()!?%&*=\[\]«»<>]+/g;


function splitWords(text) {
    return text.match(/(\s+|\S+)/g);
}

function createWordTags(words) {
    return words.map((word, index) => {
        return /\S/.test(word) ?
            '<b id="w' + index + '">' + word + '</b>' :
            word;
    });
}

function createChunks(text) {
    let sentences = text.split(/\.\s/g);

    return sentences.reduce((acc, part) => {
        let len = part.length;
        let prev = acc[acc.length - 1];

        if (prev && prev.count + len < 10000) {
            prev.count += len
            prev.push(part);
        } else {
            let next = [ part ];
            next.count = len;
            acc.push(next);
        }

        return acc;
    }, []);
}

function requestTranslation(text, target) {
    return request.post({
        url: API_URL,
        formData: {
            key: process.env.YANDEX_TRANSLATE_KEY,
            lang: target || 'en',
            options: 1,
            format: 'html',
            text: text
        }
    }).then((response) => JSON.parse(response));
}

function extractTranslations(text) {
    let notes = [];

    text.replace(/<b id="w(\d+)">(.+?)<\/b>/g, ($0, index, word) => {
        notes[index] = word;
    });

    return notes;
}

function mapNotes(words, notes) {
    return words.map((word, index) => {
        let item = { text: word };

        let note = notes[index] && notes[index].trim().replace(PUNCTUATION, '');
        if (note) {
            item.note = note
        }

        return item;
    });
}

function addUntranslatedWords(annotations, target) {
    let noNotes = annotations.filter(
        (item) => /\S/.test(item.text) && !item.note
    );

    let noNoteWords = noNotes.map(
        (item) => item.text.trim().replace(PUNCTUATION, '')
    );

    return requestTranslation(noNoteWords.join('\n'), target).then((data) => {
        let notes = data.text[0].split('\n');
        let items = mapNotes(noNoteWords, notes);

        items.forEach((item, index) => {
            if (item.note) {
                noNotes[index].note = item.note;
            }
        });

        return annotations;
    });
}

function transformAnnotations(annotations) {
    annotations.reduce(function (prev, item) {
        if (item.text.replace(PUNCTUATION, '') == '') {
            prev.text += item.text;
            item.text = '';
            return prev;
        }
        return item;
    });

    // Merge together subsequent words that correspond to a single
    // translation
    annotations.forEach(function (item, index) {
        if (item.note) {
            var delim = annotations[index + 1];
            var next = annotations[index + 2];

            if (next && next.note == item.note && /^\s*$/.test(delim.text)) {
                item.text = item.text + delim.text + next.text;
                delim.text = '';
                next.text = '';
            }
        }
    });

    annotations.forEach(function (item) {
        if (item.note && /^[!%&*()-=+–,.?;:]$/.test(item.note)) {
            delete item.note;
        }
    });

    return annotations.filter(function (item) {
        return item.text;
    });
}


module.exports = (app) => {
    app.post('/user/texts', (req, res, next) => {
        if (!req.user) return res.sendStatus(401);

        let target = req.body.target;
        let words = splitWords(req.body.text);
        let tags = createWordTags(words);
        let chunks = createChunks(tags.join(''));

        Q.all(chunks.map(
            (chunk) => requestTranslation(chunk.join(''), target)
        )).then((data) => {
            let text = '';
            data.forEach(((d) => text += d.text[0]));

            let annotations = mapNotes(
                words,
                extractTranslations(text)
            );

            addUntranslatedWords(
                [
                    { text: req.body.title },
                    { text: req.body.author }
                ].concat(annotations),
                target
            ).then((modifiedAnnotaions) => {
                let result = {
                    lang: data[0].detected.lang,
                    title: modifiedAnnotaions[0],
                    author: modifiedAnnotaions[1],
                    annotations: transformAnnotations(annotations)
                };
                let db = app.get('db');
                let userId = req.user.id;

                db.collection('annotations').insertOne(result).then((rec) => {
                    result._id = rec.insertedId.toString();

                    return db.collection('users').updateOne(
                        { id: userId },
                        { $addToSet: { texts: result._id } }
                    );
                }).then(() => res.json(result)).catch(next);

            }).catch(next);

        }).catch(next);
    });
};
