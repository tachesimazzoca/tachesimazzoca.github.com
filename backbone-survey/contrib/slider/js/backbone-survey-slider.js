// Backbone Survey | SliderAnswerView

var BackboneSurvey = BackboneSurvey || {};

// Templates
// ---------
(function() {
  BackboneSurvey.Templates = BackboneSurvey.Templates || {};

  BackboneSurvey.Templates.SliderAnswerView =
    '<div id="<%- elPrefix %>slider"></div>' +
    '<%- model.contents.prefix %>' +
    '<input type="text" name="answer-<%- model.id %>" disabled="disabled">' +
    '<%- model.contents.suffix %>';
})();

// Views
// -----
(function() {
  BackboneSurvey.SliderAnswerView = Backbone.View.extend({
    templateName: "SliderAnswerView"

  , initialize: function() {
      this.elPrefix = this.elPrefix || "survey-";
    }

  , render: function() {
      this.$el.html(_.template(BackboneSurvey.Templates[this.templateName])({
        elPrefix: this.elPrefix
      , model: this.model.toJSON()
      }));
      var me = this;
      var contents = this.model.get("contents") || {};
      var initValue = contents.range[0];
      var $input = this.$('input[name="answer-' + this.model.id + '"]');
      $input.val(initValue);
      this.$('#' + this.elPrefix + 'slider').slider({
        value: initValue
      , min: contents.range[0]
      , max: contents.range[1]
      , step: 1
      , slide: function(e, ui) {
          $input.val(ui.value);
          me.trigger("answer");
        }
      });
      return this;
    }

  , answers: function() {
      var v = this.$('[name="answer-' + this.model.id + '"]').val();
      return (_.isEmpty(v)) ? [""] : [v];
    }

  , subAnswer: function() {
      return {};
    }
  });
})();
