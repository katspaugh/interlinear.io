import {Component} from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';

import {Backend} from '../../services/backend';

@Component({
    selector: 'login',
    templateUrl: 'app/components/login/login.html',
    styleUrls: ['app/components/login/login.css'],
    directives: [ROUTER_DIRECTIVES]
})
export class Login {
    profile: any;

    constructor(private backend: Backend) {
        backend.get('/user/profile')
            .subscribe((data) => this.profile = data);
    }
};

/**
 * Facebook redirect
 */
if (window.location.hash && window.location.hash == '#_=_') {
    window.location.href = '/';
}
