'use strict';

/**
 * Wiktionary
 */
let request = require('request-promise');

const LANGUAGES = { 'af': 'Afrikaans', 'sq': 'Albanian', 'ar': 'Arabic', 'hy': 'Armenian', 'az': 'Azerbaijani', 'eu': 'Basque', 'be': 'Belarusian', 'bs': 'Bosnian', 'bg': 'Bulgarian', 'ca': 'Catalan', 'zh': 'Chinese', 'hr': 'Croatian', 'cs': 'Czech', 'da': 'Danish', 'nl': 'Dutch', 'en': 'English', 'et': 'Estonian', 'fi': 'Finnish', 'fr': 'French', 'gl': 'Galician', 'ka': 'Georgian', 'de': 'German', 'el': 'Greek', 'ht': 'Haitian', 'he': 'Hebrew', 'hu': 'Hungarian', 'is': 'Icelandic', 'id': 'Indonesian', 'ga': 'Irish', 'it': 'Italian', 'ja': 'Japanese', 'kk': 'Kazakh', 'ky': 'Kirghiz', 'ko': 'Korean', 'la': 'Latin', 'lv': 'Latvian', 'lt': 'Lithuanian', 'mk': 'Macedonian', 'mg': 'Malagasy', 'ms': 'Malay', 'mt': 'Maltese', 'mn': 'Mongolian', 'no': 'Norwegian', 'fa': 'Persian', 'pl': 'Polish', 'pt': 'Portuguese', 'ro': 'Romanian', 'ru': 'Russian', 'sr': 'Serbian', 'sk': 'Slovak', 'sl': 'Slovenian', 'es': 'Spanish', 'sw': 'Swahili', 'sv': 'Swedish', 'tl': 'Tagalog', 'tg': 'Tajik', 'tt': 'Tatar', 'th': 'Thai', 'tr': 'Turkish', 'uk': 'Ukrainian', 'uz': 'Uzbek', 'vi': 'Vietnamese', 'cy': 'Welsh'
};

const WIKI_URL = 'https://en.wiktionary.org/w/api.php?format=json&action=mobileview&page=';


module.exports = (app) => {
    app.get('/wiktionary/:lang/:word', (req, res, next) => {
        let language = LANGUAGES[req.params.lang];

        request(
            WIKI_URL + req.params.word
        ).then((response) => {
            let data = JSON.parse(response);
            let sections = data.mobileview && data.mobileview.sections;

            if (!sections) return next('No data');

            let langSections = [];
            let langSect;

            for (let i = 0; i < sections.length; i++) {
                if (langSect && sections[i].toclevel == 1) {
                    break;
                }

                if (langSect) {
                    langSections.push(sections[i]);
                    continue;
                }

                if (sections[i].line == language) {
                    langSect = sections[i];
                }
            }

            let ids = langSections.map((section) => section.id);

            request(
                WIKI_URL + encodeURIComponent(req.params.word) + '&sections=' + ids.join('|')
            ).then((response) => {
                let data = JSON.parse(response);
                let sections = data.mobileview && data.mobileview.sections;

                if (!sections) return next('No data');

                sections = sections.filter((section) => {
                    return section.text;
                });

                // Make all links absolute
                sections.forEach((section) => {
                    let html = section.text
                            .replace(/ href="\/(?!\/)/g, ' href="https://en.wiktionary.org/')
                            .replace(/<a /g, '<a target="_blank" ');
                    section.text = html;
                });

                res.send(sections);
            });
        });
    });
};
