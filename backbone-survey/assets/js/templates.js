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
