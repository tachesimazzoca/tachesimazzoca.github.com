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
     * See {{#crossLink "RadioAnswerView"}}{{/crossLink}}
     *
     * @property RadioAnswerView
     * @type {String}
     */
  , RadioAnswerView: '<ul><% _.each(model.options, function(option, i) { %>' +
      '<li><label><input type="radio" name="answer-<%- model.id %>" value="<%- option.value %>"' +
      '<% if (_.contains(model.answers, option.value)) { %> checked="checked"<% } %>>' +
      '<%= option.label %></label>' +
      '<% if (option.sub) { %>' +
      ' <input type="text" name="sub-<%- model.id %>-<%- i %>" placeholder="<%- option.sub.placeholder %>"' +
      '<% if (!_.isEmpty(model.subAnswer[option.value])) { %> value="<%- model.subAnswer[option.value] %>"<% } %>>' +
      '<% } %>' +
      '</li><% }); %></ul>'

    /**
     * See {{#crossLink "CheckboxAnswerView"}}{{/crossLink}}
     *
     * @property CheckboxAnswerView
     * @type {String}
     */
  , CheckboxAnswerView: '<ul><% _.each(model.options, function(option, i) { %>' +
      '<li><label><input type="checkbox" name="answer-<%- model.id %>" value="<%- option.value %>"' +
      '<% if (_.contains(model.answers, option.value)) { %> checked="checked"<% } %>>' +
      '<%= option.label %></label>' +
      '<% if (option.sub) { %>' +
      ' <input type="text" name="sub-<%- model.id %>-<%- i %>" placeholder="<%- option.sub.placeholder %>"' +
      '<% if (!_.isEmpty(model.subAnswer[option.value])) { %> value="<%- model.subAnswer[option.value] %>"<% } %>>' +
      '<% } %>' +
      '</li><% }); %></ul>'

    /**
     * @property ImageCardAnswerView
     * @type {String}
     */
  , ImageCardAnswerView: '<ul><% _.each(model.options, function(option, i) { %>' +
      '<li><a onclick="return false;" href="javascript:void();"' +
      ' <% if (_.contains(model.answers, option.value)) { %> class="survey-selected"<% } %>>' +
      '<span><%= option.label %></span>' +
      '<input type="hidden" name="answer-<%- model.id %>" value="<%- option.value %>">' +
      '<% if (option.sub) { %>' +
      '<input type="hidden" name="sub-<%- model.id %>-<%- i %>"' +
      '<% if (!_.isEmpty(model.subAnswer[option.value])) { %> value="<%- model.subAnswer[option.value] %>"<% } %>>' +
      '<% } %>' +
      '</a></li><% }); %></ul>' +
      '<div class="<%= elPrefix %>sub-dialog"><div class="<%= elPrefix %>sub-dialog-inner">' +
      '<input type="text"><button>OK</button></div></div>'
  };
})();
