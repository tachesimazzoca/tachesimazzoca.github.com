(function($, app) {
  module("backbone-survey core");

  test("VERSION", function() {
    deepEqual(app.VERSION, "0.1.3");
  });
})(jQuery, BackboneSurvey);
