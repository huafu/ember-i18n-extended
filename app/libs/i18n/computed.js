import Ember from 'ember';

var ecomp = Ember.computed;

function computed() {
  return ecomp.apply(null, arguments);
}

computed.readOnly = ecomp.readOnly;
computed.bool = ecomp.bool;

computed.ro = function () {
  return ecomp.apply(null, arguments).readOnly();
};

computed.readOnlyArray = function (path) {
  return computed.ro(function () {
    return Ember.A(this.get(path));
  });
};

export default computed;
