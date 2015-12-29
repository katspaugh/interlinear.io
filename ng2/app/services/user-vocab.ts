import {Injectable} from 'angular2/core';

import {Backend} from './backend';
import {Note} from '../interfaces/note';

@Injectable()
export class UserVocab {
    private store: { [id: string]: Note[] } = {};

    constructor(private backend: Backend) {}

    private loadVocab(id: string) {
        this.backend.get(`/user/vocab/${ id }`)
            .subscribe(
                data => this.store[id].unshift(...data.words),
                err => this.store[id]
            );
    }

    private addVocab(id: string, note: Note) {
        this.backend.put(`/user/vocab/${ id }`, {
            word: note
        }).subscribe(() => null);
    }

    private removeVocab(id: string, note: Note) {
        this.backend.put(`/user/vocab/${ id }/remove`, {
            word: note
        }).subscribe(() => null);
    }

    add(id: string, note: Note) {
        let store = this.store[id] = this.store[id] || [];

        let isUnique = store.every((item) => {
            return item.note != note.note && item.text != note.text;
        });

        if (isUnique) {
            this.addVocab(id, note);
            store.unshift(note);
        }
    }

    remove(id: string, note: Note) {
        let store = this.store[id] = this.store[id] || [];
        store.splice(store.indexOf(note), 1);
        this.removeVocab(id, note);
    }

    load(id: string) {
        let store = this.store[id] = this.store[id] || [];
        this.loadVocab(id);
        return store;
    }
};
