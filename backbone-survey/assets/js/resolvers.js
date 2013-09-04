/**
 * @module backbone-survey
 */
var BackboneSurvey = BackboneSurvey || {};

(function() {
  /**
   * @class SectionResolver
   * @constructor
   * @param {Array} dependencies Any route dependencies.
   * @param {Boolean} strict Use strict mode. It denies any other routes.
   */
  var SectionResolver = BackboneSurvey.SectionResolver = function(dependencies, strict) {
    this.dependencies = dependencies || [];
    this.strict = strict ? true : false;
  };

  SectionResolver.prototype = {
    /**
     * @method resolve
     * @param {Array} routes
     * @return {Boolean}
     */
    resolve: function(routes) {
      var keys = this.dependencies;
      var vs = [];
      _.each(routes, function(r) {
        vs = _.union(vs, r.routes);
      });
      var allowed = true;
      for (var i = 0; i < keys.length; i++) {
        var diff = _.difference(vs, _.flatten([keys[i]])); // Unmatched keys
        allowed = _.difference(vs, diff).length > 0;
        if (!allowed) break; // Not match any keys
      }
      if (allowed && this.strict) {
        // Use strict mode
        _.each(keys, function(key) {
          var ks = _.flatten([key]);
          _.each(ks, function(k) {
            vs = _.without(vs, k); // Remove matched key
          });
        });
        allowed = (vs.length === 0); // Not have any other routes.
      }
      return allowed;
    }
  };
})();
