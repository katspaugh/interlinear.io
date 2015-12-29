import {Component, Input} from 'angular2/core';

import {Backend} from '../../services/backend';
import {Note} from '../../interfaces/note';

@Component({
    selector: 'definition',
    templateUrl: 'app/components/definition/definition.html',
    styleUrls: ['app/components/definition/definition.css']
})
export class Definition {
    @Input() term: Note;
    @Input() lang: string;
    text: string;
    note: string;
    definition: any[];

    constructor(private backend: Backend) {}

    ngOnChanges() {
        this.definition = null;

        if (!this.term) return;

        this.backend.get(`/wiktionary/${ this.lang }/${ this.term.text }`)
            .subscribe(
                data => this.definition = data,
                err => this.term = null
            );
    }
};
