import Ember from 'ember';

var ecomp = Ember.computed;
var slice = [].slice;
var UNDEFINED = Object.create(null);

function computed() {
  return ecomp.apply(null, arguments);
}

computed.readOnly = ecomp.readOnly;
computed.bool = ecomp.bool;
computed.oneWay = ecomp.oneWay;
computed.alias = ecomp.alias;


computed.overridable = function () {
  var keys = slice.call(arguments);
  var func = keys.pop();
  var defined = UNDEFINED;
  return ecomp.apply(null, keys.concat([function (key, value) {
    if (arguments.length > 1) {
      defined = value;
    }
    else {
      if (defined === UNDEFINED) {
        value = func.apply(this, arguments);
      }
      else {
        value = defined;
      }
    }
    return value;
  }]));
};

computed.overridableAny = function () {
  var keys = slice.call(arguments);
  return computed.overridable.apply(null, keys.concat([
    function () {
      var i, val;
      for (i = 0; i < keys.length; i++) {
        val = this.get(keys[i]);
        if (val) {
          return val;
        }
      }
    }
  ]));
};

computed.anyDefined = function () {
  var keys = slice.call(arguments);
  return computed.ro.apply(null, keys.concat([function () {
    var res, i;
    for (i = 0; i < keys.length; i++) {
      if ((res = this.get(keys[i])) !== undefined) {
        return res;
      }
    }
  }]));
};

computed.ro = function () {
  return ecomp.apply(null, arguments).readOnly();
};

computed.readOnlyArray = function (path) {
  return computed.ro(function () {
    return Ember.A(this.get(path));
  });
};

export default computed;
