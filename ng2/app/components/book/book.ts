import {Component} from 'angular2/core';
import {Router, RouteParams} from 'angular2/router';

import {Backend} from '../../services/backend';
import {UserVocab} from '../../services/user-vocab';
import {Note} from '../../interfaces/note';
import {Definition} from '../definition/definition';
import {Vocab} from '../vocab/vocab';
import {Sticky} from '../sticky/sticky';

const DELIMS = ',.!?;:–«»‹›()';
const DELIMS_RE = new RegExp(`[${ DELIMS }]`, 'g');


@Component({
    selector: 'book',
    templateUrl: 'app/components/book/book.html',
    styleUrls: ['app/components/book/book.css'],
    directives: [Definition, Vocab, Sticky]
})
export class Book {
    id: string;
    lang: string;
    title: Note;
    author: Note;
    annotations: Note[];
    isSpecial = true;

    currentTerm: Note;
    showTranslation = true;

    constructor(
        private backend: Backend,
        private userVocab: UserVocab,
        private router: Router,
        params: RouteParams
    ) {
        this.id = params.get('id');

        this.backend.get(`/texts/${ this.id }`).subscribe(
            data => {
                this.lang = data.lang;
                this.title = data.title;
                this.author = data.author;
                this.isSpecial = data.isSpecial;
                this.annotations = this.transform(data.annotations);
            },
            err => this.router.navigate(['/Library'])
        );
    }

    private transform(annotations: Note[]): Note[] {
        // Mark non-unique notes
        let unique = {};

        annotations.forEach(function (item, index) {
            item.id = 'item_' + index;

            if (item.note) {
                var key = item.note.toLowerCase() + '//' +
                    item.text.replace(DELIMS_RE, '').trim().toLowerCase();

                if (unique[key]) {
                    item.dupe = Math.min(unique[key], 4);
                    unique[key] += 1;
                } else {
                    unique[key] = 1;
                }
            }
        });

        return annotations;
    }

    public selectTerm(note: Note) {
        this.currentTerm = {
            id: note.id,
            text: note.text.replace(DELIMS_RE, ''),
            note: note.note
        };

        this.userVocab.add(this.id, this.currentTerm);
    }

    public toggleTranslation

    public remove() {
        this.backend.delete(`/texts/${ this.id }`)
            .subscribe(
                () => this.router.navigate(['/Library']),
                (err) => err
            );
    }
};
