(function() {

  var root = this;
  var previousPreload = root.Preload;
  var Preload = root.Preload = {};

  Preload.VERSION = "0.0.0";

  Preload.noConflict = function() {
    root.Preload = previousPreload;
    return this;
  };

  var ImageLoader = Preload.ImageLoader = function() {
    this._resources = [];
    this._triggers = {};
    this._completed = false;
  };

  ImageLoader.prototype = {
    on: function(key, f) {
      if (typeof(f) === "function") {
        this._triggers[key] = f;
      }
    }

  , trigger: function(key) {
      if (typeof(this._triggers[key]) === "function") {
        this._triggers[key]();
      }
    }

  , getResource: function(url) {
      var i, res;
      res = null;
      for (i = 0; i < this._resources.length; i++) {
        if (url == this._resources[i].url) {
          if (this._resources[i].resource) {
            res = this._resources[i].resource;
          }
          break;
        }
      }
      return res;
    }

  , getResources: function() {
      return this._resources;
    }

  , clearResources: function() {
      this._resources = [];
    }

  , numOfLoading: function() {
      var i, n, len;
      n = 0;
      len = this._resources.length;
      for (i = 0; i < len; i++) {
        if (this._resources[i].resource === null) n++;
      }
      return n;
    }

  , load: function(urls, refresh) {
      var i, j, exists;

      this._completed = false;
      if (refresh) this._resources = [];

      for (i = 0; i < urls.length; i++) {
        exists = false;
        for (j = 0; j < this._resources.length; j++) {
          if (urls[i] == this._resources[j].url) {
            exists = true;
            break;
          }
        }
        if (!exists) {
          this._resources.push({ url: urls[i], resource: null });
        }
      }

      if (this.numOfLoading() > 0) {
        var me = this;
        var fn = function() {
          if (!me._completed && me.numOfLoading() === 0) {
            me._completed = true;
            me.trigger("complete");
          }
        };
        for (i = 0; i < this._resources.length; i++) {
          if (this._resources[i].resource) continue;
          this._resources[i].resource = new Image();
          this._resources[i].resource.src = this._resources[i].url;
          this._resources[i].resource.onload = fn;
        }
      } else {
        this._completed = true;
        this.trigger("complete");
      }
    }
  };
}).call(this);
