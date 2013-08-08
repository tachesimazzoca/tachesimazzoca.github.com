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
        '<input type="<%- multiple ? "checkbox" :  "radio" %>"' +
        ' id="<%- elPrefix %>answer-<%- model.id %>-<%- i %>"' +
        ' name="answer-<%- model.id %>" value="<%- option.value %>"' +
        ' value="<%- option.value %>"' +
        '<% if (_.contains(model.answers, option.value)) { %> checked="checked"<% } %>>' +
        '<label for="<%- elPrefix %>answer-<%- model.id %>-<%- i %>"><%= option.label %></label>' +
        '<% if (option.sub) { %>' +
        ' <input type="text" name="sub-<%- model.id %>-<%- i %>" placeholder="<%- option.sub.placeholder %>"' +
        '<% if (!_.isEmpty(model.subAnswer[option.value])) { %> value="<%- model.subAnswer[option.value] %>"<% } %>>' +
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
      '<% _.each(model.fields, function(field, i) { %>' +
        '<tr>' +
        '<td><%- field.label %></td>' +
        '<% _.each(model.options, function(option) { %>' +
          '<td>' +
          '<input type="<%- multiple? "checkbox" : "radio" %>"' +
          ' name="answer-<%- model.id %>-<%- i %>" value="<%- option.value %>"' +
          '<% if (_.contains(model.answers[i], option.value)) { %> checked="checked"<% } %>>' +
          '</td>' +
        '<% }); %>' +
        '</tr>' +
      '<% }); %>' +
      '</table>'

    /**
     * @property TextDialogView
     * @type {String}
     */
  , TextDialogView:
      '<div class="<%- elPrefix %>dialog-container">' +
        '<div class="<%- elPrefix %>dialog-inner">' +
          '<input class="<%- elPrefix %>dialog-input" type="text"' +
            ' value="<%- value %>" placeholder="<%- placeholder %>">' +
          '<button class="<%- elPrefix %>dialog-submit">OK</button>' +
          '<button class="<%- elPrefix %>dialog-cancel">Cancel</button>' +
        '</div>' +
      '</div>'

    /**
     * See {{#crossLink "TextCardAnswerView"}}{{/crossLink}}
     *
     * @property TextCardAnswerView
     * @type {String}
     */
  , TextCardAnswerView:
      '<ul>' +
      '<% _.each(model.options, function(option, i) { %>' +
        '<li>' +
        '<input type="<%- multiple ? "checkbox" :  "radio" %>"' +
        ' name="answer-<%- model.id %>" value="<%- option.value %>"' +
        ' id="<%- elPrefix %>answer-<%- model.id %>-<%- i %>"' +
        '<% if (_.contains(model.answers, option.value)) { %> checked="checked"<% } %>>' +
        '<% if (option.sub) { %>' +
          '<input type="hidden" name="sub-<%- model.id %>-<%- i %>" placeholder="<%- option.sub.placeholder %>"' +
          '<% if (!_.isEmpty(model.subAnswer[option.value])) { %>' +
            ' value="<%- model.subAnswer[option.value] %>"<% } %>>' +
        '<% } %>' +
        '<label for="<%- elPrefix %>answer-<%- model.id %>-<%- i %>">' +
        '<span class="<%- elPrefix %>label">' +
        '<% if (!_.isEmpty(model.subAnswer[option.value])) { %>' +
          '<%- model.subAnswer[option.value] %>' +
        '<% } else { %>' +
          '<%= option.label %>' +
        '<% } %>' +
        '</span>' +
        '</label>' +
        '</li>' +
      '<% }); %>' +
      '</ul>' +
      '<div id="<%- elPrefix %>dialog-<%- model.id %>"></div>'

    /**
     * See {{#crossLink "ImageCardAnswerView"}}{{/crossLink}}
     *
     * @property ImageCardAnswerView
     * @type {String}
     */
  , ImageCardAnswerView:
      '<ul>' +
      '<% _.each(model.options, function(option, i) { %>' +
        '<li>' +
        '<input type="hidden" name="answer-<%- model.id %>" value="<%- option.value %>">' +
        '<% if (option.sub) { %>' +
          '<input type="hidden" name="sub-<%- model.id %>-<%- i %>" placeholder="<%- option.sub.placeholder %>"' +
              '<% if (!_.isEmpty(model.subAnswer[option.value])) { %>' +
                ' value="<%- model.subAnswer[option.value] %>"<% } %>>' +
        '<% } %>' +
        '<label <% if (_.contains(model.answers, option.value)) { %> class="survey-selected"<% } %>>' +
        '<span class="<%- elPrefix %>label">' +
          '<% if (!_.isEmpty(model.subAnswer[option.value])) { %>' +
            '<%- model.subAnswer[option.value] %>' +
          '<% } else { %>' +
            '<%= option.label %>' +
          '<% } %>' +
        '</span>' +
        '</label>' +
        '</li>' +
      '<% }); %>' +
      '</ul>' +
      '<div id="<%- elPrefix %>dialog-<%- model.id %>"></div>'
  };
})();
