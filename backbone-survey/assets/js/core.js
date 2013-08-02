/**
 * @module backbone-survey
 */
var BackboneSurvey = BackboneSurvey || {};

(function() {
  BackboneSurvey.VERSION = "0.1.2";

  /**
   * Functions to set up the prototype chain by saving
   * a refecence to `Backbone.Model.extend`.
   *
<pre><code>var Animal = function(name) {
  this.name = name;
};
_.extend(Animal, BackboneSurvey.Extendable);
var Bird = Animal.extend({
  fly: function() { return "Fly! " + this.name; }
}):
</code></pre>
   *
   * @class Extendable
   */
  BackboneSurvey.Extendable = {
    extend: Backbone.Model.extend
  };
})();
