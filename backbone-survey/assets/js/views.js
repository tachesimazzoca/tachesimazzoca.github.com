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
    elPrefix: "survey-"

  , templates: {
      error: '<ul><% _.each(errors, function(error) { %><li><%- error %></li><% }); %></ul>'
    }

  , initialize: function() {
      this.$el.hide();

      var ev = {};
      ev["click ." + this.elPrefix + "start"] = "startPage";
      ev["click ." + this.elPrefix + "prev"] = "prevPage";
      ev["click ." + this.elPrefix + "next"] = "nextPage";
      this.delegateEvents(ev);

      this.$title = this.$("." + this.elPrefix + "title");
      this.$sections = this.$("#" + this.elPrefix + "sections");
      this.sectionView = {};

      this.listenTo(this.model, "change", this.render);
      this.listenTo(this.model, "completed", this.complete);
    }

  , show: function($el) {
      $el.show();
    }

  , hide: function($el) {
      $el.hide();
    }

    /**
     * @method render
     * @chainable
     */
  , render: function() {
      if (BackboneSurvey.logger) {
        BackboneSurvey.logger.debug(["SurveyView#render", this.model]);
      }
      this.hide(this.$el);
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
          view.render();
          view.$("." + me.elPrefix + "error").html("").hide(); // Hide error
          me.$sections.append(view.el);
        });
        if (this.model.isFirstPage()) {
          this.$("." + this.elPrefix + "prev").hide();
        } else {
          this.$("." + this.elPrefix + "prev").show();
        }
        this.show(this.$el);
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
        // RV : Async validation support
        if (model.validationError) {
          valid = false;
          $error.html(_.template(me.templates.error)(
              { errors: model.validationError })).show();
        }
      });
      if (valid) {
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
    initialize: function() {
      this.elPrefix = this.elPrefix || "survey-";
    }

    /**
     * @method render
     * @chainable
     */
  , render: function() {
      this.$el.html(_.template(BackboneSurvey.Templates[this.templateName])({ model: this.model.toJSON() }));
      var me = this;
      var fn = function() { me.normalize($(this)); };
      this.$('input[name^="answer-"]').each(fn).on("change", fn);
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
    templateName: "RadioAnswerView"
  });
  _.extend(RadioAnswerView.prototype, OptionAnswerViewProto);

  /**
   * @class CheckboxAnswerView
   * @extends {Backbone.View}
   * @uses OptionAnswerViewProto
   */
  var CheckboxAnswerView = BackboneSurvey.CheckboxAnswerView = Backbone.View.extend({
    templateName: "CheckboxAnswerView"
  });
  _.extend(CheckboxAnswerView.prototype, OptionAnswerViewProto);

  /**
   * @class CardAnswerView
   */
  var CardAnswerView = BackboneSurvey.CardAnswerView = Backbone.View.extend({
    templateName: "CardAnswerView"

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
      var $subDialog = this.$('.' + this.elPrefix + 'sub-dialog');
      $subDialog.hide();
      $subDialog.find('button').on("click", function() {
        me.updateSubAnswer(me.$selected, $subDialog.find('input').val());
        me.$selected = null;
        $subDialog.hide();
      });
      // options
      this.$('a').on("click", function() {
        if (me.$selected) return;
        $this = $(this);
        if (me.multiple) {
          $this.toggleClass(sel);
        } else {
          me.$('a').removeClass(sel);
          $this.addClass(sel);
        }
        if ($this.hasClass(sel)) {
          var $sub = $this.find('input[name^="sub-"]');
          if ($sub.length) {
            me.$selected = $this;
            $subDialog.find('input').val($sub.val());
            me.$('.' + me.elPrefix + 'sub-dialog').show();
          }
        }
      });
      return this;
    }

    /**
     * @method answers
     * @return {Array}
     */
  , answers: function() {
      var vs = [];
      this.$('a[class="' + this.elPrefix + 'selected"] > input[name^="answer-"]').each(function() {
        vs.push($(this).val());
      });
      return vs;
    }

    /**
     * @method subAnswer
     * @return {Object}
     */
  , subAnswer: function() {
      var sub = {};
      return sub;
    }

    /**
     * @method updateSubAnswer
     */
  , updateSubAnswer: function($selected, sub) {
      $selected.find('input[name^="sub-"]').val(sub);
      $label = $selected.find('span');
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