import Ember from 'ember';

var computed = Ember.computed;
var run = Ember.run;
var readOnly = computed.readOnly;
var slice = [].slice;
var map = Ember.EnumerableUtils.map;

var I18nMockNode;
I18nMockNode = Ember.Object.extend({
  parentNode: null,
  nodeName:   null,

  fullPath: computed('parentNode', 'nodeName', function () {
    var res = [], part;
    if ((part = this.get('parentNode.fullPath'))) {
      res.push(part);
    }
    if ((part = this.get('nodeName'))) {
      res.push(part);
    }
    return res.join('.');
  }),

  s: readOnly('fullPath'),

  translateFunction: computed('s', function () {
    var key = this.get('fullPath');
    return function () {
      return [key].concat(map(slice.call(arguments), function (value) {
        if (value == null || value === false) {
          return '';
        }
        return String(value);
      })).join('|');
    };
  }),

  t: function () {
    return this.get('translateFunction').apply(null, arguments);
  },

  unknownProperty: function (key) {
    var res;
    this.set(key, res = I18nMockNode.create({
      parentNode: this,
      nodeName:   key
    }));
    return res;
  }

});

export default function i18nMock(app) {
  return run(I18nMockNode, 'create');
}
