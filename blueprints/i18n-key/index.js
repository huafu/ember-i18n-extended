var helpers = require('../../lib/helpers');
var ContextFile = require('../../lib/context-file');
var contextBlueprint = require('../i18n-context');
var SilentError = require('../../node_modules/ember-cli/lib/errors/silent');
var fs = require('fs');

var self;

module.exports = self = {
  description: 'Add/update an i18n key into a context file with given text (example: `my_context.path.to.the.key`).',

  availableOptions: contextBlueprint.availableOptions.concat([
    {
      name:    'text',
      type:    String,
      default: ''
    },
    {
      name:    'override',
      type:    Boolean,
      default: false
    }
  ]),

  beforeInstall: function (options) {
    var locals;
    contextBlueprint.beforeInstall(options);
    if (options.entity.name.indexOf('.') === -1) {
      throw new SilentError(
        'You must prepend the key with its context name like `the_context.' + options.entity.name + '`.'
      );
    }
  },

  beforeUninstall: function (options) {
    var locals;
    contextBlueprint.beforeUninstall(options);
    if (options.entity.name.indexOf('.') === -1) {
      throw new SilentError(
        'You must prepend the key with its context name like `the_context.' + options.entity.name + '`.'
      );
    }
  },

  locals: function (options) {
    var locals, keyFullPath;
    locals = contextBlueprint.locals(options);
    keyFullPath = helpers.cleanupKeyFullPath(options.entity.name);
    locals.context = helpers.contextForPath(keyFullPath);
    locals.keyFullPath = keyFullPath.split('.').slice(1).join('.');
    locals.text = options.text || '';
    locals.override = Boolean(options.override);
    locals.contextFile = ContextFile.instanceFor(options.project.root, locals.locale, locals.context);
    return locals;
  },

  afterInstall: function (options) {
    var locals = self.locals(options), ctx = locals.contextFile;
    if (!options.dryRun) {
      try {
        ctx.addKey(locals.keyFullPath, locals.text, locals.override);
      }
      catch (e) {
        throw new SilentError(e.message);
      }
      ctx.save();
    }
  },

  afterUninstall: function (options) {
    var locals = self.locals(options), ctx = locals.contextFile;
    if (!options.dryRun && ctx.fileExists()) {
      try {
        ctx.removeKey(locals.keyFullPath, locals.override);
      }
      catch (e) {
        throw new SilentError(e.message);
      }
      ctx.save();
    }
  }
};
