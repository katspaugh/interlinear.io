import {Component} from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {Observable} from 'rxjs/Observable';

import {Backend} from '../../services/backend';
import {Sample} from '../../components/sample/sample';

@Component({
    selector: 'home',
    templateUrl: 'app/components/home/home.html',
    styleUrls: ['app/components/home/home.css'],
    directives: [ROUTER_DIRECTIVES, Sample]
})
export class Home {
    samples: Observable<any>;

    constructor(private backend: Backend) {
        this.samples = this.backend.get('/texts');
    }

    ngOnInit() {
        document.body.className = 'index';
    }

    ngOnDestroy() {
        document.body.className = '';
    }
};

