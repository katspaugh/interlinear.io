import {Component} from 'angular2/core';
import {RouteParams, ROUTER_DIRECTIVES} from 'angular2/router';
import {Observable} from 'rxjs/Observable';

import {Backend} from '../../services/backend';
import {Sample} from '../../components/sample/sample';

@Component({
    selector: 'library',
    templateUrl: 'app/components/library/library.html',
    styleUrls: ['app/components/library/library.css'],
    directives: [ROUTER_DIRECTIVES, Sample]
})
export class Library {
    books: Observable<any>;

    constructor(private backend: Backend, params: RouteParams) {
        this.books = this.backend.get('/user/texts');
    }
};
