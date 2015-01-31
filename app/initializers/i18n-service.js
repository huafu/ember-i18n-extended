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
