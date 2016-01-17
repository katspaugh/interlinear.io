import {Injectable} from 'angular2/core';
import {Http, Headers} from 'angular2/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Injectable()
export class Backend {
    private base: string = '';

    constructor(private http: Http) {}

    private request(method: string, path: string, data: any = null) {
        let url = `${ this.base }${ path }`;
        let body = data ? JSON.stringify(data) : '';

        return this.http.request(url, {
            body: body,
            method: method,
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        }).map(res => res.json());
    }

    get(path: string) {
        let url = `${ this.base }${ path }`;
        return this.http.get(url).map(res => res.json());
    }

    post(path: string, data: any = null) {
        return this.request('POST', path, data);
    }

    put(path: string, data: any = null) {
        return this.request('PUT', path, data);
    }

    delete(path: string, data: any = null) {
        return this.request('DELETE', path, data);
    }
};
