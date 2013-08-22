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
    , options : {}
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
     * @param  {Number} p A current page
     * @param  {Object} option Survey#set option
     */
  , initAnswers: function(p, option) {
      p = p || 0;
      option = option || {};
      var sectionIds = this.get("answeredSectionIds");
      this.sections.each(function(section) {
        if (section.get("page") > p) {
          _.without(sectionIds, section.id);
          section.clearAnswers();
          section.set({
            answers: section.get("defaultAnswers")
          }, { silent: true });
        }
      });
      this.set({
        page: p
      , answeredSectionIds: sectionIds
      }, option);
    }

    /**
     * Move to a first page, and reset all answers.
     *
     * @method startPage
     */
  , startPage: function() {
      this.initAnswers(0, { silent: false });
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
        var resetOn =this.get("options").resetOn || [];
        if (_.contains(resetOn, "prev")) {
          this.initAnswers(p);
        } else {
          this.set({ page: p });
        }
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
        var resetOn =this.get("options").resetOn || [];
        if (_.contains(resetOn, "next")) {
          this.initAnswers(cp, { silent: true});
        }
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
        if (section) vs.push({
          id: id
        , routes: section.answeredRoutes()
        });
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
          var resolver =
            sections[i].get("resolver") ||
            new BackboneSurvey.SectionResolver(sections[i].get("routeDependencies") || []);
          if (!resolver.resolve(routes)) num--;
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
      this.initAnswers(0, { silent: true });

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
            this.initAnswers(0, { silent: true });
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
