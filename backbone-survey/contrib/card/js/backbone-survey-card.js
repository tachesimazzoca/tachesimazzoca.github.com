// Backbone Survey | CardAnswerView

var BackboneSurvey = BackboneSurvey || {};

// Templates
// ---------
(function() {
  BackboneSurvey.Templates = BackboneSurvey.Templates || {};

  BackboneSurvey.Templates.TextDialogView =
    '<div class="<%- elPrefix %>dialog-container">' +
      '<div class="<%- elPrefix %>dialog-inner">' +
        '<div><span class="<%- elPrefix %>dialog-note"><%- note %></div>' +
        '<input class="<%- elPrefix %>dialog-input" type="text"' +
          ' value="<%- value %>" placeholder="<%- placeholder %>">' +
        '<button class="<%- elPrefix %>dialog-submit">OK</button>' +
        '<button class="<%- elPrefix %>dialog-cancel">Cancel</button>' +
      '</div>' +
    '</div>';

  BackboneSurvey.Templates.SubDialogView =
    '<div class="<%- elPrefix %>dialog-inner">' +
    '<span class="<%- elPrefix %>dialog-note"><%- note %></span> ' +
    '<input class="<%- elPrefix %>dialog-input" type="text"' +
      ' value="<%- value %>" placeholder="<%- placeholder %>">' +
    '</div>';

  BackboneSurvey.Templates.CardAnswerView =
    '<ul>' +
    '<% _.each(model.options, function(option, i) { %>' +
      '<li>' +
      '<input type="hidden" name="answer-<%- model.id %>" value="<%- option.value %>">' +
      '<% if (option.sub) { %>' +
        '<input type="hidden" name="sub-<%- model.id %>-<%- i %>"' +
          ' data-placeholder="<%- option.sub.placeholder %>"' +
          ' data-note="<%- option.sub.note %>"' +
          '<% if (!_.isEmpty(model.subAnswer[option.value])) { %>' +
            ' value="<%- model.subAnswer[option.value] %>"<% } %>>' +
      '<% } %>' +
      '<label <% if (_.contains(model.answers, option.value)) { %> class="survey-selected"<% } %>>' +
      '<span class="<%- elPrefix %>label">' +
        '<% if (!_.isEmpty(model.subAnswer[option.value])) { %>' +
          '<%- model.subAnswer[option.value] %>' +
        '<% } else { %>' +
          '<%= option.label %>' +
        '<% } %>' +
      '</span>' +
      '</label>' +
      '</li>' +
    '<% }); %>' +
    '</ul>' +
    '<div id="<%- elPrefix %>dialog-<%- model.id %>"></div>';

/// {{{ Deprecated

  BackboneSurvey.Templates.TextCardAnswerView =
    '<ul>' +
    '<% _.each(model.options, function(option, i) { %>' +
      '<li>' +
      '<input type="<%- multiple ? "checkbox" : "radio" %>"' +
      ' name="answer-<%- model.id %>" value="<%- option.value %>"' +
      ' id="<%- elPrefix %>answer-<%- model.id %>-<%- i %>"' +
      '<% if (_.contains(model.answers, option.value)) { %> checked="checked"<% } %>>' +
      '<% if (option.sub) { %>' +
        '<input type="hidden" name="sub-<%- model.id %>-<%- i %>"' +
          ' data-placeholder="<%- option.sub.placeholder %>"' +
          ' data-note="<%- option.sub.note %>"' +
          '<% if (!_.isEmpty(model.subAnswer[option.value])) { %>' +
          ' value="<%- model.subAnswer[option.value] %>"<% } %>>' +
      '<% } %>' +
      '<label for="<%- elPrefix %>answer-<%- model.id %>-<%- i %>">' +
      '<span class="<%- elPrefix %>label">' +
      '<% if (!_.isEmpty(model.subAnswer[option.value])) { %>' +
        '<%- model.subAnswer[option.value] %>' +
      '<% } else { %>' +
        '<%= option.label %>' +
      '<% } %>' +
      '</span>' +
      '</label>' +
      '</li>' +
    '<% }); %>' +
    '</ul>' +
    '<div id="<%- elPrefix %>dialog-<%- model.id %>"></div>';

/// }}}
})();

// Views
// -----
(function() {
  BackboneSurvey.TextDialogView = Backbone.View.extend({
    templateName: "TextDialogView"

  , elPrefix : "survey-"

  , modal: function() { return true; }

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

  BackboneSurvey.SubDialogView = Backbone.View.extend({
    templateName: "SubDialogView"

  , elPrefix : "survey-"

  , modal: function() { return false; }

  , render: function(params) {
      params = _.extend({ elPrefix: this.elPrefix }, params || {});
      this.$el.html(_.template(BackboneSurvey.Templates[this.templateName])(params));

      var me = this;
      this.$('.' + this.elPrefix + 'dialog-input').on("blur", function() {
        me.trigger("change");
      });

      return this;
    }

  , answers: function() {
      var v = this.$('.' + this.elPrefix + 'dialog-input').val();
      return _.isEmpty(v) ? [""] : [v];
    }
  });

  BackboneSurvey.CardAnswerView = Backbone.View.extend({
    templateName: "CardAnswerView"

  , dialogName: "SubDialogView"

  , $dialog: null

  , elPrefix: "survey-"

  , initialize: function() {
      this.multiple = this.model.get("type").multiple();
      this._locked = false;
    }

  , _normalize: function($changed) {
      var so = this.model.get("singleOptions");
      var sel = this.elPrefix + "selected";
      if ($changed.hasClass(sel)) {
        var v = $changed.parent().find('input[name^="answer-"]').val();
        var f = _.contains(so, v) ?
          // uncheck other options
          function() {
            var x = $(this).parent().find('input[name^="answer-"]').val();
            return x != v;
          } :
          // uncheck single options
          function() {
            var x = $(this).parent().find('input[name^="answer-"]').val();
            return _.contains(so, x);
          };
        this.$('label').filter(f).removeClass(sel);
      }
    }

  , _updateSubAnswer: function($selected, sub) {
      $selected.find('input[name^="sub-"]').val(sub);
      $label = $selected.find('.' + this.elPrefix + 'label');
      if (_.isEmpty(sub)) {
        var v = $selected.find('input[name^="answer-"]').val();
        var option = _.find(this.model.get("options"), function(o) { return o.value == v; });
        if (option) $label.html(option.label);
      } else {
        $label.text(sub);
      }
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
      , model: this.model.toJSON()
      }));

      var me = this;
      var sel = this.elPrefix + "selected";

      // subDialog
      var $subDialog = this.$dialog || this.$('#' + this.elPrefix + 'dialog-' + this.model.id);
      if (_.isString($subDialog)) {
        $subDialog = $($subDialog);
      }
      $subDialog.hide();

      // options
      this.$('label').each(function () {
        me._normalize($(this));

      }).on("click", function() {
        if (me._locked) return;

        var $this = $(this);
        if (me.multiple) {
          $this.toggleClass(sel);
        } else {
          me.$('label').removeClass(sel);
          $this.addClass(sel);
        }
        me._normalize($this);

        if ($this.hasClass(sel)) {
          var $li = $this.parent();
          var $sub = $li.find('input[name^="sub-"]');
          if ($sub.length) {
            var $selected = $li;
            var dialogView = new BackboneSurvey[me.dialogName]({ className: me.elPrefix + 'dialog' });
            dialogView.elPrefix = me.elPrefix;
            if (dialogView.modal()) {
              me.trigger("lock");
              dialogView.on("submit", function() {
                var answers = dialogView.answers() || [""];
                me._updateSubAnswer($selected, answers[0]);
                $subDialog.hide();
                me.trigger("unlock");
                me.trigger("answer");
              });
              dialogView.on("cancel", function() {
                $subDialog.hide();
                me.trigger("unlock");
              });
            } else {
              dialogView.on("change", function() {
                var answers = dialogView.answers() || [""];
                me._updateSubAnswer($selected, answers[0]);
                $subDialog.hide();
                me.trigger("answer");
              });
            }
            var params = {
              value: $sub.val()
            , note: $sub.attr("data-note")
            , placeholder: $sub.attr("data-placeholder")
            };
            $subDialog.html(dialogView.render(params).el);
            $subDialog.show();
          } else {
            $subDialog.hide();
          }
        }
        me.trigger("answer");
      });
      return this;
    }

  , answers: function() {
      var vs = [];
      this.$('label[class="' + this.elPrefix + 'selected"]').each(function() {
        var $li = $(this).parent();
        $li.find('input[name^="answer-"]').each(function() {
          vs.push($(this).val());
        });
      });
      return vs;
    }

  , subAnswer: function() {
      var sub = {};
      var opts = this.model.get("options");
      var ans = this.answers();
      var me = this;
      _.each(opts, function(opt, i) {
        if (!opt.sub) return;
        if (!_.contains(ans, opt.value)) return;
        var $ov = me.$('input[name^="sub-' + me.model.id + '-' + i + '"]');
        if (!_.isEmpty($ov.val())) {
          sub[opt.value] = $ov.val();
        }
      });
      return sub;
    }
  });

/// {{{ Deprecated
  /**
   * Deprecated. Use CardAnswerView instead.
   * Simply, You just replace Section :view attr with "CardAnswerView".
   */
  BackboneSurvey.ImageCardAnswerView = BackboneSurvey.CardAnswerView;

  /**
   * Deprecated. Use CardAnswerView instead.
   * You need to refactor input (radio|checkbox) markups.
   */
  BackboneSurvey.TextCardAnswerView = Backbone.View.extend({
    templateName: "TextCardAnswerView"

  , $dialog: null

  , dialogName: "SubDialogView"

  , elPrefix: "survey-"

  , initialize: function() {
      this.multiple = this.model.get("type").multiple();
      this._locked = false;
    }

  , _normalize: function($changed) {
      var so = this.model.get("singleOptions");
      if ($changed.prop("checked")) {
        var v = $changed.val();
        var f = _.contains(so, v) ?
          // uncheck other options
          function() { return this.value != v; } :
          // uncheck single options
          function() { return _.contains(so, this.value); };
        this.$('input[name^="answer-"]').filter(f)
            .prop("checked", false).removeAttr("checked");
      }
    }

  , _updateSubAnswer: function($selected, sub) {
      $selected.find('input[name^="sub-"]').val(sub);
      $label = $selected.find('.' + this.elPrefix + 'label');
      if (_.isEmpty(sub)) {
        var v = $selected.find('input[name^="answer-"]').val();
        var option = _.find(this.model.get("options"), function(o) { return o.value == v; });
        if (option) $label.html(option.label);
      } else {
        $label.text(sub);
      }
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

      // subDialog
      var $subDialog = this.$dialog || this.$('#' + this.elPrefix + 'dialog-' + this.model.id);
      if (_.isString($subDialog)) {
        $subDialog = $($subDialog);
      }
      $subDialog.hide();

      this.$('input[name^="answer-"]').each(function() {
        me._normalize($(this));

      }).on("change", function() {
        if (me._locked) return;

        var $this = $(this);
        me._normalize($this);

        if ($this.prop("checked")) {
          var $li = $this.parent();
          var $sub = $li.find('input[name^="sub-"]');
          if ($sub.length) {
            var $selected = $li;
            var dialogView = new BackboneSurvey[me.dialogName]({ className: me.elPrefix + 'dialog' });
            dialogView.elPrefix = me.elPrefix;
            if (dialogView.modal()) {
              me.trigger("lock");
              dialogView.on("submit", function() {
                var answers = dialogView.answers() || [""];
                me._updateSubAnswer($selected, answers[0]);
                $subDialog.hide();
                me.trigger("unlock");
                me.trigger("answer");
              });
              dialogView.on("cancel", function() {
                $subDialog.hide();
                me.trigger("unlock");
              });
            } else {
              dialogView.on("change", function() {
                var answers = dialogView.answers() || [""];
                me._updateSubAnswer($selected, answers[0]);
                $subDialog.hide();
                me.trigger("answer");
              });
            }
            var params = {
              value: $sub.val()
            , note: $sub.attr("data-note")
            , placeholder: $sub.attr("data-placeholder")
            };
            $subDialog.html(dialogView.render(params).el);
            $subDialog.show();

          } else {
            $subDialog.hide();
          }
        }
        me.trigger("answer");
      });

      return this;
    }

  , answers: function() {
      var vs = [];
      this.$('input[name="answer-' + this.model.id + '"]').each(function() {
        var $this = $(this);
        if ($this.prop("checked")) vs.push($this.val());
      });
      return vs;
    }

  , subAnswer: function() {
      var sub = {};
      var opts = this.model.get("options");
      var ans = this.answers();
      var me = this;
      _.each(opts, function(opt, i) {
        if (!opt.sub) return;
        if (!_.contains(ans, opt.value)) return;
        var $ov = me.$('input[name="sub-' + me.model.id + '-' + i + '"]');
        if (!_.isEmpty($ov.val())) {
          sub[opt.value] = $ov.val();
        }
      });
      return sub;
    }
  });

/// }}}
})();
