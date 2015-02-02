import Ember from 'ember';
import I18nTranslationComponent from '../components/i-t';

var viewHelper = Ember.Handlebars.helpers.view;
var slice = [].slice;
var ControllerMixin = Ember.ControllerMixin;

// strongly inspired by ember link view

export function t() {
  var key, keyType;
  var options = slice.call(arguments, -1)[0];
  var params = slice.call(arguments, 0, -1);
  var view = options.data.view;
  var hash = options.hash;
  var types = options.types || [];
  //var shouldEscape = !hash.unescaped;

  if (!options.fn) {
    key = params.shift();
    keyType = types.shift();
    if (keyType === 'ID') {
      hash.key = key = view.getStream(key);
      /*options.fn = function () {
       return stringifyValue(key.value(), shouldEscape);
       };*/
    }
    else {
      hash.key = key;
    }
    /*else {
     options.fn = function () {
     return key;
     };
     }*/
  }
  else {
    throw new Error('The `t` helper is not a block helper.');
  }

  // Setup param streams
  for (var i = 0; i < params.length; i++) {
    var paramPath = params[i];
    if (types[i] === 'ID') {
      var lazyValue = view.getStream(paramPath);

      // TODO: Consider a better approach to unwrapping controllers.
      if (paramPath !== 'controller') {
        while (ControllerMixin.detect(lazyValue.value())) {
          paramPath = (paramPath === '') ? 'model' : paramPath + '.model';
          lazyValue = view.getStream(paramPath);
        }
      }
      params[i] = lazyValue;
    }
  }

  hash.params = params;

  options.helperName = options.helperName || 't';

  return viewHelper.call(this, I18nTranslationComponent, options);
}

export default Ember.Handlebars.makeBoundHelper(t);
