/**
 * @module backbone-survey
 */
var BackboneSurvey = BackboneSurvey || {};

(function() {
  BackboneSurvey.VERSION = "0.1.3";

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
   * @property MATRIX
   * @type {AnswerType}
   * @static
   * @final
   */
  BackboneSurvey.AnswerType.MATRIX = new AnswerType();

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
   * @property MULTI
   * @type {QuestionType}
   * @static
   * @final
   */
  BackboneSurvey.QuestionType.MULTI = new QuestionType(BackboneSurvey.AnswerType.TEXT, true);

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

  /**
   * @property MATRIX
   * @type {QuestionType}
   * @static
   * @final
   */
  BackboneSurvey.QuestionType.MATRIX = new QuestionType(BackboneSurvey.AnswerType.MATRIX, false);

  /**
   * @property MATRIX_MULTI
   * @type {QuestionType}
   * @static
   * @final
   */
  BackboneSurvey.QuestionType.MATRIX_MULTI = new QuestionType(BackboneSurvey.AnswerType.MATRIX, true);
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
   * An invalid result.
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
<pre><code>var validator = new PatternValidator({
    message: "Name must be [a-z] characters"
  , pattern: "^[a-z]+$" // new RegExp(...)
});</code></pre>
   *
   * @class PatternValidator
   * @extends {Validator}
   */
  BackboneSurvey.PatternValidator = Validator.extend({
    validate: function(value, data) {
      var vs = _.isArray(value) ? value : [value];
      var result;
      var regex = new RegExp(this.attributes.pattern);
      var me = this;
      _.each(vs, function(v) {
        if (result) return;
        if (!_.isString(v)) v = (typeof(v) !== "undefined" && v !== null) ? v.toString() : "";
        if (!v.match(regex)) {
          result = new ValidationResult.Error(me.message());
        }
      });
      if (!result) {
          result = new ValidationResult.OK();
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
        if (!_.isString(v)) v = (typeof(v) !== "undefined" && v !== null) ? v.toString() : "";
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
    , routeDependencies: []
    , type: BackboneSurvey.QuestionType.NONE
    , contents: {}
    , fields: [] // multi fields
    , options: [] // select options
    , singleOptions: [] // option keys that disable the other keys
    , defaultAnswers: []
    , rules: []
    , answers: []
    , subAnswer: {}
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

      // Convert :contents must be an object
      if (typeof(attrs.contents) !== "undefined") {
          if (typeof(attrs.contents) !== "object") {
            attrs.contents = {};
          }
      }

      // Convert :options string to object
      if (typeof(attrs.options) !== "undefined") {
        var opts = attrs.options || [];
        attrs.options = [];
        _.each(opts, function(v) {
          if (typeof(v) !== "object") {
            v = { value: v, label: v };
          }
          v.label = v.label || v.value;
          v.value = v.value.toString();
          v.label = v.label.toString();
          if (typeof(v.route) !== "undefined") {
            v.route = v.route.toString();
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
      var fields = this.get("fields") || [];
      if (this.get("type") === BackboneSurvey.QuestionType.MULTI) {
        _.each(fields, function(field, i) {
          var rules = field.rules || [];
          var err = [];
          _.each(rules, function(rule) {
            if (err.length > 0) return;
            var result = rule.validate([answers[i]], me.attributes);
            if (!result.valid) errors.push(result.message);
          });
          _.union(errors, err);
        });
      } else if (this.get("type").answerType() === BackboneSurvey.AnswerType.MATRIX) {
        _.each(fields, function(field, i) {
          var rules = field.rules || [];
          var err = [];
          _.each(rules, function(rule) {
            if (err.length > 0) return;
            var result = rule.validate(answers[i], me.attributes);
            if (!result.valid) errors.push(result.message);
          });
          _.union(errors, err);
        });
      } else {
        _.each(this.attributes.rules, function(rule) {
          if (errors.length > 0) return;
          var result = rule.validate(answers, me.attributes);
          if (!result.valid) errors.push(result.message);
        });
      }
      if (errors.length > 0) return errors;
    }

    /**
     * Pick the answers according to the section type.
     *
     * @method answers
     * @param {Object} [attr] If it's undefined, Use this.attributes.
     * @return {Array}
     */
  , answers: function(attr) {
      attr = attr || this.attributes;
      return attr.answers;
    }

    /**
     * Clear all answer attributes.
     *
     * @method clearAnswers
     */
  , clearAnswers: function() {
      this.set({ answers: [] }, { silent: true });
    }

    /**
     * Returns the route keys.
     *
     * @method answeredRoutes
     * @return {Array}
     */
  , answeredRoutes: function() {
      var vs = [];
      var opts = this.get("options");
      switch (this.get("type")) {
        case BackboneSurvey.QuestionType.RADIO:
        case BackboneSurvey.QuestionType.CHECKBOX:
          var ans = this.answers();
          _.each(ans, function(a) {
            _.each(_.where(opts, { value: a }), function(o) {
              if (typeof(o.route) === "string" && !_.isEmpty(o.route)) {
                vs.push(o.route);
              }
            });
          });
          break;
        default:
          break;
      }
      return _.uniq(vs);
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
    , answeredSectionIds : []
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
      return resp.survey || {};
    }

    /**
     * Initialize all the answers and the status.
     *
     * @method initAnswers
     */
  , initAnswers: function() {
      this.set("answeredSectionIds", []);
      this.sections.each(function(section) {
        section.clearAnswers();
        section.set({ answers: section.get("defaultAnswers") });
      });
      this.set({ page: 0 }, { silent: true });
    }

    /**
     * Move to a first page, and reset all answers.
     *
     * @method startPage
     */
  , startPage: function() {
      this.initAnswers();
      var p = this.sections.firstPage();
      this.set({ page: p });
    }

    /**
     * Move to the previous page.
     *
     * @method prevPage
     */
  , prevPage: function() {
      // Select the previous page number
      var cp = this.get("page");
      var pages = _.sortBy(this.availablePages(), function(n) { return n; });
      pages.reverse();
      var p = cp;
      for (var i = 0; i < pages.length; i++) {
        if (pages[i] < p) {
          p = pages[i];
          break;
        }
      }
      if (p != this.get("page")) {
        this.set({ page: p });
      }
    }

    /**
     * Move to the next page.
     *
     * @method nextPage
     */
  , nextPage: function() {
      var me = this;
      // Add answered sectionIds
      var sectionIds = _.pluck(this.currentSections(), "id");
      _.each(sectionIds, function(sectionId) {
        me.addAnsweredSectionId(sectionId);
      });
      // Fire "completed" if all set
      if (this.isLastPage()) {
        this.trigger("completed");
        return;
      }
      // Select the next page number
      var cp = this.get("page");
      var pages = _.sortBy(this.availablePages(), function(n) { return n; });
      var p = this.sections.firstPage();
      for (var i = 0; i < pages.length; i++) {
        if (pages[i] > cp) {
          p = pages[i];
          break;
        }
      }
      if (p > cp) {
        this.set({ page: p });
      } else {
        this.trigger("completed");
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
     * Returns an array of Section in a current page.
     *
     * @method currentSections
     * @return {Array}
     */
  , currentSections: function() {
      return this.sections.where({ page: this.get("page") });
    }

    /**
     * Returns all answers.
     *
     * @method answers
     * @return {Array}
     */
  , answers: function() {
      var me = this;
      var ans = [];
      var sectionIds = this.get("answeredSectionIds") || [];
      _.each(sectionIds, function(sectionId) {
        var section = me.sections.get(sectionId);
        if (!section) return;
        if (section.get("type") === BackboneSurvey.QuestionType.NONE) return;
        ans.push({
          id: section.id
        , answers: section.get("answers")
        , subAnswer: section.get("subAnswer")
        });
      });
      return ans;
    }

    /**
     * Add an answered section ID.
     *
     * @method addAnsweredSectionId
     * @param {String} Section.id
     */
  , addAnsweredSectionId: function(id) {
      var section = this.sections.get(id);
      if (!section) return;
      var p = section.get("page");
      var ids = [];
      var answeredIds = this.get("answeredSectionIds") || [];
      // Remove greater sectionIds
      var me = this;
      _.each(answeredIds, function(answeredId) {
        var s = me.sections.get(answeredId);
        if (!s) return;
        if (s.get("page") <= p) ids.push(answeredId);
      });
      // Add new sectionIds
      ids.push(id);
      this.set("answeredSectionIds", _.uniq(ids), { silent: true });
    }

    /**
     * Returns the route keys in the sections.
     *
     * @method answeredRoutes
     * @return {Array}
     */
  , answeredRoutes: function() {
      var vs = [];
      var ids = this.get("answeredSectionIds") || [];
      var me = this;
      _.each(ids, function(id) {
        var section = me.sections.get(id);
        if (section) vs = _.union(vs, section.answeredRoutes());
      });
      return vs;
    }

    /**
     * Returns available page numbers.
     *
     * @method availablePages
     * @return {Array}
     */
  , availablePages: function() {
      var routes = this.answeredRoutes();
      var cp = this.get("page");
      var p = this.sections.firstPage();
      var pages = [p];

      if (p > cp) return pages;

      do {
        p = this.sections.nextPage(p);
        var sections = this.sections.where({ page: p });
        var num = sections.length;
        for (var i = 0; i < sections.length; i++) {
          var visible = true;
          var keys = sections[i].get("routeDependencies") || [];
          for (var j = 0; j < keys.length; j++) {
            var diff = _.difference(routes, _.flatten([keys[j]])); // Unmatched keys
            visible = _.difference(routes, diff).length > 0; // Not match any keys
            if (!visible) break;
          }
          if (!visible) num--;
        }
        if (num > 0) {
          pages.push(p);
          if (p > cp) break;
        }
      } while (p < this.sections.lastPage());

      return _.sortBy(pages, function(n) { return n; });
    }

    /**
     * Serialize the survey status.
     *
     * @method serializeStatus
     * @return {String}
     */
  , serializeStatus: function() {
      var data = {};
      data.page = this.get("page") || 0;
      data.answeredSectionIds = this.get("answeredSectionIds") || [];
      data.answers = [];
      this.sections.each(function(section) {
        data.answers.push({
          id: section.id
        , answers: section.get("answers")
        , subAnswer: section.get("subAnswer")
        });
      });
      return JSON.stringify(data);
    }

    /**
     * Unserialize a survey status.
     *
     * @method unserializeStatus
     * @param {String} serialized A serialized string Survey#serializeStatus returns
     * @param {Object} option Survey#set option
     * @return {Boolean}
     */
  , unserializeStatus: function(serialized, option) {
      var i;

      option = option || {};
      this.initAnswers();

      var data;
      try {
        data = JSON.parse(serialized);
      } catch (e) {
        console.log(e);
        return false;
      }
      if (typeof data !== "object" || !data) return false;

      data.page = data.page || 0;
      if (this.sections.lastPage() < data.page) return false;

      data.answeredSectionIds = data.answeredSectionIds || [];
      for (i = 0; i < data.answeredSectionIds.length; i++) {
        if (!this.sections.get(data.answeredSectionIds[i])) return false;
      }

      data.answers = data.answers || [];
      for (i = 0; i < data.answers.length; i++) {
        var section = this.sections.get(data.answers[i].id);
        if (!section) return false;
        var attr = {
          answers: data.answers[i].answers
        , subAnswer: data.answers[i].subAnswer
        };
        if (_.contains(data.answeredSectionIds, section.id)) {
          var errors = section.validate(attr);
          if (errors) {
            this.initAnswers();
            return false;
          }
        }
        section.set(attr, { silent: true });
      }

      this.set({
        page: data.page
      , answeredSectionIds: data.answeredSectionIds
      }, option);

      return true;
    }
  });
})();
/**
 * @module backbone-survey
 */
var BackboneSurvey = BackboneSurvey || {};

(function() {
  /**
   * @class Templates
   */
  BackboneSurvey.Templates = {
    /**
     * See {{#crossLink "SectionView"}}{{/crossLink}}
     *
     * @property SectionView
     * @type {String}
     */
    SectionView: '<div class="<%- elPrefix %>question"><%= model.contents.question %></div>' +
      '<div id="<%- elPrefix %>error-<%- model.id %>" class="<%- elPrefix %>error"></div>' +
      '<div id="<%- elPrefix %>answer-<%- model.id %>" class="<%- elPrefix %>answer"></div>'

    /**
     * See {{#crossLink "TextAnswerView"}}{{/crossLink}}
     *
     * @property TextAnswerView
     * @type {String}
     */
  , TextAnswerView: '<%= model.contents.prefix %><input type="text" name="answer-<%- model.id %>"' +
      '<% if (model.answers.length !== 0) { %> value="<%- model.answers[0] %>"<% } %>>' +
      '<%= model.contents.suffix %>'

    /**
     * See {{#crossLink "MultiAnswerView"}}{{/crossLink}}
     *
     * @property MultiAnswerView
     * @type {String}
     */
  , MultiAnswerView: '<dl><% _.each(model.fields, function(field, i) { %>' +
      '<dt><%= field.label %></dt>' +
      '<dd><input type="text" name="answer-<%- model.id %>-<%- i %>" value="<%- model.answers[i] %>"></dd>' +
      '<% }); %></dl>'

    /**
     * See {{#crossLink "OptionAnswerView"}}{{/crossLink}}
     *
     * @property OptionAnswerView
     * @type {String}
     */
  , OptionAnswerView:
      '<ul>' +
      '<% _.each(model.options, function(option, i) { %>' +
        '<li>' +
        '<input type="<%- multiple ? "checkbox" : "radio" %>"' +
        ' id="<%- elPrefix %>answer-<%- model.id %>-<%- i %>"' +
        ' name="answer-<%- model.id %>"' +
        ' data-answer-index="<%- i %>">' +
        '<label for="<%- elPrefix %>answer-<%- model.id %>-<%- i %>"><%= option.label %></label>' +
        '<% if (option.sub) { %>' +
        ' <input type="text" name="sub-<%- model.id %>-<%- i %>" placeholder="<%- option.sub.placeholder %>">' +
        '<% } %>' +
        '</li>' +
      '<% }); %>' +
      '</ul>'

    /**
     * See {{#crossLink "MatrixAnswerView"}}{{/crossLink}}
     *
     * @property MatrixAnswerView
     * @type {String}
     */
  , MatrixAnswerView:
      '<table>' +
      '<tr><td></td>' +
      '<% _.each(model.options, function(option, i) { %>' +
        '<td><%- option.label %></td>' +
      '<% }); %>' +
      '</tr>' +
      '<% _.each(model.fields, function(field, j) { %>' +
        '<tr>' +
        '<td><%- field.label %></td>' +
        '<% _.each(model.options, function(option, i) { %>' +
          '<td>' +
          '<input type="<%- multiple? "checkbox" : "radio" %>"' +
          ' name="answer-<%- model.id %>-<%- j %>"' +
          ' data-answer-index="<%- i %>">' +
          '</td>' +
        '<% }); %>' +
        '</tr>' +
      '<% }); %>' +
      '</table>'
  };
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
