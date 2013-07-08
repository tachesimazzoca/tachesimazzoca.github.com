(function($) {
  module("backbone-survey app");

  var Logger = function() {};
  Logger.prototype = {
    info: function(msg) { console.log(msg); }
  , warn: function(msg) { console.log(msg); }
  , debug: function(msg) { console.log(msg); }
  };
  BackboneSurvey.logger = new Logger();

  //test("Async Test", function() {
  //  // ... some async operation
  //  stop();
  //  setTimeout(function() {
  //    start();
  //    assertTrue(true);
  //  }, 1000);
  //});
})(jQuery);
