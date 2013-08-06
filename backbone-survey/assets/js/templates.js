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
     * See {{#crossLink "MatrixAnswerView"}}{{/crossLink}}
     *
     * @property MatrixAnswerView
     * @type {String}
     */
  , MatrixAnswerView: '<table><tr><td></td>' +
      '<% _.each(model.options, function(option, i) { %>' +
      '<td><%- option.label %></td>' +
      '<% }); %></tr>' +
      '<% _.each(model.fields, function(field, i) { %><tr>' +
      '<td><%- field.label %></td>' +
      '<% _.each(model.options, function(option) { %><td>' +
      '<input type="<%- multiple? "checkbox" : "radio" %>"' +
      ' name="answer-<%- model.id %>-<%- i %>" value="<%- option.value %>"' +
      '<% if (_.contains(model.answers[i], option.value)) { %> checked="checked"<% } %>>' +
      '</td><% }); %>' +
      '</tr><% }); %>' +
      '</table>'

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
