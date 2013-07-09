(function($) {
  module("backbone-survey models");

  test("Section#clearAnswers", function() {
    var model;
    var attr = {};

    model = new BackboneSurvey.Section();
    attr = { answers: ["1", "2"] };
    model.set(attr);
    deepEqual(model.get("answers"), attr.answers);
    model.clearAnswers();
    deepEqual(model.get("answers"), []);
  });

  test("Section#set should normalize :options", function() {
    var model = new BackboneSurvey.Section();
    var attr = {};
    model.set({ options: ["A", "B"] });
    deepEqual(model.get("options"), [
      { value: "A", label: "A" }
    , { value: "B", label: "B" }
    ]);
  });

  test("Section#answeredRoutes", function() {
    var model = new BackboneSurvey.Section();
    model.set({
      type: BackboneSurvey.QuestionType.CHECKBOX
    , options: [
        { value: "1", label: "1", route: "A" }
      , { value: "2", label: "2" }
      , { value: "3", label: "3", route: "A" }
      , { value: "0", label: "None", route: "N" }
      ]
    });
    model.set({ answers: ["2"] });
    deepEqual(model.answeredRoutes(), []);
    model.set({ answers: ["1"] });
    deepEqual(model.answeredRoutes(), ["A"]);
    model.set({ answers: ["0"] });
    deepEqual(model.answeredRoutes(), ["N"]);
    model.set({ answers: ["1", "3"] });
    deepEqual(model.answeredRoutes(), ["A"]);
    model.set({ answers: ["1", "0"] });
    deepEqual(model.answeredRoutes(), ["A", "N"]);
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

  test("Survey#addAnsweredSectionId", function() {
    var survey;
    survey = new BackboneSurvey.Survey();
    deepEqual(survey.get("answeredSectionIds"), []);

    survey.addAnsweredSectionId("unknownId");
    deepEqual(survey.get("answeredSectionIds"), [],
        "#addAnsweredSectionId should skip a non-exsitence ID.");

    survey = new BackboneSurvey.Survey({
      sections: [
        { id: "q1" }
      , { id: "q2" }
      ]
    }, { parse: true });
    survey.addAnsweredSectionId("q1");
    survey.addAnsweredSectionId("q1");
    deepEqual(survey.get("answeredSectionIds"), ["q1"],
        ":answeredSectionIds should be a unique set.");
  });

  test("Survey#nextPage", function() {
    var survey, sections;
    survey = new BackboneSurvey.Survey({
      sections: [
        { id: "q1", page: 1 }
      , { id: "q2", page: 2 }
      , { id: "q2-2", page: 2 }
      , { id: "q3", page: 3 }
      ]
    }, { parse: true });
    survey.nextPage();
    deepEqual(survey.get("page"), 1);
    sections = survey.currentSections();
    deepEqual(sections.length, 1);
    deepEqual(sections[0].id, "q1");

    survey.nextPage();
    deepEqual(survey.get("page"), 2);
    sections = survey.currentSections();
    deepEqual(sections.length, 2);
    deepEqual(sections[0].id, "q2");
    deepEqual(sections[1].id, "q2-2");

    survey.nextPage();
    deepEqual(survey.get("page"), 3);
    sections = survey.currentSections();
    deepEqual(sections.length, 1);
    deepEqual(sections[0].id, "q3");

    survey.nextPage();
    deepEqual(survey.get("page"), 3);
    sections = survey.currentSections();
    deepEqual(sections.length, 1);
    deepEqual(sections[0].id, "q3");
  });

  test("Survey#nextPage with routeDependencies", function() {
    var survey, section;
    survey = new BackboneSurvey.Survey({
      sections: [
        { id: "q1" , page: 1
        , type: BackboneSurvey.QuestionType.RADIO
        , options: [
            { value: "1", route: "Y" }
          , { value: "0", route: "N" }
          ]
        }
      , { id: "q2", page: 2
        , routeDependencies: ["Y"]
        , type: BackboneSurvey.QuestionType.CHECKBOX
        , options: [
            { value: "A", route: "A" }
          , { value: "B", route: "B" }
          , { value: "C", route: "C" }
          ]
        }
      , { id: "q3", page: 3
        , routeDependencies: ["A", ["B", "C"]] // A and (B or C)
        }
      ]
    }, { parse: true });
    survey.nextPage();
    deepEqual(survey.get("page"), 1);
    survey.addAnsweredSectionId("q1");
    survey.nextPage();
    deepEqual(survey.get("page"), 1, "Has no any required routes.");

    survey.startPage();
    survey.nextPage();
    deepEqual(survey.get("page"), 1);
    section = survey.sections.get("q1");
    section.set("answers", ["0"]);
    survey.addAnsweredSectionId("q1");
    survey.nextPage();
    deepEqual(survey.get("page"), 1, "The route is N");

    survey.startPage();
    survey.nextPage();
    deepEqual(survey.get("page"), 1);
    section = survey.sections.get("q1");
    section.set("answers", ["1"]);
    survey.addAnsweredSectionId("q1");
    survey.nextPage();
    deepEqual(survey.get("page"), 2, "The route is Y");
    section = survey.sections.get("q2");
    section.set("answers", ["C"]);
    survey.addAnsweredSectionId("q2");
    survey.nextPage();
    deepEqual(survey.get("page"), 2, "The route is C");
    section.set("answers", ["A"]);
    survey.addAnsweredSectionId("q2");
    survey.nextPage();
    deepEqual(survey.get("page"), 2, "The route is A");
    section.set("answers", ["B"]);
    survey.addAnsweredSectionId("q2");
    survey.nextPage();
    deepEqual(survey.get("page"), 2, "The route is B");
    section.set("answers", ["B", "C"]);
    survey.addAnsweredSectionId("q2");
    survey.nextPage();
    deepEqual(survey.get("page"), 2, "The route is B && C");
    section.set("answers", ["A", "B"]);
    survey.addAnsweredSectionId("q2");
    survey.nextPage();
    deepEqual(survey.get("page"), 3, "The route is A && B");
    survey.prevPage();
    deepEqual(survey.get("page"), 2);
    section.set("answers", ["A", "C"]);
    survey.addAnsweredSectionId("q2");
    survey.nextPage();
    deepEqual(survey.get("page"), 3, "The route is A && C");
  });
})(jQuery);
