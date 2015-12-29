import {Component, Input} from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';

@Component({
    selector: 'sample',
    templateUrl: 'app/components/sample/sample.html',
    styleUrls: ['app/components/sample/sample.css'],
    directives: [ROUTER_DIRECTIVES]
})
export class Sample {
    @Input() sample: string;
    @Input() showButton: boolean;

    constructor() {}
};

