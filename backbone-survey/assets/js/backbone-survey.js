/**
 * @module backbone-survey
 */
var BackboneSurvey = BackboneSurvey || {};

(function() {
  BackboneSurvey.VERSION = "0.1.2";

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
    , question: ""
    , label: ""
    , guide: ""
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
      if (this.get("type") === BackboneSurvey.QuestionType.MULTI) {
        var fields = this.get("fields") || [];
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
      this.routeResolver = {};
      this.routeResolver.prototype = {
        resolve: function(dependencies, routes) {
          return dependencies;
        }
      };
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
     * Move to a first page, and reset all answers.
     *
     * @method startPage
     */
  , startPage: function() {
      this.set("answeredSectionIds", []);
      this.sections.each(function(section) {
        section.clearAnswers();
        section.set({ answers: section.get("defaultAnswers") });
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
      var routes = this.answeredRoutes();
      var np = 0;
      var p = this.get("page");
      do {
        p = this.sections.nextPage(p);
        if (p === this.get("page")) { np = p; break; } // Not changed
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
        if (num > 0) { np = p; break; } // Any sections exitsts
      } while (p < this.sections.lastPage());

      if (np > 0) {
        this.set({ page: np });
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
      var ids = this.get("answeredSectionIds") || [];
      ids.push(id);
      this.set("answeredSectionIds", _.uniq(ids));
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
    SectionView: '<div class="<%- elPrefix %>question"><%= model.question %></div>' +
      '<% if (model.contents.main) { %><div class="<%- elPrefix %>contents-main"><%= model.contents.main %></div><% } %>' +
      '<div id="<%- elPrefix %>error-<%- model.id %>" class="<%- elPrefix %>error"></div>' +
      '<% if (model.contents.caption) { %><div class="<%- elPrefix %>contents-caption"><%= model.contents.caption %></div><% } %>' +
      '<div id="<%- elPrefix %>answer-<%- model.id %>" class="<%- elPrefix %>answer"></div>' +
      '<% if (model.contents.note) { %><div class="<%- elPrefix %>contents-note"><%= model.contents.note %></div><% } %>'

    /**
     * See {{#crossLink "TextAnswerView"}}{{/crossLink}}
     *
     * @property TextAnswerView
     * @type {String}
     */
  , TextAnswerView: '<%= model.label %><input type="text" name="answer-<%- model.id %>"' +
      '<% if (model.answers.length !== 0) { %> value="<%- model.answers[0] %>"<% } %>>' +
      '<%= model.guide %>'

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
     * See {{#crossLink "OptionAnswerViewProto"}}{{/crossLink}}
     *
     * @property OptionAnswerView
     * @type {String}
     */
  , OptionAnswerView: '<ul><% _.each(model.options, function(option, i) { %>' +
      '<li><label><input type="<%- multiple ? "checkbox" :  "radio" %>" name="answer-<%- model.id %>" value="<%- option.value %>"' +
      '<% if (_.contains(model.answers, option.value)) { %> checked="checked"<% } %>>' +
      '<%= option.label %></label>' +
      '<% if (option.sub) { %>' +
      ' <input type="text" name="sub-<%- model.id %>-<%- i %>" placeholder="<%- option.sub.placeholder %>"' +
      '<% if (!_.isEmpty(model.subAnswer[option.value])) { %> value="<%- model.subAnswer[option.value] %>"<% } %>>' +
      '<% } %>' +
      '</li><% }); %></ul>'

    /**
     * See {{#crossLink "TextCardAnswerView"}}{{/crossLink}}
     *
     * @property TextCardAnswerView
     * @type {String}
     */
  , TextCardAnswerView: '<ul><% _.each(model.options, function(option, i) { %>' +
      '<li><input type="<%- multiple ? "checkbox" :  "radio" %>"' +
      ' name="answer-<%- model.id %>" value="<%- option.value %>"' +
      ' id="<%- elPrefix %>answer-<%- model.id %>-<%- i %>"' +
      '<% if (_.contains(model.answers, option.value)) { %> checked="checked"<% } %>>' +
      '<% if (option.sub) { %>' +
      '<input type="hidden" name="sub-<%- model.id %>-<%- i %>" placeholder="<%- option.sub.placeholder %>"' +
      '<% if (!_.isEmpty(model.subAnswer[option.value])) { %> value="<%- model.subAnswer[option.value] %>"<% } %>>' +
      '<% } %>' +
      '<label for="<%- elPrefix %>answer-<%- model.id %>-<%- i %>"><%= option.label %></label>' +
      '</li><% }); %></ul>' +
      '<div class="<%- elPrefix %>dialog" style="display: none;"><div class="<%- elPrefix %>sub-dialog-inner">' +
      '<input type="text"><button>OK</button></div></div>'

    /**
     * See {{#crossLink "ImageCardAnswerView"}}{{/crossLink}}
     *
     * @property ImageCardAnswerView
     * @type {String}
     */
  , ImageCardAnswerView: '<ul><% _.each(model.options, function(option, i) { %>' +
      '<li>' +
      '<input type="hidden" name="answer-<%- model.id %>" value="<%- option.value %>">' +
      '<% if (option.sub) { %>' +
      '<input type="hidden" name="sub-<%- model.id %>-<%- i %>"' +
      '<% if (!_.isEmpty(model.subAnswer[option.value])) { %> value="<%- model.subAnswer[option.value] %>"<% } %>>' +
      '<% } %>' +
      '<label <% if (_.contains(model.answers, option.value)) { %> class="survey-selected"<% } %>>' +
      '<%= option.label %></label>' +
      '</li><% }); %></ul>' +
      '<div class="<%- elPrefix %>dialog" style="display: none;"><div class="<%- elPrefix %>sub-dialog-inner">' +
      '<input type="text"><button>OK</button></div></div>'
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
      $subDialog.find('button').on("click", function() {
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
      $subDialog.find('button').on("click", function() {
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
