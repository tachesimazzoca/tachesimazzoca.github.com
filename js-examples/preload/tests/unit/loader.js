(function($) {
  module("Preload.Loader");

  test("ImageLoader#on", function() {
    var loader = new Preload.ImageLoader();
    var received = false;
    loader.on("complete", function() { received = true; });
    loader.trigger("complete");
    ok(received === true);
  });

  test("ImageLoader#getResource", function() {
    var loader = new Preload.ImageLoader();
    var res = new Image(); 
    loader._resources = [
      { url: "./a.png", resource: null }
    , { url: "./b.png", resource: res }
    ];
    ok(loader.getResource("./a.png") === null);
    ok(loader.getResource("./b.png") === res);
  });

  test("ImageLoader#load", function() {
    var loader = new Preload.ImageLoader();
    loader.on("complete", function() { console.log(loader); });
    deepEqual(loader._resources.length, 0);
    loader.load(["./images/black.gif"]);
    deepEqual(loader._resources.length, 1);
    loader.load(["./images/black.gif"]);
    deepEqual(loader._resources.length, 1);
    loader.load(["./images/red.gif"]);
    deepEqual(loader._resources.length, 2);
  });
})(jQuery);
