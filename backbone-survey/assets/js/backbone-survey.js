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
    , routeDependencies: []
    , type: BackboneSurvey.QuestionType.NONE
    , question: ""
    , label: ""
    , guide: ""
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
      _.each(this.attributes.rules, function(rule) {
        if (errors.length > 0) return;
        var result = rule.validate(answers, me.attributes);
        if (!result.valid) errors.push(result.message);
      });
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
          this.model.nextPage();
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

  , template: '<div class="<%- elPrefix %>question">' +
      '<span class="<%- elPrefix %>question-title"><%= model.question %></span></div>' +
      '<div id="<%- elPrefix %>error-<%- model.id %>" class="<%- elPrefix %>error"></div>' +
      '<div id="<%- elPrefix %>answer-<%- model.id %>" class="<%- elPrefix %>answer"></div>'

  , initialize: function() {
      this.elPrefix = this.elPrefix || "survey-";
      this.answerView = AnswerViewFactory.create(this);
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
    template: '<%= label %><input type="text" name="answer-<%- id %>"' +
      '<% if (answers.length !== 0) { %> value="<%- answers[0] %>"<% } %>>' +
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
    template: '<ul><% _.each(options, function(option, i) { %>' +
      '<li><label><input type="radio" name="answer-<%- id %>" value="<%- option.value %>"' +
      '<% if (_.contains(answers, option.value)) { %> checked="checked"<% } %>>' +
      '<%- option.label %></label>' +
      '<% if (option.sub) { %>' +
      ' <input type="text" name="sub-<%- id %>-<%- i %>" placeholder="<%- option.sub.placeholder %>"' +
      '<% if (!_.isEmpty(subAnswer[option.value])) { %> value="<%- subAnswer[option.value] %>"<% } %>>' +
      '<% } %>' +
      '</li><% }); %></ul>'
  });
  _.extend(RadioAnswerView.prototype, OptionAnswerViewProto);

  /**
   * @class CheckboxAnswerView
   * @extends {Backbone.View}
   * @uses OptionAnswerViewProto
   */
  var CheckboxAnswerView = BackboneSurvey.CheckboxAnswerView = Backbone.View.extend({
    template: '<ul><% _.each(options, function(option, i) { %>' +
      '<li><label><input type="checkbox" name="answer-<%- id %>" value="<%- option.value %>"' +
      '<% if (_.contains(answers, option.value)) { %> checked="checked"<% } %>>' +
      '<%- option.label %></label>' +
      '<% if (option.sub) { %>' +
      ' <input type="text" name="sub-<%- id %>-<%- i %>" placeholder="<%- option.sub.placeholder %>"' +
      '<% if (!_.isEmpty(subAnswer[option.value])) { %> value="<%- subAnswer[option.value] %>"<% } %>>' +
      '<% } %>' +
      '</li><% }); %></ul>'
  });
  _.extend(CheckboxAnswerView.prototype, OptionAnswerViewProto);
})();
