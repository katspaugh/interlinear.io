import {Injectable} from 'angular2/core';

import {Backend} from './backend';
import {Card} from '../interfaces/card';

@Injectable()
export class UserVocab {
    private store: { [bookId: string]: Card[] } = {};

    constructor(private backend: Backend) {}

    private loadVocab(bookId: string) {
        let store = this.store[bookId] = this.store[bookId] || [];

        this.backend.get(`/vocab/${ bookId }`)
            .subscribe(
                data => store.unshift(...data),
                err => store
            );
    }

    private addVocab(card: Card) {
        this.backend.post(`/vocab`, card)
            .subscribe(() => null);
    }

    private removeVocab(card: Card) {
        this.backend.delete(`/vocab`, { _id: card._id })
            .subscribe(() => null);
    }

    add(card: Card) {
        let bookId = card.bookId;
        let store = this.store[bookId] = this.store[bookId] || [];

        let isUnique = store.every((item) => {
            return item.note != card.note && item.text != card.text;
        });

        if (isUnique) {
            this.addVocab(card);
            store.unshift(card);
        }
    }

    remove(card: Card) {
        let bookId = card.bookId;
        let store = this.store[bookId] = this.store[bookId] || [];
        store.splice(store.indexOf(card), 1);
        this.removeVocab(card);
    }

    load(bookId: string) {
        let store = this.store[bookId] = this.store[bookId] || [];
        this.loadVocab(bookId);
        return store;
    }
};
