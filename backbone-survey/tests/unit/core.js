(function($, app) {
  module("backbone-survey core");

  test("VERSION", function() {
    deepEqual(app.VERSION, "0.1.1");
  });
})(jQuery, BackboneSurvey);
