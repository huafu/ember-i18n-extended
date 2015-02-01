var hasOwn = Object.prototype.hasOwnProperty;


export default function (object) {
  var has$ = false;
  if (object && typeof object === 'object') {
    for (var key in object) {
      if (hasOwn.call(object, key)) {
        if (key === '$') {
          has$ = true;
        }
        else {
          return false;
        }
      }
    }
  }
  return has$;
}
