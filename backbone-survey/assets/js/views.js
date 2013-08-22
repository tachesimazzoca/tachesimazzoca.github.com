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
     * A prefix of the DOM attributes.
     *
      @property elPrefix
     * @type {String}
     */
    elPrefix: "survey-"

    /**
     * @property rendered
     * @type {Boolean}
     */
  , rendered: false

    /**
     * Validation error messages of each section.
     *
     * @property errors
     * @type {Object}
     */
  , errors: {}

  , _locked: false

  , _valid: false

  , templates: {
      error: '<ul><% _.each(errors, function(error) { %><li><%- error %></li><% }); %></ul>'
    }

  , initialize: function() {
      this.$el.hide();
      this.rendered = false;
      this.errors = {};

      this._locked = false;
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
      this.listenTo(this.model, "completed", this._complete);
    }

    /**
     * @method isLocked
     * @return {Boolean}
     */
  , isLocked: function() {
      return this._locked;
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
      this._locked = false;
      this._valid = false;
      this.beforeRender(this.$el);
    }

  , _complete: function() {
      this.$el.html("");
      this._locked = false;
      this.trigger("completed", this);
    }

    /**
     * @method lock
     */
  , lock: function() {
      this._locked = true;
      var sections = this.model.currentSections();
      var me = this;
      _.each(sections, function(section) {
        var view = me.sectionViewMap[section.id];
        if (view) view.answerView.lock();
      });
    }

    /**
     * @method unlock
     */
  , unlock: function() {
      this._locked = false;
      var sections = this.model.currentSections();
      var me = this;
      _.each(sections, function(section) {
        var view = me.sectionViewMap[section.id];
        if (view) view.answerView.unlock();
      });
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

          view.answerView.on("answer", function() {
            me.validate();
            me.trigger("answer");
          });
          view.answerView.on("lock", function() { me.lock(); });
          view.answerView.on("unlock", function() { me.unlock(); });

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
      if (this.isLocked()) return;
      this.trigger("start", this);
    }

    /**
     * @method prevPage
     */
  , prevPage: function() {
      if (this.isLocked()) return;
      this.trigger("prev", this);
    }

    /**
     * @method nextPage
     */
  , nextPage: function() {
      if (this.isLocked()) return;
      if (!this.rendered) return;
      if (this.validate()) {
        this.trigger("next", this);
      } else {
        this.trigger("invalid", this);
      }
    }

    /**
     * @method validate
     * @param {Object} option silent: (true|false) - Skip to render error messages
     * @return {Boolean}
     */
  , validate: function(option) {
      option = option || {};
      this.errors = {};
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
            me.errors[model.id] = model.validationError;
            $error.html(_.template(me.templates.error)(
                { errors: me.errors[model.id] })).show();
          }
        }
      });
      this._valid = valid;
      return this._valid;
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
    }

    /**
     * @method lock
     */
  , lock: function() {
    }

    /**
     * @method unlock
     */
  , unlock: function() {
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
        case BackboneSurvey.QuestionType.CHECKBOX:
          func = BackboneSurvey.OptionAnswerView;
          break;
        case BackboneSurvey.QuestionType.MATRIX:
        case BackboneSurvey.QuestionType.MATRIX_MULTI:
          func = BackboneSurvey.MatrixAnswerView;
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

    /**
     * @method lock
     */
  , lock: function() {
    }

    /**
     * @method unlock
     */
  , unlock: function() {
    }

    /**
     * @method render
     * @chainable
     */
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
     * @method lock
     */
  , lock: function() {
    }

    /**
     * @method unlock
     */
  , unlock: function() {
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
     * @method lock
     */
  , lock: function() {
    }

    /**
     * @method unlock
     */
  , unlock: function() {
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
   * @class OptionAnswerView
   */
  var OptionAnswerView = BackboneSurvey.OptionAnswerView = Backbone.View.extend({
    templateName: "OptionAnswerView"

  , multiple: false

  , initialize: function() {
      this.elPrefix = this.elPrefix || "survey-";
      this.multiple = this.model.get("type").multiple();
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
        me.$('input[name^="sub-' + me.model.id + '-' + i + '"]')
            .prop("disabled", !_.contains(answers, opt.value));
      });
    }

    /**
     * @method lock
     */
  , lock: function() {
    }

    /**
     * @method unlock
     */
  , unlock: function() {
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

      var answers = this.model.get("answers") || [];
      var options = this.model.get("options") || [];
      var subAnswer = this.model.get("subAnswer") || {};
      _.each(options, function(opt, i) {
        var $selected = me.$('[data-answer-index="' + i + '"]');
        if (_.contains(answers, opt.value)) {
          $selected.prop("checked", true).attr("checked", "checked");
        } else {
          $selected.prop("checked", false).removeAttr("checked");
        }
        if (opt.sub) {
          var $subInput = me.$('input[name="sub-' + me.model.id + '-' + i + '"]');
          $subInput.attr("value", subAnswer[opt.value] || "");
        }
      });

      this.$('input[name^="answer-"]').each(function() {
        me._normalize($(this));
      }).on("change", function() {
        me._normalize($(this));
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
      var options = this.model.get("options") || [];
      this.$('input[name="answer-' + this.model.id + '"]').each(function() {
        var $this = $(this);
        if (!$this.prop("checked")) return;
        var idx = parseInt($this.attr("data-answer-index"), 10);
        vs.push(options[idx].value);
      });
      return vs;
    }

    /**
     * @method subAnswer
     * @return {Object}
     */
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

  /**
   * @class MatrixAnswerView
   * @extends {Backbone.View}
   */
  var MatrixAnswerView = BackboneSurvey.MatrixAnswerView = Backbone.View.extend({
    templateName: "MatrixAnswerView"

  , multiple: false

  , initialize: function() {
      this.elPrefix = this.elPrefix || "survey-";
      this.multiple = this.model.get("type").multiple();
    }

  , _normalize: function($changed) {
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
        this.$('input[name="' + $changed.attr("name") + '"]').filter(f)
            .prop("checked", false).removeAttr("checked");
      }
    }

    /**
     * @method lock
     */
  , lock: function() {
    }

    /**
     * @method unlock
     */
  , unlock: function() {
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
      var fields = this.model.get("fields");
      var answers = this.model.get("answers") || [];
      var options = this.model.get("options") || [];
      _.each(fields, function(fld, j) {
        answers[j] = answers[j] || [];
        _.each(options, function(opt, i) {
          var $selected = me.$(
            '[name="answer-' + me.model.id + '-' + j + '"]' +
            '[data-answer-index="' + i + '"]');
          if (_.contains(answers[j], opt.value)) {
            $selected.prop("checked", true).attr("checked", "checked");
          } else {
            $selected.prop("checked", false).removeAttr("checked");
          }
        });
      });

      this.$('input[name^="answer-"]').on("change", function() {
        me._normalize($(this));
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
      var me = this;
      var fields = this.model.get("fields");
      var options = this.model.get("options") || [];
      _.each(fields, function(field, i) {
        vs[i] = [];
        this.$('input[name="answer-' + me.model.id + '-' + i + '"]').each(function() {
          var $this = $(this);
          if (!$this.prop("checked")) return;
          var idx = parseInt($this.attr("data-answer-index"), 10);
          vs[i].push(options[idx].value);
        });
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
})();
