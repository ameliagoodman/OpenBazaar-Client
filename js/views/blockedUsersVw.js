var __ = require('underscore'),
    Backbone = require('backbone'),
    $ = require('jquery'),
    baseVw = require('./baseVw'),
    blockedUserVw =  require('./blockedUserVw');

module.exports = baseVw.extend({

  className: '',

  events: {
  },

  initialize: function(options) {
    var self = this;

    this.options = options || {};
    this.subViews = [];

    this.listenTo(this.collection, 'update', function(collection, options) {
      var self = this;

      if (options.add) {
        __.each(collection.models.slice(self.subViews.length), function(user) {
          self.renderNewUserView(user);
        });
      }

      this.checkIfEmpty();
    });

    this.listenTo(this.collection, 'remove', function(md, cl, options) {
      var self = this,
          view;

      if (view = __.find(this.subViews, function(subView) {
        return subView.model.get('guid') === md.get('guid');
      })) {
        self.removeSubView(view);
      }

      this.checkIfEmpty();
    });
  },

  renderNewUserView: function(model) {
    var view;

    if (!model) return;

    view = new blockedUserVw({
      model: model
    });

    this.listenTo(view, 'unblockUserClick', this.unblockUserClick);
    this.subViews.push(view);
    this.registerChild(view);
    this.$el.append(view.render().el);
  },

  render: function(){
    var self = this;

    this.clearSubViews();
    this.$el.empty();

    this.collection.each(function(user) {
      self.renderNewUserView(user);
    });

    this.checkIfEmpty();

    return this;
  },

  delegateEvents: function() {
    if (this.subViews) {
      this.subViews.forEach((view) => {
        console.log('going for it');
        view.delegateEvents();
      });
    }

    baseVw.prototype.delegateEvents.apply(this, arguments);
  },

  checkIfEmpty: function() {
    if(this.collection.length == 0) {
      var noBlockSnippet = $('<div class="padding20 txt-center">' + polyglot.t('NoBlockedList') + '</div>');
      this.$el.html(noBlockSnippet);
    }
  },

  unblockUserClick: function(e) {
    this.model.unblockUser(e.view.model.get('guid'), this.model, this.options.serverUrl);
  },

  clearSubViews: function() {
    __.each(this.subViews, function(view) {
      view.remove();
    });

    this.subViews = [];
  },

  removeSubView: function(view) {
    var index;

    if (!view || (index = this.subViews.indexOf(view)) === -1) return;

    this.subViews[index].remove();
    this.subViews.splice(index, 1);
  }
});