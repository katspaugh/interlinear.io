import {bootstrap} from 'angular2/platform/browser';
import {HTTP_PROVIDERS} from 'angular2/http';
import {ROUTER_PROVIDERS} from 'angular2/router';

import {InterlinearApp} from './app/interlinear-app';

bootstrap(InterlinearApp, [HTTP_PROVIDERS, ROUTER_PROVIDERS])
  .catch(err => console.error(err));
