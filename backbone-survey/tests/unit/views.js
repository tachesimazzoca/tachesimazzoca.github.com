(function($, _) {
  module("backbone-survey views");

  test("AnswerViewFactory", function() {
    var section = new BackboneSurvey.Section();
    var sectionView = new BackboneSurvey.SectionView({ model: section });
    var answerView;
    answerView = BackboneSurvey.AnswerViewFactory.create(sectionView);
    ok(answerView instanceof BackboneSurvey.NoneAnswerView, "default");

    section.set("type", BackboneSurvey.QuestionType.NONE);
    answerView = BackboneSurvey.AnswerViewFactory.create(sectionView);
    ok(answerView instanceof BackboneSurvey.NoneAnswerView, "NONE");

    section.set("type", BackboneSurvey.QuestionType.TEXT);
    answerView = BackboneSurvey.AnswerViewFactory.create(sectionView);
    ok(answerView instanceof BackboneSurvey.TextAnswerView, "TEXT");

    section.set("type", BackboneSurvey.QuestionType.RADIO);
    answerView = BackboneSurvey.AnswerViewFactory.create(sectionView);
    ok(answerView instanceof BackboneSurvey.OptionAnswerView, "RADIO");

    section.set("type", BackboneSurvey.QuestionType.CHECKBOX);
    answerView = BackboneSurvey.AnswerViewFactory.create(sectionView);
    ok(answerView instanceof BackboneSurvey.OptionAnswerView, "CHECKBOX");
  });

  test("TextAnswerView", function() {
    var ans = ["回答文<i>"];
    var section = new BackboneSurvey.Section({
      id: "q1" 
    , type: BackboneSurvey.QuestionType.TEXT
    , answers: ans
    });
    var view = new BackboneSurvey.TextAnswerView({ model: section });
    view.render();
    deepEqual(view.$el.html(), '<input type="text" name="answer-q1" value="回答文&lt;i&gt;">');
    deepEqual(view.answers(), ans);
  });

  test("RadioAnswerView", function() {
    var opts = [
      { value: "A", label: "回答A" }
    , { value: "B", label: "回答B" }
    ];
    var ans = ["B"];
    var section = new BackboneSurvey.Section({
      id: "q2" 
    , type: BackboneSurvey.QuestionType.RADIO
    , options: opts
    , answers: ans
    });
    var view = new BackboneSurvey.OptionAnswerView({ model: section });
    view.render();
    deepEqual(view.$el.html(),
      '<ul>' +
      '<li><label><input type="radio" name="answer-q2" value="A">回答A</label></li>' +
      '<li><label><input type="radio" name="answer-q2" value="B" checked="checked">回答B</label></li>' +
      '</ul>'
    );
    deepEqual(view.answers(), ans);
  });

  test("CheckboxAnswerView", function() {
    var opts = [
      { value: "1", label: "回答1" }
    , { value: "2", label: "回答2" }
    , { value: "3", label: "回答3" }
    , { value: "OTHER", label: "その他" }
    , { value: "NONE", label: "特になし" }
    ];
    var ans = ["1", "3"];
    var section = new BackboneSurvey.Section({
      id: "q3"
    , type: BackboneSurvey.QuestionType.CHECKBOX
    , options: opts
    , answers: _.union(ans, ["OTHER"]) // "OTHER" will be unchecked.
    , singleOptions: ["OTHER", "NONE"]
    });
    var view = new BackboneSurvey.OptionAnswerView({ model: section });
    view.render();
    deepEqual(view.$el.html(),
      '<ul>' +
      '<li><label><input type="checkbox" name="answer-q3" value="1" checked="checked">回答1</label></li>' +
      '<li><label><input type="checkbox" name="answer-q3" value="2">回答2</label></li>' +
      '<li><label><input type="checkbox" name="answer-q3" value="3" checked="checked">回答3</label></li>' +
      '<li><label><input type="checkbox" name="answer-q3" value="OTHER">その他</label></li>' +
      '<li><label><input type="checkbox" name="answer-q3" value="NONE">特になし</label></li>' +
      '</ul>'
    );
    deepEqual(view.answers(), ans);
  });
})(jQuery, _);
