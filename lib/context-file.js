var helpers, ContextNode, fs, mkdirp;

fs = require('fs');
mkdirp = require('mkdirp');
helpers = require('./helpers');
ContextNode = require('./context-node');


function ContextFile(root, locale, name) {
  this.name = name;
  this.file = helpers.filePathForContext(root, locale, name);
}

(function (proto) {

  proto.fileExists = function () {
    if (this._fileExists == null) {
      this._fileExists = fs.existsSync(this.file);
    }
    return this._fileExists;
  };

  proto.astFile = function () {
    if (!this._astFile) {
      this._astFile = helpers.parseJsFile(this.file, 'export default {};');
    }
    return this._astFile;
  };

  proto.node = function () {
    var node;
    if (!this._node) {
      node = helpers.find(this.astFile().body, function (node) {
        return node.type === 'ExportDeclaration' && node.default;
      });
      if (!node) {
        throw new ReferenceError('Could not find the default export statement.');
      }
      this._node = new ContextNode(null, null, node.declaration);
    }
    return this._node;
  };

  proto.addKey = function (path, value, override) {
    var parts, node, part, child, isKey;
    parts = path.split('.');
    node = this.node();
    while ((part = parts.shift())) {
      isKey = !parts.length;
      if (node.isObject()) {
        child = node.childForName(part);
        if (!child) {
          child = node.addChild(part, isKey ? null : {});
        }
      }
      else if (override) {
        node.value({});
        child = node.addChild(part, isKey ? null : {});
      }
      else {
        throw new ReferenceError('A node already exists at `' + node.fullPath() + '`.');
      }
      node = child;
    }
    node.value(value);
  };

  proto.removeKey = function (path, allowObjects) {
    var parts, part, node, isKey, child;
    if (!this.fileExists()) {
      return;
    }
    parts = path.split('.');
    node = this.node();
    while ((part = parts.shift())) {
      isKey = !parts.length;
      if (node.isObject()) {
        child = node.childForName(part);
        if (!child) {
          // ok, no need to go deeper, we do not have such a path
          return this;
          //throw new ReferenceError('Unable to find node `' + part + '` at `' + node.fullPath() + '`.');
        }
      }
      /*else if (isKey) {
        throw new ReferenceError('Node at `' + node.fullPath() + '` is not an object, can\'t remove `' + path + '`.');
      }*/
      else{
        // ok one of our parent is not even an object
        return this;
      }
      node = child;
    }
    if (node.hasChildren() && !allowObjects) {
      throw new ReferenceError('Node at `' + node.fullPath() + '` has children, can\'t remove it.');
    }
    node.remove(true, true);
    return this;
  };

  proto.save = function () {
    if (!this._astFile) {
      return true;
    }
    return this.astFile().save();
  };

})(ContextFile.prototype);


ContextFile._instances = Object.create(null);

ContextFile.instanceFor = function (root, locale, name) {
  var key = helpers.filePathForContext(root, locale, name);
  if (!ContextFile._instances[key]) {
    ContextFile._instances[key] = new ContextFile(root, locale, name);
  }
  return ContextFile._instances[key];
};


module.exports = ContextFile;
