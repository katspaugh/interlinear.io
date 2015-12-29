import {Component, Input, Output, EventEmitter} from 'angular2/core';

import {Note} from '../../interfaces/note';
import {UserVocab} from '../../services/user-vocab';
import {Magnet} from '../magnet/magnet';

@Component({
    selector: 'vocab',
    templateUrl: 'app/components/vocab/vocab.html',
    styleUrls: ['app/components/vocab/vocab.css'],
    directives: [Magnet]
})
export class Vocab {
    @Input() id: string;
    @Output() wordSelect: EventEmitter<Note> = new EventEmitter();

    words: Note[];

    constructor(private userVocab: UserVocab) {}

    ngOnInit() {
        this.words = this.userVocab.load(this.id);
    }

    select(item) {
        this.wordSelect.next(item);
    }

    remove(item) {
        this.userVocab.remove(this.id, item);
    }

    exportVocab() {
        let words = [{
            text: '# Save this page as a .txt file and import it into Anki or Memrise.',
            note: ''
        }].concat(this.words).map(
            word => word.text + '\t' + word.note
        ).join('\n');

        window.open('data:text/plain;charset=utf-8,' + encodeURIComponent(words));
    }
};
