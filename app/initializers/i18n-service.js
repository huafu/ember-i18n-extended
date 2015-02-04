import Ember from 'ember';
import '../libs/i18n/ember-overrides';

import {t} from '../helpers/t';
import {tBindAttr} from '../helpers/t-bind-attr';

Ember.Handlebars.registerHelper('t', t);
Ember.Handlebars.registerHelper('t-bind-attr', tBindAttr);

export function initialize(container, application) {
  application.inject('route', 'i18nService', 'service:i18n');
  application.inject('controller', 'i18nService', 'service:i18n');
  application.inject('view', 'i18nService', 'service:i18n');
  application.inject('component', 'i18nService', 'service:i18n');
}

export default {
  name:       'i18n-service',
  initialize: initialize
};
