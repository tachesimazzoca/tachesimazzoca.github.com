/**
 * @module backbone-survey
 */
var BackboneSurvey = BackboneSurvey || {};

(function() {
  BackboneSurvey.VERSION = "0.0.0";

  /**
   * Functions to set up the prototype chain by saving
   * a refecence to `Backbone.Model.extend`.
   *
<pre><code>var Animal = function(name) {
  this.name = name;
};
_.extend(Animal, BackboneSurvey.Extendable);
var Bird = Animal.extend({
  fly: function() { return "Fly! " + this.name; }
}):
</code></pre>
   *
   * @class Extendable
   */
  BackboneSurvey.Extendable = {
    extend: Backbone.Model.extend
  };
})();
/**
 * @module backbone-survey
 */
var BackboneSurvey = BackboneSurvey || {};

(function() {
  /**
   * @class AnswerType
   */
  var AnswerType = function() {};
  BackboneSurvey.AnswerType = {};

  /**
   * @property NONE
   * @type {AnswerType}
   * @static
   * @final
   */
  BackboneSurvey.AnswerType.NONE = new AnswerType();

  /**
   * @property TEXT
   * @type {AnswerType}
   * @static
   * @final
   */
  BackboneSurvey.AnswerType.TEXT = new AnswerType();

  /**
   * @property OPTION
   * @type {AnswerType}
   * @static
   * @final
   */
  BackboneSurvey.AnswerType.OPTION = new AnswerType();

  /**
   * @class QuestionType
   */
  var QuestionType = function(answerType, multiple) {
    this._answerType = answerType;
    this._multiple = multiple;
  };
  QuestionType.prototype = {
  /**
   * @method ansewrType
   * @return {AnswerType}
   */
    answerType: function() { return this._answerType; }

  /**
   * @method multiple
   * @return {Boolean}
   */
  , multiple: function() { return this._multiple; }
  };
  BackboneSurvey.QuestionType = {};

  /**
   * @property NONE
   * @type {QuestionType}
   * @static
   * @final
   */
  BackboneSurvey.QuestionType.NONE = new QuestionType(BackboneSurvey.AnswerType.NONE, false);

  /**
   * @property TEXT
   * @type {QuestionType}
   * @static
   * @final
   */
  BackboneSurvey.QuestionType.TEXT = new QuestionType(BackboneSurvey.AnswerType.TEXT, false);

  /**
   * @property RADIO
   * @type {QuestionType}
   * @static
   * @final
   */
  BackboneSurvey.QuestionType.RADIO = new QuestionType(BackboneSurvey.AnswerType.OPTION, false);

  /**
   * @property CHECKBOX
   * @type {QuestionType}
   * @static
   * @final
   */
  BackboneSurvey.QuestionType.CHECKBOX = new QuestionType(BackboneSurvey.AnswerType.OPTION, true);
})();
/**
 * @module backbone-survey
 */
var BackboneSurvey = BackboneSurvey || {};

(function() {
  /**
   * @class ValidationResult
   * @uses Extendable
   * @constructor
   * @param {String} msg A result message
   */
  var ValidationResult = BackboneSurvey.ValidationResult = function(msg) {
    this.message = msg || "";
  };
  ValidationResult.prototype = {
   /**
    * Check a result is valid.
    * @property valid
    * @type {Boolean}
    */
    valid: true
  };
  _.extend(ValidationResult, BackboneSurvey.Extendable);

  /**
   * A valid result.
   *
   * @class ValidationResult.OK
   * @extends {ValidationResult}
   */
  ValidationResult.OK = ValidationResult.extend({ valid: true });

  /**
   * A invalid result.
   *
   * @class ValidationResult.Error
   * @extends {ValidationResult}
   */
  ValidationResult.Error = ValidationResult.extend({ valid: false });

  /**
   * @class Validator
   * @uses Extendable
   * @constructor
   * @param {Object} attr Merge into
 {{#crossLink "Validator/attributes:property"}}{{/crossLink}}
   */
  var Validator = BackboneSurvey.Validator = function(attr) {
   /**
    * @property attributes
    * @type {Object}
    */
    this.attributes = attr || {};
  };
  Validator.prototype = {
    /**
     * Run validation.
     *
     * @method validate
     * @param {Array} value An array of variables.
     * @param {Object} data
     * @return {ValidationResult}
     */
    validate: function(value, data) {
      return new ValidationResult.OK();
    }

    /**
     * Returns a validation message.
     *
     * @method message
     * @param {Object} [attr] Any template variables.
     * @return {String}
     */
  , message: function(attr) {
      attr = attr || {};
      return (_.isString(this.attributes.template)) ?
        _.template(this.attributes.template)(_.extend(this.attributes, attr)) :
        (this.attributes.message || "");
    }
  };
  _.extend(Validator, BackboneSurvey.Extendable);

  /**
   *
<pre><code>var validator = new RequiredValidator({
    message: "Name is Required."
});
</code></pre>
   *
   * @class RequiredValidator
   * @extends {Validator}
   */
  BackboneSurvey.RequiredValidator = Validator.extend({
    validate: function(value, data) {
      var vs = _.isArray(value) ? value : [value];
      var result;
      if (vs.length === 0) {
        result = new ValidationResult.Error(this.message());
      } else {
        var me = this;
        _.each(vs, function(v) {
          if (result) return;
          if (_.isNumber(v)) v = v.toString();
          if (_.isEmpty(v)) {
            result = new ValidationResult.Error(me.message());
          }
        });
        if (!result) {
            result = new ValidationResult.OK();
        }
      }
      return result;
    }
  });

  /**
   *
<pre><code>var validator = new RangeLengthValidator({
    message: "Name must be between 8 and 32."
  , min: 8
  , max: 32
});</code></pre>
   *
   * @class RangeLengthValidator
   * @extends {Validator}
   */
  BackboneSurvey.RangeLengthValidator = Validator.extend({
    validate: function(value, data) {
      var vs = _.isArray(value) ? value : [value];
      var result;
      var me = this;
      _.each(vs, function(v) {
        if (result) return;
        if (_.isNumber(v)) v = v.toString();
        var min = _.isNumber(me.attributes.min) ? me.attributes.min : null;
        var max = _.isNumber(me.attributes.max) ? me.attributes.max : null;
        if ((min && min > v.length) || (max && max < v.length)) {
          result = new ValidationResult.Error(me.message());
        }
      });
      if (!result) {
          result = new ValidationResult.OK();
      }
      return result;
    }
  });
})();
/**
 * @module backbone-survey
 */
var BackboneSurvey = BackboneSurvey || {};

(function() {
  /**
   * @class Section
   * @extends {Backbone.Model}
   */
  var Section = BackboneSurvey.Section = Backbone.Model.extend({
    constructor: function() {
      Backbone.Model.apply(this, arguments);
    }

  , defaults: {
      page: 0
    , type: BackboneSurvey.QuestionType.NONE
    , question: ""
    , label: ""
    , guide: ""
    , options: [] // select options
    , textOptions: [] // option keys that need a free text answer
    , singleOptions: [] // option keys that disable the other keys
    , optionAnswers: [] // selected options
    , textAnswers: [] // free text answers
    , defaultOptionAnswers: []
    , defaultTextAnswers: []
    , rules: []
    , routeDependencies: []
    }

  , set: function(key, val, options) {
      if (key === null) return this;

      if (typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      // :id must be a string
      if (typeof(attrs.id) !== "undefined") {
        attrs.id = attrs.id.toString();
      }
      // :page must be a number
      if (typeof(attrs.page) !== "undefined") {
        attrs.page = _.isNumber(attrs.page) ? parseInt(attrs.page, 10) : 0;
      }

      // Convert :options string to object
      if (typeof(attrs.options) !== "undefined") {
        var opts = attrs.options || [];
        attrs.options = [];
        _.each(opts, function(v) {
          if (typeof(v) !== "object") {
            v = { value: v.toString(), label: v.toString() };
          }
          attrs.options.push(v);
        });
      }

      Backbone.Model.prototype.set.call(this, attrs, options);
    }

  , validate: function(attr, options) {
      var errors = [];
      var answers = this.answers(attr);
      var me = this;
      _.each(this.attributes.rules, function(rule) {
        if (errors.length > 0) return;
        var result = rule.validate(answers, me.attributes);
        if (!result.valid) errors.push(result.message);
      });
      if (errors.length > 0) return errors;
    }

    /**
     * Pick answers according to a section type.
     *
     * @method answers
     * @param {Object} [attr] If it's undefined, Use this.attributes.
     * @return {Array}
     */
  , answers: function(attr) {
      attr = attr || this.attributes;
      var vals = [];
      switch (this.get("type")) {
        case BackboneSurvey.QuestionType.TEXT:
          vals = attr.textAnswers;
          break;
        case BackboneSurvey.QuestionType.RADIO:
        case BackboneSurvey.QuestionType.CHECKBOX:
          vals = attr.optionAnswers;
          break;
        default:
          break;
      }
      return vals;
    }

    /**
     * Clear answer attributes.
     *
     * @method clearAnswers
     */
  , clearAnswers: function() {
      this.set({
        optionAnswers: []
      , textAnswers: []
      }, { silent: true });
    }
  });

  /**
   * @class Sections
   * @extends {Backbone.Collection}
   */
  var Sections = BackboneSurvey.Sections = Backbone.Collection.extend({
    model: Section

    /**
     * @method fistPage
     * @return {Number}
     */
  , firstPage: function() {
      return this.reduce(function(memo, model) {
        var p = model.get("page");
        return (memo === 0 || memo > p) ? p : memo;
      }, 0);
    }

    /**
     * @method lastPage
     * @return {Number}
     */
  , lastPage: function() {
      return this.reduce(function(memo, model) {
        var p = model.get("page");
        return (memo === 0 || memo < p) ? p : memo;
      }, 0);
    }

    /**
     * @method prevPage
     * @param {Number} currentPage
     * @return {Number}
     */
  , prevPage: function(currentPage) {
      var ps = [];
      this.each(function(model) {
        var p = model.get("page");
        if (p < currentPage) {
          ps.push(p);
        }
      });
      ps = _.sortBy(ps, function(n) { return -1 * n; });
      return (ps.length > 0) ? ps[0] :
          (currentPage === 0) ? this.firstPage() : currentPage;
    }

    /**
     * @method nextPage
     * @param {Number} currentPage
     * @return {Number}
     */
  , nextPage: function(currentPage) {
      var ps = [];
      this.each(function(model) {
        var p = model.get("page");
        if (p > currentPage) {
          ps.push(p);
        }
      });
      ps = _.sortBy(ps, function(n) { return n; });
      var last = this.lastPage();
      return (ps.length > 0) ? ps[0] :
          (currentPage === 0 || last < currentPage) ? last : currentPage;
    }
  });

  /**
   * @class Survey
   * @extends {Backbone.Model}
   */
  var Survey = BackboneSurvey.Survey = Backbone.Model.extend({
    constructor: function() {
      /**
       * @property sections
       * @type {Sections}
       */
      this.sections = new Sections();
      Backbone.Model.apply(this, arguments);
    }

  , defaults: {
      title: ""
    , page: 0
    }

    /**
     * Parser method for using `{ parse: true }` option.
     *
<pre><code>var survey = new BackboneSurvey.Survey({
    survey: {
      // Survey.attributes ....
    }
  , sections: [
      // An array of Section.attributes ....
    ]
}, { parse: true });
</code></pre>
     *
     * @method parse
     * @param {Object} resp
     * @param {Object} options
     * @return {Object} attributes
     */
  , parse: function(resp, options) {
      this.sections.reset(_.filter(resp.sections || [], function(s) {
          // Remove invalid id section
          return s.id.toString().match(/^[-_0-9a-zA-Z]+$/); }));
      return resp.survey;
    }

    /**
     * Move to a first page, and reset all answers.
     *
     * @method startPage
     */
  , startPage: function() {
      this.sections.each(function(section) {
        section.clearAnswers();
        section.set({
          optionAnswers: section.get("defaultOptionAnswers")
        , textAnswers: section.get("defaultTextAnswers")
        });
      });
      var p = this.sections.firstPage();
      this.set({ page: p });
    }

    /**
     * Move to a prev page.
     *
     * @method prevPage
     */
  , prevPage: function() {
      var p = this.sections.prevPage(this.get("page"));
      if (p != this.get("page")) {
        this.set({ page: p });
      }
    }

    /**
     * Move to a next page.
     *
     * @method nextPage
     */
  , nextPage: function() {
      var p = this.sections.nextPage(this.get("page"));
      if (p != this.get("page")) {
        this.set({ page: p });
      }
    }

    /**
     * @method isFirstPage
     * @return {Boolean}
     */
  , isFirstPage: function() {
      return (this.get("page") === this.sections.firstPage());
    }

    /**
     * @method isLastPage
     * @return {Boolean}
     */
  , isLastPage: function() {
      return (this.get("page") === this.sections.lastPage());
    }

    /**
     * Returns an array of all answers.
     *
     * @method answers
     * @return {Array}
     */
  , answers: function() {
      var ans = [];
      this.sections.each(function(section) {
        if (section.get("type") === BackboneSurvey.QuestionType.NONE) {
          return;
        }
        ans.push({
          id: section.id
        , textAnswers: section.get("textAnswers")
        , optionAnswers: section.get("optionAnswers")
        });
      });
      return ans;
    }
  });
  // Global Survey instance
  BackboneSurvey.survey = new Survey();
})();
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
    }

    /**
     * @method render
     * @chainable
     */
  , render: function() {
      if (BackboneSurvey.logger) {
        BackboneSurvey.logger.debug(["SurveyView#render", this.model]);
      }
      this.$title.html(this.model.get("title") || "");
      this.$sections.html("");
      this.sectionViewMap = {};
      if (this.model.get("page") > 0) {
        var me = this;
        this.model.sections
          .each(function(section) {
            if (section.get("page") !== me.model.get("page")) {
              return;
            }
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
        this.$el.show();
      } else {
        this.$el.hide();
      }
      return this;
    }

    /**
     * @method startPage
     */
  , startPage: function() {
      this.model.startPage();
    }

    /**
     * @method prevPage
     */
  , prevPage: function() {
      this.model.prevPage();
    }

    /**
     * @method nextPage
     */
  , nextPage: function() {
      var valid = true;
      for (var k in this.sectionViewMap) {
        var model = this.model.sections.get(k);
        if (!model) return;
        model.clearAnswers();
        var view = this.sectionViewMap[k];
        var $error = view.$("." + this.elPrefix + "error");
        $error.html("").hide();
        model.set({
          textAnswers: view.textAnswers()
        , optionAnswers: view.optionAnswers()
        }, { validate: true });
        // RV : Async validation support
        if (model.validationError) {
          valid = false;
          $error.html(_.template(this.templates.error)(
              { errors: model.validationError })).show();
        }
      }
      if (valid) {
        if (this.model.isLastPage()) {
          this.$el.html("");
          this.trigger("completed", this);
        } else {
          this.model.nextPage();
        }
      }
    }
  });

  /**
   * @class SectionView
   * @extends {Backbone.View}
   */
  var SectionView = BackboneSurvey.SectionView = Backbone.View.extend({
    tagName: "div"

  , template: '<div class="<%- elPrefix %>question">' +
      '<span class="<%- elPrefix %>question-title"><%= model.question %></span></div>' +
      '<div id="<%- elPrefix %>error-<%- model.id %>" class="<%- elPrefix %>error"></div>' +
      '<div id="<%- elPrefix %>answer-<%- model.id %>" class="<%- elPrefix %>answer"></div>'

  , initialize: function() {
      this.elPrefix = this.elPrefix || "survey-";
      this.answerView = AnswerViewFactory(this);
    }

    /**
     * @method render
     * @chainable
     */
  , render: function() {
      this.$el.html(_.template(this.template)({
        elPrefix : this.elPrefix
      , model: this.model.toJSON()
      }));
      this.$("#" + this.elPrefix + "answer-" + this.model.id)
          .html(this.answerView.render().el);
      return this;
    }

    /**
     * @method textAnswers
     * @return {Array}
     */
  , textAnswers: function() {
      return (this.answerView) ? this.answerView.textAnswers() : [];
    }

    /**
     * @method optionAnswers
     * @return {Array}
     */
  , optionAnswers: function() {
      return (this.answerView) ? this.answerView.optionAnswers() : [];
    }
  });

  var AnswerViewFactory = BackboneSurvey.AnswerViewFactory = function(sectionView) {
    var func;
    switch (sectionView.model.get("type")) {
      case BackboneSurvey.QuestionType.TEXT:
        func = BackboneSurvey.TextAnswerView;
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
    render: function() {
      return this;
    }

    /**
     * @method textAnswers
     * @return {Array}
     */
  , textAnswers: function() { return []; }

    /**
     * @method optionAnswers
     * @return {Array}
     */
  , optionAnswers: function() { return []; }
  });

  /**
   * @class TextAnswerView
   * @extends {Backbone.View}
   */
  var TextAnswerView = BackboneSurvey.TextAnswerView = Backbone.View.extend({
    template: '<%= label %><input type="text" name="answer-<%- id %>"' +
      '<% if (textAnswers.length !== 0) { %> value="<%- textAnswers[0] %>"<% } %>>' +
      '<%= guide %>'

    /**
     * @method render
     * @chainable
     */
  , render: function() {
      this.$el.html(_.template(this.template)(this.model.toJSON()));
      return this;
    }

    /**
     * @method textAnswers
     * @return {Array}
     */
  , textAnswers: function() {
      var v = this.$('[name="answer-' + this.model.id + '"]').val();
      return (_.isEmpty(v)) ? [] : [v];
    }

    /**
     * @method optionAnswers
     * @return {Array}
     */
  , optionAnswers: function() { return []; }
  });

  /**
   * @class OptionAnswerViewProto
   */
  var OptionAnswerViewProto = {
    /**
     * @method render
     * @chainable
     */
    render: function() {
      this.$el.html(_.template(this.template)(this.model.toJSON()));
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
    }

    /**
     * @method textAnswers
     * @return {Array}
     */
  , textAnswers: function() { return []; }

    /**
     * @method optionAnswers
     * @return {Array}
     */
  , optionAnswers: function() {
      var vs = [];
      this.$('[name="answer-' + this.model.id + '"]').each(function() {
        var $this = $(this);
        if ($this.prop("checked")) vs.push($this.val());
      });
      return vs;
    }
  };

  /**
   * @class RadioAnswerView
   * @extends {Backbone.View}
   * @uses OptionAnswerViewProto
   */
  var RadioAnswerView = BackboneSurvey.RadioAnswerView = Backbone.View.extend({
    template: '<ul><% _.each(options, function(option) { %>' +
      '<li><label><input type="radio" name="answer-<%- id %>" value="<%- option.value %>"' +
      '<% if (_.contains(optionAnswers, option.value)) { %> checked="checked"<% } %>>' +
      '<%- option.label %></label></li><% }); %></ul>'
  });
  _.extend(RadioAnswerView.prototype, OptionAnswerViewProto);

  /**
   * @class CheckboxAnswerView
   * @extends {Backbone.View}
   * @uses OptionAnswerViewProto
   */
  var CheckboxAnswerView = BackboneSurvey.CheckboxAnswerView = Backbone.View.extend({
    template: '<ul><% _.each(options, function(option) { %>' +
      '<li><label><input type="checkbox" name="answer-<%- id %>" value="<%- option.value %>"' +
      '<% if (_.contains(optionAnswers, option.value)) { %> checked="checked"<% } %>>' +
      '<%- option.label %></label></li><% }); %></ul>'
  });
  _.extend(CheckboxAnswerView.prototype, OptionAnswerViewProto);
})();
