(function($) {
  module("backbone-survey resolvers");

  test("SectionResolver#resolve", function() {
    var resolver;
    resolver = new BackboneSurvey.SectionResolver();
    deepEqual(resolver.resolve([]), true);
    deepEqual(resolver.resolve([
      { id: "q1", routes: ["Y"] }
    ]), true);

    resolver = new BackboneSurvey.SectionResolver(["Y"]);
    deepEqual(resolver.resolve([]), false);
    deepEqual(resolver.resolve([
      { id: "q1", routes: ["N"] }
    , { id: "q2", routes: ["B"] }
    ]), false);
    deepEqual(resolver.resolve([
      { id: "q1", routes: ["Y"] }
    , { id: "q2", routes: ["N"] }
    ]), true);

    resolver = new BackboneSurvey.SectionResolver(["Y", "A", ["B", "C"]]);
    deepEqual(resolver.resolve([]), false);
    deepEqual(resolver.resolve([
      { id: "q1", routes: ["N"] }
    , { id: "q2", routes: ["B"] }
    ]), false);
    deepEqual(resolver.resolve([
      { id: "q1", routes: ["Y"] }
    , { id: "q2", routes: ["A", "B"] }
    ]), true);
    deepEqual(resolver.resolve([
      { id: "q1", routes: ["Y"] }
    , { id: "q2", routes: ["A", "C"] }
    ]), true);
    deepEqual(resolver.resolve([
      { id: "q1", routes: ["Y"] }
    , { id: "q2", routes: ["B", "C"] }
    ]), false);
    deepEqual(resolver.resolve([
      { id: "q1", routes: ["Y"] }
    , { id: "q2", routes: ["A", "B", "C"] }
    ]), true);
    deepEqual(resolver.resolve([
      { id: "q1", routes: ["Y"] }
    , { id: "q2", routes: ["A", "B", "C", "D"] }
    ]), true);

    resolver = new BackboneSurvey.SectionResolver(["Y", "A", ["B", "C"]], true);
    deepEqual(resolver.resolve([]), false);
    deepEqual(resolver.resolve([
      { id: "q1", routes: ["N"] }
    , { id: "q2", routes: ["B"] }
    ]), false);
    deepEqual(resolver.resolve([
      { id: "q1", routes: ["Y"] }
    , { id: "q2", routes: ["A", "B"] }
    ]), true);
    deepEqual(resolver.resolve([
      { id: "q1", routes: ["Y"] }
    , { id: "q2", routes: ["A", "C"] }
    ]), true);
    deepEqual(resolver.resolve([
      { id: "q1", routes: ["Y"] }
    , { id: "q2", routes: ["A", "B", "C"] }
    ]), true);
    deepEqual(resolver.resolve([
      { id: "q1", routes: ["Y"] }
    , { id: "q2", routes: ["A", "B", "C", "D"] }
    ]), false);
  });
})(jQuery);
