/* globals require */

(function() {
  'use strict';

  var xjs = require('xjs');

  xjs.ready().then(xjs.Item.getCurrentSource).then(function(item) {
    var sourceWindow = xjs.SourcePluginWindow.getInstance();
    var container    = document.querySelector('#container');
    var toggler      = new window.SourceToggler(container);
    var items        = [];

    /**
     * Parse the configuration string passed by config dialog, or
     * the configuration string saved on the item
     * 
     * This will set the plugin to maximize (full screen/stage) and also
     * attach the source items to be modified by the plugin :)
     */
    var _setData = function(data) {
      item.saveConfig(data);
      items = data.data;

      var isTransform = items.filter(function(obj) {
        if (obj.transform === true) {
          return true;
        } else {
          return false;
        }
      }).length > 0;

      if (isTransform) {
        container.setAttribute('transform', true);
      } else {
        container.removeAttribute('transform');
      }

      toggler.transform = isTransform;
      toggler.configureItems(items);

      var rect = xjs.Rectangle.fromCoordinates(0,0,1,1);

      // Maximize source toggler plugin
      item.setPosition(rect);
    };

    // Listen config dialog, save data passed by config dialog
    sourceWindow.on('save-config', _setData);

    // Load the saved configuration
    item.loadConfig().then(_setData);

    // Toggle the mode
    container.addEventListener('dblclick', function() {
      var mode = container.getAttribute('mode');
      mode = mode === 'first' ? 'second' : 'first';

      container.setAttribute('mode', mode);

      if (items.length > 0) {
        toggler.configureItems(items);
      }
    });

    document.onselectstart = function() {
      var nodeName = event.target.nodeName;

      if (nodeName === 'INPUT' || nodeName === 'TEXTAREA') {
        return true;
      } else {
        return false;
      }
    };
    
    document.oncontextmenu = function() { return false; };

    var _resize = function() {
      var res   = Math.min(window.innerHeight, window.innerWidth);
      var left  = container.querySelector('#left-slot');
      var right = container.querySelector('#right-slot');

      left.style.perspective = container.clientWidth + 'px';
      right.style.perspective = container.clientWidth + 'px';

      if (items.length > 0) {
        toggler.configureItems(items);
      }

      document.body.style.fontSize = Math.round(res / 110) + 'px';
    };

    _resize();

    window.addEventListener('resize', _resize);
  });
})();
