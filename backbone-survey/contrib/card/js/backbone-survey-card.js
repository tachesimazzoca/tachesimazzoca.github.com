/**
 * @module backbone-survey-card
 */

var BackboneSurvey = BackboneSurvey || {};

// Templates
// ---------
(function() {
  BackboneSurvey.Templates = BackboneSurvey.Templates || {};

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

  BackboneSurvey.Templates.ImageCardAnswerView =
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
   * @class ImageCardAnswerView
   */
  BackboneSurvey.ImageCardAnswerView = Backbone.View.extend({
    templateName: "ImageCardAnswerView"

  , dialogName: "TextDialogView"

  , $dialog: null

  , elPrefix: "survey-"

  , initialize: function() {
      this.multiple = this.model.get("type").multiple();
      this._locked = false;
      if (_.isString(this.$dialog)) {
        this.$dialog = $(this.$dialog);
      }
    }

  , _normalize: function($changed) {
      var me = this;
      var singleOptions = this.model.get("singleOptions");
      var options = this.model.get("options");
      var sel = this.elPrefix + "selected";
      if ($changed.hasClass(sel)) {
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
        this.$('[data-answer-index]').filter(f).removeClass(sel);
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
      this.$el.html(_.template(BackboneSurvey.Templates[this.templateName])({
        elPrefix: this.elPrefix
      , model: this.model.toJSON()
      }));

      var me = this;
      var sel = this.elPrefix + "selected";

      // Prepare initial answers.
      var answers = this.model.get("answers") || [];
      var options = this.model.get("options") || [];
      var subAnswer = this.model.get("subAnswer") || {};
      _.each(options, function(opt, i) {
        var $selected = me.$('[data-answer-index="' + i + '"]');
        if (_.contains(answers, opt.value)) {
          $selected.addClass(sel);
        } else {
          $selected.removeClass(sel);
        }
        var $label = $selected.find('.' + me.elPrefix + 'label');
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

      // options
      this.$('label').each(function () {
        me._normalize($(this));

      }).on("click", function() {
        if (me._locked) return;

        var $this = $(this);
        var idx = parseInt($this.attr("data-answer-index"), 10);
        if (me.multiple) {
          $this.toggleClass(sel);
        } else {
          // Remove all, then add to it.
          me.$('[data-answer-index]').removeClass(sel);
          $this.addClass(sel);
        }
        me._normalize($this);

        var sub = options[idx].sub;
        if (sub) {
          var $subInput = me.$('input[name="sub-' + me.model.id + '-' + idx + '"]');
          if ($this.hasClass(sel)) {
            if (me.useDialog()) {
              // Use the dialog view for a sub answer text.
              var dialogView = new BackboneSurvey[me.dialogName]({
                className: me.elPrefix + 'dialog' });
              dialogView.elPrefix = me.elPrefix;
              // Fire the "lock" event while opening the dialog.
              me.trigger("lock");
              dialogView.on("submit", function() {
                var answers = dialogView.answers() || [""];
                // Fill the sub answer text.
                $subInput.attr("value", answers[0]);
                // Replace the label content.
                var $label = $this.find('.' + me.elPrefix + 'label');
                if (_.isEmpty(answers[0])) {
                  $label.html(options[idx].label);
                } else {
                  $label.text(answers[0]);
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
        }
        me.trigger("answer");
      });
      return this;
    }

  , answers: function() {
      var vs = [];
      var options = this.model.get("options") || [];
      this.$('[class="' + this.elPrefix + 'selected"]').each(function() {
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
   * @class TextCardAnswerView
   */
  BackboneSurvey.TextCardAnswerView = Backbone.View.extend({
    templateName: "TextCardAnswerView"

  , $dialog: null

  , dialogName: "TextDialogView"

  , elPrefix: "survey-"

  , initialize: function() {
      this.multiple = this.model.get("type").multiple();
      this._locked = false;
      if (_.isString(this.$dialog)) {
        this.$dialog = $(this.$dialog);
      }
    }

  , _normalize: function($changed) {
      var me = this;
      var singleOptions = this.model.get("singleOptions");
      var options = this.model.get("options");
      if ($changed.prop("checked")) {
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
            .prop("checked", false).removeAttr("checked");
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
      this.$('input[name^="answer-"]').prop("disabled", true);
    }

  , unlock: function() {
      this._locked = false;
      this.$('input[name^="answer-"]').prop("disabled", false);
    }

  , render: function() {
      this.$el.html(_.template(BackboneSurvey.Templates[this.templateName])({
        elPrefix: this.elPrefix
      , multiple: this.multiple
      , model: this.model.toJSON()
      }));

      var me = this;
      var sel = this.elPrefix + "selected";

      // Prepare initial answers.
      var answers = this.model.get("answers") || [];
      var options = this.model.get("options") || [];
      var subAnswer = this.model.get("subAnswer") || {};
      _.each(options, function(opt, i) {
        var $selected = me.$('[data-answer-index="' + i + '"]');
        if (_.contains(answers, opt.value)) {
          $selected.prop("checked", true);
        } else {
          $selected.prop("checked", false).removeAttr("chekced");
        }
        var $label = me.$('label[for="' + $selected.attr("id") + '"] .' + me.elPrefix + 'label');
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

      this.$('input[name^="answer-"]').each(function() {
        me._normalize($(this));

      }).on("change", function() {
        if (me._locked) return;

        var $this = $(this);
        var idx = parseInt($this.attr("data-answer-index"), 10);
        me._normalize($this);

        var sub = options[idx].sub;
        if (sub) {
          var $subInput = me.$('input[name="sub-' + me.model.id + '-' + idx + '"]');
          if ($this.prop("checked")) {
            if (me.useDialog()) {
              // Use the dialog view for a sub answer text.
              var dialogView = new BackboneSurvey[me.dialogName]({
                className: me.elPrefix + 'dialog' });
              dialogView.elPrefix = me.elPrefix;
              // Fire the "lock" event while opening the dialog.
              me.trigger("lock");
              dialogView.on("submit", function() {
                var answers = dialogView.answers() || [""];
                // Fill the sub answer text.
                $subInput.attr("value", answers[0]);
                // Replace the label content.
                var $label = me.$('label[for="' + $this.attr("id") + '"] .' + me.elPrefix + 'label');
                if (_.isEmpty(answers[0])) {
                  $label.html(options[idx].label);
                } else {
                  $label.text(answers[0]);
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
        }
        me.trigger("answer");
      });
      return this;
    }

  , answers: function() {
      var vs = [];
      var options = this.model.get("options") || [];
      this.$('input[name="answer-' + this.model.id + '"]').each(function() {
        var $this = $(this);
        if (!$this.prop("checked")) return;
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
        var $ov = me.$('input[name="sub-' + me.model.id + '-' + i + '"]');
        if (!_.isEmpty($ov.val())) {
          sub[opt.value] = $ov.val();
        }
      });
      return sub;
    }
  });
})();
