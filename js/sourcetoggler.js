/* globals require */

(function() {
  'use strict';

  var xjs = require('xjs');

  function SourceToggler(node) {
    if (!node instanceof HTMLElement) throw new Error('Invalid node received');

    this.parent = node;
    this.items = [
      this.parent.querySelector('#left-slot'),
      this.parent.querySelector('#right-slot')
    ];

    this.transform = true;   // 3D transform attached item
  }

  /**
   * Get the relative position of the specified element
   * 
   * @param  {HTMLElement} elem
   * @return {Rectangle}
   */
  SourceToggler.prototype.relativePositions = function(elem) {
    var left   = elem.offsetLeft;
    var right  = elem.offsetWidth + left;
    var top    = elem.offsetTop;
    var bottom = elem.offsetHeight + top;

    return xjs.Rectangle.fromCoordinates(
      (top - 1) / window.innerHeight,
      (left - 1) / window.innerWidth,
      (right + 1) / window.innerWidth,
      (bottom + 1) / window.innerHeight
    );
  };

  /**
   * Configure the 'attached' items
   * 
   * @param  {Array} filter  [{id:string}]
   */
  SourceToggler.prototype.configureItems = function(filter) {
    var _this = this;

    if (!filter instanceof Array || filter.length === 0) return;

    xjs.Scene.getActiveScene().then(function(scene) {
      return scene.getItems();
    }).then(function(items) {
      var _updatePosition = function(i, item) {
        item.getID().then(function(id) {
          var filteredItem = filter.findIndex(function(obj) {
            if (obj.id === id) {
              return true;
            } else {
              return false;
            }
          });

          if (filteredItem === -1) return false;

          var newPos = _this.relativePositions(_this.items[filteredItem]);

          item.setPosition(newPos);
          item.setKeepAspectRatio(false);

          if (_this.transform) {
            item.setRotateY(filteredItem === 0 ? -30 : 30);
          } else {
            item.setRotateY(0);
          }
        });
      };

      for (var i in items) {
        _updatePosition(i, items[i]);
      }
    });
  };

  window.SourceToggler = SourceToggler;
  
  // Polyfill
  if (!Array.prototype.findIndex) {
    Array.prototype.findIndex = function(predicate) {
      if (this === null) {
        throw new TypeError('Array.prototype.findIndex called on null or undefined');
      }
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }
      var list = Object(this);
      var length = list.length >>> 0;
      var thisArg = arguments[1];
      var value;

      for (var i = 0; i < length; i++) {
        value = list[i];
        if (predicate.call(thisArg, value, i, list)) {
          return i;
        }
      }
      return -1;
    };
  }
})();
