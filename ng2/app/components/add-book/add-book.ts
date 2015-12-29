import {Component} from 'angular2/core';
import {Router} from 'angular2/router';

import {Backend} from '../../services/backend';

const LANGUAGES = {
    'en': 'English',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'ja': 'Japanese',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'es': 'Spanish',
    'tg': 'Tajik'
};

const DEFAULT_LANGUAGE = 'en';

@Component({
    selector: 'add-book',
    templateUrl: 'app/components/add-book/add-book.html',
    styleUrls: ['app/components/add-book/add-book.css']
})
export class AddBook {
    languages: any[];

    model: {
        title: string,
        author: string,
        text: string,
        url: string,
        target: string
    };

    isSaving: boolean;

    constructor(private backend: Backend, private router: Router) {
        this.languages = Object.keys(LANGUAGES).map(key => {
            return { code: key, name: LANGUAGES[key] }
        });

        this.model = {
            title: '',
            author: '',
            text: '',
            url: '',
            target: DEFAULT_LANGUAGE
        };
    }

    loadFromUrl() {
        this.isSaving = true;

        this.backend.get(`/scrap/?url=${ this.model.url }`)
            .subscribe(
                data => {
                    this.model.author = data.author;
                    this.model.title = data.title;
                    this.model.text = data.text;

                    this.isSaving = false;
                },
                err => this.isSaving = false
            );

    }

    submit() {
        this.isSaving = true;

        this.backend.post('/user/texts', this.model)
            .subscribe(
                data => {
                    this.isSaving = false;
                    this.router.navigate([ 'Book', { id: data._id } ]);
                },
                err => this.isSaving = false
            )

    }
};
