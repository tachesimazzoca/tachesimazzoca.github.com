(function($) {
  module("backbone-survey enum");

  test("AnswerType is type safe enum.", function() {
    var keys = [
      "NONE"
    , "TEXT"
    , "OPTION"
    , "MATRIX"
    ];
    for (var i = 0; i < keys.length; i++) {
      eval("var a = BackboneSurvey.AnswerType." + keys[i]);
      eval("var b = BackboneSurvey.AnswerType." + keys[i]);
      ok(a === b);
      for (var j = 0; j < keys.length; j++) {
        if (i === j) { continue; }
        eval("var c = BackboneSurvey.AnswerType." + keys[j]);
        ok(a !== c);
        ok(a != c);
      }
    }
  });

  test("QuestionType is type safe enum.", function() {
    var keys = [
      "NONE"
    , "TEXT"
    , "MULTI"
    , "RADIO"
    , "CHECKBOX"
    , "MATRIX"
    , "MATRIX_MULTI"
    ];
    for (var i = 0; i < keys.length; i++) {
      eval("var a = BackboneSurvey.QuestionType." + keys[i]);
      eval("var b = BackboneSurvey.QuestionType." + keys[i]);
      ok(a === b);
      for (var j = 0; j < keys.length; j++) {
        if (i === j) { continue; }
        eval("var c = BackboneSurvey.QuestionType." + keys[j]);
        ok(a !== c);
        ok(a != c);
      }
    }
  });

  test("QuestionType methods", function() {
    ok(BackboneSurvey.QuestionType.NONE.answerType() === BackboneSurvey.AnswerType.NONE);
    ok(BackboneSurvey.QuestionType.NONE.multiple() === false);

    ok(BackboneSurvey.QuestionType.TEXT.answerType() === BackboneSurvey.AnswerType.TEXT);
    ok(BackboneSurvey.QuestionType.TEXT.multiple() === false);

    ok(BackboneSurvey.QuestionType.MULTI.answerType() === BackboneSurvey.AnswerType.TEXT);
    ok(BackboneSurvey.QuestionType.MULTI.multiple() === true);

    ok(BackboneSurvey.QuestionType.RADIO.answerType() === BackboneSurvey.AnswerType.OPTION);
    ok(BackboneSurvey.QuestionType.RADIO.multiple() === false);

    ok(BackboneSurvey.QuestionType.CHECKBOX.answerType() === BackboneSurvey.AnswerType.OPTION);
    ok(BackboneSurvey.QuestionType.CHECKBOX.multiple() === true);

    ok(BackboneSurvey.QuestionType.MATRIX.answerType() === BackboneSurvey.AnswerType.MATRIX);
    ok(BackboneSurvey.QuestionType.MATRIX.multiple() === false);

    ok(BackboneSurvey.QuestionType.MATRIX_MULTI.answerType() === BackboneSurvey.AnswerType.MATRIX);
    ok(BackboneSurvey.QuestionType.MATRIX_MULTI.multiple() === true);
  });
})(jQuery);
