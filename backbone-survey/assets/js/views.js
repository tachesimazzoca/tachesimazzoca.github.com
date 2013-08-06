/**
 * @module backbone-survey
 */
var BackboneSurvey = BackboneSurvey || {};

(function() {
  /**
   * @class SurveyView
   * @extends {Backbone.View}
   */
  BackboneSurvey.SurveyView = Backbone.View.extend({
    /**
     * @property elPrefix
     * @type {String} The prefix for DOM attr
     */
    elPrefix: "survey-"

    /**
     * @property rendered
     * @type {Boolean}
     */
  , rendered: false

  , _valid: false

  , templates: {
      error: '<ul><% _.each(errors, function(error) { %><li><%- error %></li><% }); %></ul>'
    }

  , initialize: function() {
      this.$el.hide();
      this.rendered = false;
      this._valid = false;

      var ev = {};
      ev["click ." + this.elPrefix + "start"] = "startPage";
      ev["click ." + this.elPrefix + "prev"] = "prevPage";
      ev["click ." + this.elPrefix + "next"] = "nextPage";
      this.delegateEvents(ev);

      this.$title = this.$("." + this.elPrefix + "title");
      this.$sections = this.$("#" + this.elPrefix + "sections");
      this.sectionView = {};

      this.listenTo(this.model, "change", this._render);
      this.listenTo(this.model, "completed", this.complete);
    }

    /**
     * @method isValid
     * @return {Boolean}
     */
  , isValid: function() {
      return this._valid;
    }

    /**
     * @method beforeRender
     * @param {Object} $el
     */
  , beforeRender: function($el) {
      var me = this;
      $el.hide(0, function() { me.render(); });
    }

    /**
     * @method afterRender
     * @param {Object} $el
     */
  , afterRender: function($el) {
      var me = this;
      $el.show(0, function() { me.rendered = true; });
    }

  , _render: function() {
      this.rendered = false;
      this._valid = false;
      this.beforeRender(this.$el);
    }

    /**
     * @method render
     * @chainable
     */
  , render: function() {
      this.$title.html(this.model.get("title") || "");
      this.$sections.html("");
      this.sectionViewMap = {};
      if (this.model.get("page") > 0) {
        var me = this;
        var sections = this.model.currentSections();
        _.each(sections, function(section) {
          var view = me.sectionViewMap[section.id] = new SectionView({
            model: section
          , className: me.elPrefix + "section"
          });
          view.on("answer", function() {
            me.validate();
            me.trigger("answer");
          });
          view.render();
          view.$("." + me.elPrefix + "error").html("").hide(); // Hide error
          me.$sections.append(view.el);
        });
        if (this.model.isFirstPage()) {
          this.$("." + this.elPrefix + "prev").hide();
        } else {
          this.$("." + this.elPrefix + "prev").show();
        }
        this.validate({ silent: true });
        this.afterRender(this.$el);
      }
      return this;
    }

    /**
     * @method startPage
     */
  , startPage: function() {
      this.trigger("start", this);
    }

    /**
     * @method prevPage
     */
  , prevPage: function() {
      this.trigger("prev", this);
    }

    /**
     * @method nextPage
     */
  , nextPage: function() {
      if (!this.rendered) return;
      if (this.validate()) {
        var me = this;
        var sectionIds = _.keys(this.sectionViewMap);
        _.each(sectionIds, function(sectionId) {
          me.model.addAnsweredSectionId(sectionId);
        });
        if (this.model.isLastPage()) {
          this.complete();
        } else {
          this.trigger("next", this);
        }
      }
    }

    /**
     * @method validate
     * @param {Object} option silent: (true|false) - Skip to render error messages
     * @return {Boolean}
     */
  , validate: function(option) {
      option = option || {};
      var valid = true;
      var sectionIds = _.keys(this.sectionViewMap);
      var me = this;
      _.each(sectionIds, function(sectionId) {
        var model = me.model.sections.get(sectionId);
        if (!model) return;
        model.clearAnswers();
        var view = me.sectionViewMap[sectionId];
        var $error = view.$("." + me.elPrefix + "error");
        $error.html("").hide();
        model.set({
          answers: view.answers()
        , subAnswer: view.subAnswer()
        }, { validate: true });
        if (model.validationError) {
          valid = false;
          if (!option.silent) {
            $error.html(_.template(me.templates.error)(
                { errors: model.validationError })).show();
          }
        }
      });
      this._valid = valid;
      return this._valid;
    }

  , complete: function() {
      this.$el.html("");
      this.trigger("completed", this);
    }
  });

  /**
   * @class SectionView
   * @extends {Backbone.View}
   */
  var SectionView = BackboneSurvey.SectionView = Backbone.View.extend({
    tagName: "div"

  , initialize: function() {
      this.elPrefix = this.elPrefix || "survey-";
      this.answerView = AnswerViewFactory.create(this);
      this.answerView.elPrefix = this.elPrefix;
      var me = this;
      this.answerView.on("answer", function() { me.trigger("answer"); });
    }

    /**
     * @method render
     * @chainable
     */
  , render: function() {
      this.$el.html(_.template(BackboneSurvey.Templates.SectionView)({
        elPrefix : this.elPrefix
      , model: this.model.toJSON()
      }));
      this.$("#" + this.elPrefix + "answer-" + this.model.id)
          .html(this.answerView.render().el);
      return this;
    }

    /**
     * @method answers
     * @return {Array}
     */
  , answers: function() {
      return (this.answerView) ? this.answerView.answers() : [];
    }

    /**
     * @method subAnswer
     * @return {Array}
     */
  , subAnswer: function() {
      return (this.answerView) ? this.answerView.subAnswer() : {};
    }
  });

  var AnswerViewFactory = BackboneSurvey.AnswerViewFactory = {};
  AnswerViewFactory.create = function(sectionView) {
    var func = BackboneSurvey[sectionView.model.get("view")];
    if (typeof func !== 'function') {
      switch (sectionView.model.get("type")) {
        case BackboneSurvey.QuestionType.TEXT:
          func = BackboneSurvey.TextAnswerView;
          break;
        case BackboneSurvey.QuestionType.MULTI:
          func = BackboneSurvey.MultiAnswerView;
          break;
        case BackboneSurvey.QuestionType.RADIO:
          func = BackboneSurvey.RadioAnswerView;
          break;
        case BackboneSurvey.QuestionType.CHECKBOX:
          func = BackboneSurvey.CheckboxAnswerView;
          break;
        default:
          func = BackboneSurvey.NoneAnswerView;
          break;
      }
    }
    return new func({
      model: sectionView.model
    , tagName: "div"
    , className: sectionView.elPrefix + "answer-item"
    });
  };

  /**
   * @class NonAnswerView
   * @extends {Backbone.View}
   */
  var NoneAnswerView = BackboneSurvey.NoneAnswerView = Backbone.View.extend({
    initialize: function() {
      this.elPrefix = this.elPrefix || "survey-";
    }

  , render: function() {
      return this;
    }

    /**
     * @method answers
     * @return {Array}
     */
  , answers: function() { return []; }

    /**
     * @method subAnswer
     * @return {Object}
     */
  , subAnswer: function() {
      return {};
    }
  });

  /**
   * @class TextAnswerView
   * @extends {Backbone.View}
   */
  var TextAnswerView = BackboneSurvey.TextAnswerView = Backbone.View.extend({
    templateName: "TextAnswerView"

  , initialize: function() {
      this.elPrefix = this.elPrefix || "survey-";
    }

    /**
     * @method render
     * @chainable
     */
  , render: function() {
      this.$el.html(_.template(BackboneSurvey.Templates[this.templateName])({ model: this.model.toJSON() }));

      var me = this;
      this.$('[name="answer-' + this.model.id + '"]').on("blur", function() {
        me.trigger("answer");
      });

      return this;
    }

    /**
     * @method answers
     * @return {Array}
     */
  , answers: function() {
      var v = this.$('[name="answer-' + this.model.id + '"]').val();
      return (_.isEmpty(v)) ? [] : [v];
    }

    /**
     * @method subAnswer
     * @return {Object}
     */
  , subAnswer: function() {
      return {};
    }
  });

  /**
   * @class MultiAnswerView
   * @extends {Backbone.View}
   */
  var MultiAnswerView = BackboneSurvey.MultiAnswerView = Backbone.View.extend({
    templateName: "MultiAnswerView"

  , initialize: function() {
      this.elPrefix = this.elPrefix || "survey-";
    }

    /**
     * @method render
     * @chainable
     */
  , render: function() {
      this.$el.html(_.template(BackboneSurvey.Templates[this.templateName])({ model: this.model.toJSON() }));

      var me = this;
      this.$('[name^="answer-' + this.model.id + '-"]').on("blur", function() {
        me.trigger("answer");
      });

      return this;
    }

    /**
     * @method answers
     * @return {Array}
     */
  , answers: function() {
      var vs = [];
      this.$('[name^="answer-' + this.model.id + '-"]').each(function() {
        vs.push($(this).val());
      });
      return vs;
    }

    /**
     * @method subAnswer
     * @return {Object}
     */
  , subAnswer: function() {
      return {};
    }
  });

  /**
   * @class OptionAnswerViewProto
   */
  var OptionAnswerViewProto = {
    templateName: "OptionAnswerView"

  , multiple: false

  , initialize: function() {
      this.elPrefix = this.elPrefix || "survey-";
    }

    /**
     * @method render
     * @chainable
     */
  , render: function() {
      this.$el.html(_.template(BackboneSurvey.Templates[this.templateName])({
        elPrefix: this.elPrefix
      , multiple: this.multiple
      , model: this.model.toJSON()
      }));
      var me = this;
      this.$('input[name^="answer-"]') .each(function() {
        me.normalize($(this));
      }).on("change", function() {
        me.normalize($(this));
        me.trigger("answer");
      });
      return this;
    }

    /**
     * @method normalize
     * @param {Object} $changed A last changed jQuery object.
     */
  , normalize: function($changed) {
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
      var ans = this.answers();
      var ovs = _.pluck(this.model.get("options"), "value");
      var me = this;
      _.each(ovs, function(ov, i) {
        me.$('input[name^="sub-' + me.model.id + '-' + i + '"]')
            .prop("disabled", !_.contains(ans, ov));
      });
    }

    /**
     * @method answers
     * @return {Array}
     */
  , answers: function() {
      var vs = [];
      this.$('[name="answer-' + this.model.id + '"]').each(function() {
        var $this = $(this);
        if ($this.prop("checked")) vs.push($this.val());
      });
      return vs;
    }

    /**
     * @method subAnswer
     * @return {Object}
     */
  , subAnswer: function() {
      var sub = {};
      var opts = this.model.get("options");
      var me = this;
      _.each(opts, function(opt, i) {
        if (!opt.sub) return;
        var $ov = me.$('input[name^="sub-' + me.model.id + '-' + i + '"]');
        if (!$ov.prop("disabled")) sub[opt.value] = $ov.val();
      });
      return sub;
    }
  };

  /**
   * @class RadioAnswerView
   * @extends {Backbone.View}
   * @uses OptionAnswerViewProto
   */
  var RadioAnswerView = BackboneSurvey.RadioAnswerView = Backbone.View.extend({
  });
  _.extend(RadioAnswerView.prototype, OptionAnswerViewProto, { multiple: false});

  /**
   * @class CheckboxAnswerView
   * @extends {Backbone.View}
   * @uses OptionAnswerViewProto
   */
  var CheckboxAnswerView = BackboneSurvey.CheckboxAnswerView = Backbone.View.extend({
  });
  _.extend(CheckboxAnswerView.prototype, OptionAnswerViewProto, { multiple: true});

  /**
   * @class TextCardAnswerView
   */
  var TextCardAnswerView = BackboneSurvey.TextCardAnswerView = Backbone.View.extend({
    templateName: "TextCardAnswerView"

  , $dialog: null

  , initialize: function() {
      this.elPrefix = this.elPrefix || "survey-";
      this.multiple = this.model.get("type") === BackboneSurvey.QuestionType.CHECKBOX;
      this.$selected = null;
    }

    /**
     * @method render
     * @chainable
     */
  , render: function() {
      this.$el.html(_.template(BackboneSurvey.Templates[this.templateName])({
        elPrefix: this.elPrefix
      , multiple: this.multiple
      , model: this.model.toJSON()
      }));

      var me = this;
      var sel = this.elPrefix + "selected";

      // subDialog
      var $subDialog = this.$dialog || this.$('.' + this.elPrefix + 'dialog');
      if (_.isString($subDialog)) {
        $subDialog = $($subDialog);
      }
      $subDialog.hide();
      $subDialog.find('button').off("click").on("click", function() {
        me.updateSubAnswer(me.$selected, $subDialog.find('input').val());
        me.$selected = null;
        $subDialog.hide();
        me.$('input[name^="answer-"]').prop("disabled", false);
      });

      var fn = function() { me.normalize($(this)); };
      this.$('input[name^="answer-"]').each(function() {
        me.normalize($(this));

      }).on("change", function() {
        if (me.$selected) return;
        var $this = $(this);

        me.normalize($this);

        if ($this.prop("checked")) {
          var $li = $this.parent();
          var $sub = $li.find('input[name^="sub-"]');
          if ($sub.length) {
            me.$('input[name^="answer-"]').prop("disabled", true);
            me.$selected = $li;
            $subDialog.find('input')
              .val($sub.val())
              .attr("placeholder", $sub.attr("placeholder"));
            $subDialog.show();
          }
        }
        me.trigger("answer");
      });

      return this;
    }

    /**
     * @method normalize
     * @param {Object} $changed A last changed jQuery object.
     */
  , normalize: function($changed) {
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

    /**
     * @method answers
     * @return {Array}
     */
  , answers: function() {
      var vs = [];
      this.$('input[name="answer-' + this.model.id + '"]').each(function() {
        var $this = $(this);
        if ($this.prop("checked")) vs.push($this.val());
      });
      return vs;
    }

    /**
     * @method subAnswer
     * @return {Object}
     */
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

    /**
     * @method updateSubAnswer
     */
  , updateSubAnswer: function($selected, sub) {
      $selected.find('input[name^="sub-"]').val(sub);
      $label = $selected.find('label');
      if (_.isEmpty(sub)) {
        var v = $selected.find('input[name^="answer-"]').val();
        var option = _.find(this.model.get("options"), function(o) { return o.value == v; });
        if (option) $label.html(option.label);
      } else {
        $label.text(sub);
      }
    }
  });

  /**
   * @class ImageCardAnswerView
   */
  var ImageCardAnswerView = BackboneSurvey.ImageCardAnswerView = Backbone.View.extend({
    templateName: "ImageCardAnswerView"

  , $dialog: null

  , initialize: function() {
      this.elPrefix = this.elPrefix || "survey-";
      this.multiple = this.model.get("type") === BackboneSurvey.QuestionType.CHECKBOX;
      this.$selected = null;
    }

    /**
     * @method render
     * @chainable
     */
  , render: function() {
      this.$el.html(_.template(BackboneSurvey.Templates[this.templateName])({
        elPrefix: this.elPrefix
      , model: this.model.toJSON()
      }));

      var me = this;
      var sel = this.elPrefix + "selected";

      // subDialog
      var $subDialog = this.$dialog || this.$('.' + this.elPrefix + 'dialog');
      if (_.isString($subDialog)) {
        $subDialog = $($subDialog);
      }
      if (!$subDialog.length) {
        console.log("CardAnswerView.$dialog is not a valid DOM element.");
      }
      $subDialog.hide();
      $subDialog.find('button').off("click").on("click", function() {
        me.updateSubAnswer(me.$selected, $subDialog.find('input').val());
        me.$selected = null;
        $subDialog.hide();
      });
      // options
      this.$('label').each(function () {
        me.normalize($(this));

      }).on("click", function() {
        if (me.$selected) return;
        var $this = $(this);
        if (me.multiple) {
          $this.toggleClass(sel);
        } else {
          me.$('label').removeClass(sel);
          $this.addClass(sel);
        }

        me.normalize($this);

        if ($this.hasClass(sel)) {
          var $li = $this.parent();
          var $sub = $li.find('input[name^="sub-"]');
          if ($sub.length) {
            me.$selected = $li;
            $subDialog.find('input').val($sub.val());
            $subDialog.show();
          }
        }
        me.trigger("answer");
      });
      return this;
    }

    /**
     * @method normalize
     * @param {Object} $changed A last changed jQuery object.
     */
  , normalize: function($changed) {
      var so = this.model.get("singleOptions");
      var sel = this.elPrefix + "selected";
      console.log($changed.hasClass(sel));
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

    /**
     * @method answers
     * @return {Array}
     */
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

    /**
     * @method subAnswer
     * @return {Object}
     */
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

    /**
     * @method updateSubAnswer
     */
  , updateSubAnswer: function($selected, sub) {
      $selected.find('input[name^="sub-"]').val(sub);
      $label = $selected.find('label');
      if (_.isEmpty(sub)) {
        var v = $selected.find('input[name^="answer-"]').val();
        var option = _.find(this.model.get("options"), function(o) { return o.value == v; });
        if (option) $label.html(option.label);
      } else {
        $label.text(sub);
      }
    }
  });
})();
