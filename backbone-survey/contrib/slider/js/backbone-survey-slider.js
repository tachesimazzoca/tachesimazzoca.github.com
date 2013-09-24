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

  BackboneSurvey.Templates.OptionSliderAnswerView =
    '<ul class="<%- elPrefix %>slider-labels">' +
    '<% _.each(model.options, function(option) { %>' +
    '<li><%- option.label %></li>' +
    '<% }) %>' +
    '</ul>' +
    '<div id="<%- elPrefix %>slider"></div>' +
    '<div><%= model.contents.note %></div>' +
    '<input type="hidden" name="answer-<%- model.id %>">';
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
      var answers = this.model.get("answers") || [];
      var initValue = contents.range[0];
      if (answers.length) {
        var v = parseInt(answers[0], 10);
        if (v >= contents.range[0] && v <= contents.range[1]) {
          initValue = v;
        }
      }
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

  BackboneSurvey.OptionSliderAnswerView = Backbone.View.extend({
    templateName: "OptionSliderAnswerView"

  , initialize: function() {
      this.elPrefix = this.elPrefix || "survey-";
    }

  , render: function() {
      this.$el.html(_.template(BackboneSurvey.Templates[this.templateName])({
        elPrefix: this.elPrefix
      , model: this.model.toJSON()
      }));
      var me = this;
      var options = this.model.get("options") || [];
      var answers = this.model.get("answers") || [];
      var initValue = -1;
      if (answers.length > 0) {
        _.each(_.pluck(options, 'value'), function(v, idx) {
          if (answers[0] == v) initValue = idx;
        });
      }
      var $input = this.$('input[name="answer-' + this.model.id + '"]');
      if (initValue >= 0) {
        $input.val(initValue);
      }
      this.$('#' + this.elPrefix + 'slider').slider({
        value: initValue
      , min: -1
      , max: options.length - 1
      , step: 1
      , slide: function(e, ui) {
          if (ui.value < 0 || ui.value + 1 > options.length) return false;
          $input.val(options[ui.value].value);
          var $labels = me.$('ul.' + me.elPrefix + 'slider-labels');
          var selClass = me.elPrefix + "selected";
          $labels.find('> li').removeClass(selClass);
          $labels.find('> li:eq(' + ui.value + ')').addClass(selClass);
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
