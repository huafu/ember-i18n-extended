var helpers;

helpers = require('./helpers');


function ContextNode(parent, name, astNode) {
  this.parent = parent;
  this.astNode = astNode;
  this.name = name;
}

(function (proto) {

  proto.children = function () {
    var parent = this;
    this._mustBe('ObjectExpression');
    if (!this._children) {
      if (this.astNode.properties) {
        this._children = this.astNode.properties.map(function (propertyNode) {
          var name = propertyNode.key.type === 'Identifier' ? propertyNode.key.name : propertyNode.key.value;
          return new ContextNode(parent, name, propertyNode.value);
        });
      }
      else {
        this._children = [];
      }
    }
    return this._children;
  };

  proto.hasChildren = function () {
    return this.is('ObjectExpression') && this.astNode.properties && this.astNode.properties.length;
  };

  proto.childForName = function (name) {
    return helpers.findBy(this.children(), 'name', name);
  };

  proto.addChild = function (name, value) {
    var children, childNode, child;
    if (this.childForName(name)) {
      throw new ReferenceError('Child with name `' + name + '` already exists.');
    }
    children = this.children();
    childNode = {
      type:  'Property',
      key:   {
        type: 'Identifier',
        name: name
      },
      value: helpers.astNodeFor(value)
    };
    if (this.astNode.properties) {
      this.astNode.properties.push(childNode);
    }
    else {
      this.astNode.properties = [childNode];
    }
    child = new ContextNode(this, name, childNode.value);
    children.push(child);
    return child;
  };

  proto.removeChild = function (name, deep, cleanup) {
    var child = this.childForName(name);
    if (child) {
      child.remove(deep, cleanup);
    }
    else {
      throw new ReferenceError('Unable to find node with name `' + name + '` at `' + this.fullPath() + '`.');
    }
  };

  proto.value = function (value) {
    var index;
    if (arguments.length < 1) {
      return eval(helpers.astToJs(this.astNode));
    }
    else {
      this.astNode = helpers.astNodeFor(value);
      if (this.parent) {
        index = this.parent.children().indexOf(this);
        this.parent.astNode.properties[index].value = this.astNode;
      }
      this._children = null;
    }
  };

  proto.remove = function (deep, cleanup) {
    var parentChildren, index;
    this._mustHaveParent();
    if (this.hasChildren() && !deep) {
      throw new Error('Can\'t delete child `' + this.name + '`, it is not empty.');
    }
    else {
      // remove from our own collection
      parentChildren = this.parent.children();
      index = parentChildren.indexOf(this);
      parentChildren.splice(index, 1);
      // remove from the node collection
      parentChildren = this.parent.astNode.properties;
      index = parentChildren.indexOf(this.astNode);
      parentChildren.splice(index, 1);
      // delete the parent if it now has no child
      if (cleanup && !this.parent.hasChildren() && !this.parent.isRoot()) {
        this.parent.remove(false, true);
      }
      this.parent = null;
    }
    return this;
  };

  proto.is = function (type) {
    return this.astNode.type === type;
  };

  proto.isRoot = function () {
    return !this.parent;
  };

  proto.isObject = function () {
    return this.is('ObjectExpression');
  };

  proto._mustBe = function (what) {
    if (!this.is(what)) {
      throw new TypeError('Node is not a `' + what + '`.');
    }
  };

  proto.fullPath = function () {
    return [this.parent ? this.parent.fullPath() : null, this.name].filter(Boolean).join('.');
  };

  proto._mustHaveParent = function () {
    if (!this.parent) {
      throw new TypeError('Node is the root node.');
    }
  };

})(ContextNode.prototype);


module.exports = ContextNode;
