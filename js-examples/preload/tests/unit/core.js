(function($) {
  module("Preload core");

  test("noConflict", function() {
    var preload = Preload;
    var alias = Preload.noConflict();
    deepEqual(preload, alias);
    Preload = preload;
  });

  test("VERSION", function() {
    deepEqual(Preload.VERSION, "0.0.0");
  });
})(jQuery);
