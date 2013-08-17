/**
 * @module backbone-survey-card
 */

var BackboneSurvey = BackboneSurvey || {};

// Templates
// ---------
(function() {
  BackboneSurvey.Templates = BackboneSurvey.Templates || {};

  /**
   * @property TextDialogView
   * @type {String}
   */
  BackboneSurvey.Templates.TextDialogView =
    '<div class="<%- elPrefix %>dialog-container">' +
      '<div class="<%- elPrefix %>dialog-inner">' +
        '<div><span class="<%- elPrefix %>dialog-note"><%- sub.note %></div>' +
        '<input class="<%- elPrefix %>dialog-input" type="text"' +
          ' placeholder="<%- sub.placeholder %>">' +
        '<button class="<%- elPrefix %>dialog-submit">OK</button>' +
        '<button class="<%- elPrefix %>dialog-cancel">Cancel</button>' +
      '</div>' +
    '</div>';

  /**
   * @property CardDialogView
   * @type {String}
   */
  BackboneSurvey.Templates.CardAnswerView =
    '<ul>' +
    '<% _.each(model.options, function(option, i) { %>' +
      '<li>' +
      '<label data-answer-index="<%- i %>">' +
      '<span class="<%- elPrefix %>label"></span>' +
      '</label>' +
      '</li>' +
    '<% }); %>' +
    '</ul>' +
    '<% _.each(model.options, function(option, i) { %>' +
      '<% if (option.sub) { %>' +
        '<div id="<%- elPrefix %>sub-<%- model.id %>-<%- i %>">' +
        '<di>' +
          '<dt><%= option.sub.note %></dt>' +
          '<dd><input name="sub-<%- model.id %>-<%- i %>" type="text"' +
            ' placeholder="<%- option.sub.placeholder %>"></dd>' +
        '</di>' +
        '</div>' +
      '<% } %>' +
    '<% }); %>';

  /**
   * Alias of CardAnswerView
   *
   * @deprecated
   * @property ImageCardDialogView
   * @type {String}
   */
  BackboneSurvey.Templates.ImageCardAnswerView = BackboneSurvey.Templates.CardAnswerView;

  /**
   * @deprecated
   * @property TextCardDialogView
   * @type {String}
   */
  BackboneSurvey.Templates.TextCardAnswerView =
    '<ul>' +
    '<% _.each(model.options, function(option, i) { %>' +
      '<li>' +
      '<input type="<%- multiple ? "checkbox" : "radio" %>"' +
      ' id="<%- elPrefix %>answer-<%- model.id %>-<%- i %>"' +
      ' name="answer-<%- model.id %>"' +
      ' data-answer-index="<%- i %>">' +
      '<label for="<%- elPrefix %>answer-<%- model.id %>-<%- i %>">' +
        '<span class="<%- elPrefix %>label"></span>' +
      '</label>' +
      '</li>' +
    '<% }); %>' +
    '</ul>' +
    '<% _.each(model.options, function(option, i) { %>' +
      '<% if (option.sub) { %>' +
        '<div id="<%- elPrefix %>sub-<%- model.id %>-<%- i %>">' +
        '<di>' +
          '<dt><%= option.sub.note %></dt>' +
          '<dd><input name="sub-<%- model.id %>-<%- i %>" type="text"' +
            ' placeholder="<%- option.sub.placeholder %>"></dd>' +
        '</di>' +
        '</div>' +
      '<% } %>' +
    '<% }); %>';
})();

// Views
// -----
(function() {
  /**
   * @class TextDialogView
   */
  BackboneSurvey.TextDialogView = Backbone.View.extend({
    templateName: "TextDialogView"

  , elPrefix : "survey-"

  , render: function(params) {
      params = _.extend({ elPrefix: this.elPrefix }, params || {});
      this.$el.html(_.template(BackboneSurvey.Templates[this.templateName])(params));

      var me = this;
      this.$('.' + this.elPrefix + 'dialog-submit').on("click", function() {
        me.trigger("submit");
      });
      this.$('.' + this.elPrefix + 'dialog-cancel').on("click", function() {
        me.trigger("cancel");
      });

      return this;
    }

  , answers: function() {
      var v = this.$('.' + this.elPrefix + 'dialog-input').val();
      return _.isEmpty(v) ? [""] : [v];
    }
  });

  /**
   * @class CardAnswerView
   */
  BackboneSurvey.CardAnswerView = Backbone.View.extend({
    /**
     * @property templateName
     * @type {String}
     */
    templateName: "CardAnswerView"

    /**
     * A view name for the dialog operation.
     *
     * @property dialogName
     * @type {String}
     */
  , dialogName: "TextDialogView"

    /**
     * A jQuery object for TextDialogView.
     * Set NULL (as default) for the inline fields.
     *
     * @property $dialog
     * @type {Object}
     */
  , $dialog: null

  , elPrefix: "survey-"

  , initialize: function() {
      this.multiple = this.model.get("type").multiple();
      this._locked = false;
      if (_.isString(this.$dialog)) {
        this.$dialog = $(this.$dialog);
      }
    }

    /**
     * Returns all option elements.
     *
     * @protected
     * @method _items
     * @return {Object}
     */
  , _items: function() {
      return this.$('label[data-answer-index]');
    }

    /**
     * Returns selected option elements.
     *
     * @protected
     * @method _selectedItems
     * @return {Object}
     */
  , _selectedItems: function() {
      var me = this;
      var $items = this._items().filter(function() {
        return $(this).hasClass(me.elPrefix + "selected");
      });
      return $items;
    }

    /**
     * Returns a select event string like "click".
     *
     * @protected
     * @method _selectEvent
     * @return {String}
     */
  , _selectEvent: function() {
      return "click";
    }

    /**
     * A hook function after selecting an item.
     *
     * @protected
     * @method _afterSelect
     * @param {Object} $item A selected item element
     */
  , _afterSelect: function($item) {
      var sel = this.elPrefix + "selected";
      if (this.multiple) {
        $item.toggleClass(sel);
      } else {
        // Remove all, then add to it.
        this.$('[data-answer-index]').removeClass(sel);
        $item.addClass(sel);
      }
    }

    /**
     * Returns boolean that an item is selected or not.
     *
     * @protected
     * @param {Object} $item An item element
     * @method _isSelectedItem
     */
  , _isSelectedItem: function($item) {
      return $item.hasClass(this.elPrefix + "selected");
    }

    /**
     * Manipulate the select operation.
     *
     * @protected
     * @method _selectItem
     * @param {Object} $item An item element
     * @param {Boolean} bool Select or not
     */
  , _selectItem: function($item, bool) {
      var sel = this.elPrefix + "selected";
      if (bool) {
        $item.addClass(sel);
      } else {
        $item.removeClass(sel);
      }
    }

    /**
     * Returns a label for an item.
     *
     * @protected
     * @method _selectItem
     * @param {Object} $item An item element
     * @return {Object} $item A label element
     */
  , _labelFor: function($item) {
      return $item.find('.' + this.elPrefix + 'label');
    }

  , _prepare: function() {
      var me = this;
      var answers = this.model.get("answers") || [];
      var options = this.model.get("options") || [];
      var subAnswer = this.model.get("subAnswer") || {};
      _.each(options, function(opt, i) {
        var $item = me.$('[data-answer-index="' + i + '"]');
        if (_.contains(answers, opt.value)) {
          me._selectItem($item, true);
        } else {
          me._selectItem($item, false);
        }
        var $label = me._labelFor($item);
        if (me.useDialog() && !_.isEmpty(subAnswer[opt.value])) {
          $label.text(subAnswer[opt.value]);
        } else {
          $label.html(opt.label);
        }

        // Show|Hide each answer.
        if (opt.sub) {
          var $subInput = me.$('input[name="sub-' + me.model.id + '-' + i + '"]');
          $subInput.attr("value", subAnswer[opt.value] || "");
        }
        var $sub = me.$('#' + me.elPrefix + 'sub-' + me.model.id + '-' + i);
        if (_.contains(answers, opt.value)) {
          $sub.show();
        } else {
          $sub.hide();
        }
      });
    }

  , _normalize: function($changed) {
      var me = this;
      var singleOptions = this.model.get("singleOptions");
      var options = this.model.get("options");
      var sel = this.elPrefix + "selected";
      if (this._isSelectedItem($changed)) {
        var idx = parseInt($changed.attr("data-answer-index"), 10);
        var f = _.contains(singleOptions, options[idx].value) ?
          function() {
            // Uncheck other options.
            var i = parseInt($(this).attr("data-answer-index"), 10);
            return idx != i;
          } :
          function() {
            // Uncheck single options.
            var i = parseInt($(this).attr("data-answer-index"), 10);
            return _.contains(singleOptions, options[i].value);
          };
        this.$('[data-answer-index]').filter(f)
          .each(function() { me._selectItem($(this), false); });
      }
      var answers = this.answers();
      _.each(options, function(opt, i) {
        var $sub = me.$('#' + me.elPrefix + 'sub-' + me.model.id + '-' + i);
        if (!me.useDialog() && _.contains(answers, opt.value)) {
          $sub.show();
        } else {
          $sub.hide();
        }
      });
    }

  , useDialog: function() {
      return (this.$dialog !== null);
    }

  , lock: function() {
      this._locked = true;
    }

  , unlock: function() {
      this._locked = false;
    }

  , render: function() {
      var me = this;

      this.$el.html(_.template(BackboneSurvey.Templates[this.templateName])({
        elPrefix: this.elPrefix
      , multiple: this.multiple
      , model: this.model.toJSON()
      }));

      this._prepare(); // Prepare initial answers.

      var options = this.model.get("options");

      this._items().each(function () {
        // Initialize items
        me._normalize($(this));

      }).on(this._selectEvent(), function() {
        if (me._locked) return;

        var $this = $(this);
        me._afterSelect($this);
        me._normalize($this);

        var idx = parseInt($this.attr("data-answer-index"), 10);
        var sub = options[idx].sub;
        if (sub) {
          var $subInput = me.$('input[name="sub-' + me.model.id + '-' + idx + '"]');
          if (me.useDialog() && me._isSelectedItem($this)) {
            // Use the dialog view for a sub answer text.
            var dialogView = new BackboneSurvey[me.dialogName]({
              className: me.elPrefix + 'dialog' });
            dialogView.elPrefix = me.elPrefix;
            // Fire the "lock" event while opening the dialog.
            me.trigger("lock");
            dialogView.on("submit", function() {
              var ans = dialogView.answers() || [""];
              // Fill the sub answer text.
              $subInput.attr("value", ans[0]);
              // Replace the label content.
              var $label = me._labelFor($this);
              if (_.isEmpty(ans[0])) {
                $label.html(options[idx].label);
              } else {
                $label.text(ans[0]);
              }
              // Close the dialog
              me.$dialog.hide();
              me.trigger("unlock");
              me.trigger("answer");
            });
            dialogView.on("cancel", function() {
              me.$dialog.hide();
              me.trigger("unlock");
            });
            var params = { sub: sub };
            me.$dialog.html(dialogView.render(params).el);
            me.$dialog.find('input[class="' + me.elPrefix + 'dialog-input"]').val($subInput.val());
            me.$dialog.show();
          }
        }
        me.trigger("answer");
      });
      return this;
    }

  , answers: function() {
      var vs = [];
      var options = this.model.get("options") || [];
      this._selectedItems().each(function() {
        var $this = $(this);
        var idx = parseInt($this.attr("data-answer-index"), 10);
        vs.push(options[idx].value);
      });
      return vs;
    }

  , subAnswer: function() {
      var sub = {};
      var options = this.model.get("options");
      var answers = this.answers();
      var me = this;
      _.each(options, function(opt, i) {
        if (!opt.sub) return;
        if (!_.contains(answers, opt.value)) return;
        var $ov = me.$('input[name^="sub-' + me.model.id + '-' + i + '"]');
        if (!_.isEmpty($ov.val())) {
          sub[opt.value] = $ov.val();
        }
      });
      return sub;
    }
  });

  /**
   * Alias of CardAnswerView
   *
   * @deprecated
   * @class ImageCardAnswerView
   */
  BackboneSurvey.ImageCardAnswerView = BackboneSurvey.CardAnswerView;

  /**
   * @deprecated
   * @class TextCardAnswerView
   */
  BackboneSurvey.TextCardAnswerView = BackboneSurvey.CardAnswerView.extend({
    templateName: "TextCardAnswerView"

  , _items: function() {
      return this.$('input[name^="answer-"][data-answer-index]');
    }

  , _selectedItems: function() {
      var me = this;
      return this._items().filter(function() {
        return $(this).prop("checked");
      });
    }

  , _selectEvent: function() {
      return "change";
    }

  , _afterSelect: function($item) {
    }

  , _isSelectedItem: function($item) {
      return $item.prop("checked");
    }

  , _selectItem: function($item, bool) {
      if (bool) {
        $item.prop("checked", true).attr("checked", "checked");
      } else {
        $item.prop("checked", false).removeAttr("checked");
      }
    }

  , _labelFor: function($item) {
      return this.$('label[for="' + $item.attr("id") + '"] .' + this.elPrefix + 'label');
    }

  , lock: function() {
      this._locked = true;
      this._items().each(function() {
        $(this).prop("disabled", true);
      });
    }

  , unlock: function() {
      this._locked = false;
      this._items().each(function() {
        $(this).prop("disabled", false);
      });
    }
  });
})();
