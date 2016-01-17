import {Component, ViewEncapsulation, enableProdMode} from 'angular2/core';
import {Router, Route, RouteConfig, ROUTER_DIRECTIVES} from 'angular2/router';

import {Home} from './components/home/home';
import {Library} from './components/library/library';
import {Book} from './components/book/book';
import {AddBook} from './components/add-book/add-book';
import {Login} from './components/login/login';

import {Backend} from './services/backend';
import {UserVocab} from './services/user-vocab';


if (window.location.host == 'www.interlinear.io') {
    enableProdMode()
}


@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'interlinear-app',
    providers: [Backend, UserVocab],
    templateUrl: 'app/interlinear-app.html',
    styleUrls: ['app/interlinear-app.css'],
    directives: [ROUTER_DIRECTIVES, Login],
    pipes: []
})
@RouteConfig([
    new Route({ path: '/home', component: Home, name: 'Home', useAsDefault: true }),
    new Route({ path: '/library', component: Library, name: 'Library' }),
    new Route({ path: '/book/new', component: AddBook, name: 'AddBook' }),
    new Route({ path: '/book/:id', component: Book, name: 'Book' })
])
export class InterlinearApp {

  constructor() {}

};
