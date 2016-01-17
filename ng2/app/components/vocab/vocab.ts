import {Component, Input, Output, EventEmitter} from 'angular2/core';

import {Card} from '../../interfaces/card';
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
    @Output() wordSelect: EventEmitter<Card> = new EventEmitter();

    words: Card[];

    constructor(private userVocab: UserVocab) {}

    ngOnInit() {
        this.words = this.userVocab.load(this.id);
    }

    select(card: Card) {
        this.wordSelect.next(card);
    }

    remove(card: Card) {
        this.userVocab.remove(card);
    }

    exportVocab() {
        const header = '# Save this file and import into Anki or Memrise.\t\t\n';

        let words = this.words.map(
            (word: Card) => [ word.text, word.note, `...${ word.context }...` ].join('\t')
        );


        window.open('data:text/plain;charset=utf-8,' + encodeURIComponent(header + words.join('\n')));
    }
};
