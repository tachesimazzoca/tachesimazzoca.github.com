(function($) {
  module("backbone-survey models");

  test("Section", function() {
    var model;
    var attr = {};

    model = new BackboneSurvey.Section();
    attr = {
      textAnswers: ["回答テキスト"]
    , optionAnswers: ["1", "2"]
    };
    model.set(attr);
    deepEqual(model.get("textAnswers"), attr.textAnswers);
    deepEqual(model.get("optionAnswers"), attr.optionAnswers);
    model.clearAnswers();
    deepEqual(model.get("textAnswers"), []);
    deepEqual(model.get("optionAnswers"), []);

    model.set({ options: ["A", "B"] });
    deepEqual(model.get("options"), [
      { value: "A", label: "A" }
    , { value: "B", label: "B" }
    ], ".set with normalizer");
  });

  test("Sections", function() {
    var sections = new BackboneSurvey.Sections([
      { id: "q1" , page: 1 }
    , { id: "q2" , page: 1 }
    , { id: "q3" , page: 2 }
    ]);
    deepEqual(sections.firstPage(), 1);
    deepEqual(sections.lastPage(), 2);
    deepEqual(sections.prevPage(0), 1);
    deepEqual(sections.prevPage(1), 1);
    deepEqual(sections.prevPage(2), 1);
    deepEqual(sections.prevPage(3), 2);
    deepEqual(sections.prevPage(4), 2);
    deepEqual(sections.nextPage(0), 1);
    deepEqual(sections.nextPage(1), 2);
    deepEqual(sections.nextPage(2), 2);
    deepEqual(sections.nextPage(3), 2);
  });
})(jQuery);
