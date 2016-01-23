import {Component} from 'angular2/core';
import {Router, RouteParams} from 'angular2/router';

import {Backend} from '../../services/backend';
import {UserVocab} from '../../services/user-vocab';
import {Note} from '../../interfaces/note';
import {Card} from '../../interfaces/card';
import {Definition} from '../definition/definition';
import {Vocab} from '../vocab/vocab';
import {Sticky} from '../sticky/sticky';

const DELIMS: string = ',.!?;:–«»‹›()';
const DELIMS_RE: RegExp = new RegExp(`[${ DELIMS }]`, 'g');


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
    isSpecial: boolean = true;

    currentTerm: Note;
    showTranslation: boolean = true;

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
            item.index = index;

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

    private getContext(index: number): string {
        const range: number = 30;

        let start = Math.max(index - range, 0);
        let end = Math.min(start + range * 2, this.annotations.length - 1);
        let slice = this.annotations.slice(start, end);
        let text = slice.map((note: Note) => note.text).join('').trim();

        return text;
    }

    public selectTerm(note: Note) {
        this.currentTerm = {
            index: note.index,
            text: note.text.replace(DELIMS_RE, ''),
            note: note.note
        };

        let card: Card = {
            bookId: this.id,
            text: this.currentTerm.text,
            note: this.currentTerm.note,
            position: note.index,
            context: this.getContext(note.index)
        };

        this.userVocab.add(card);
    }

    public remove() {
        this.backend.delete(`/texts/${ this.id }`)
            .subscribe(
                () => this.router.navigate(['/Library']),
                (err) => err
            );
    }
};
