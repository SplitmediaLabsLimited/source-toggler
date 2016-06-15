/* globals require */

(function() {
  'use strict';

  var xjs = require('xjs');

  xjs.ready().then(xjs.Item.getItemList).then(function(item) {
    var sourceWindow = xjs.SourcePluginWindow.getInstance();
    var container    = document.querySelector('#container');
    var toggler      = new window.SourceToggler(container);
    var items        = {};
    var curItem      = item[0]

    /**
     * Parse the configuration string passed by config dialog, or
     * the configuration string saved on the item
     *
     * This will set the plugin to maximize (full screen/stage) and also
     * attach the source items to be modified by the plugin :)
     */
    var _setData = function(data) {
      items = data;

      if (items.transform) {
        container.setAttribute('transform', 'true');
      } else {
        container.removeAttribute('transform');
      }

      toggler.transform = items.transform;
      toggler.configureItems(items);

      var rect = xjs.Rectangle.fromCoordinates(0,0,1,1);

      // Maximize source toggler plugin
      curItem.setPosition(rect);
      curItem.setPositionLocked(true);

      curItem.saveConfig(items);
    };

    var _savedData = function(data) {
      curItem.saveConfig(data);
      items = data;

      if (items.transform) {
        container.setAttribute('transform', 'true');
      } else {
        container.removeAttribute('transform');
      }

      toggler.transform = items.transform;
      toggler.configureItems(items);

      var rect = xjs.Rectangle.fromCoordinates(0,0,1,1);

      // Maximize source toggler plugin
      curItem.setPosition(rect);
      curItem.setPositionLocked(true);
    }

    // Listen config dialog, save data passed by config dialog
    sourceWindow.on('apply-config', _setData);

    // Load the saved configuration
    curItem.loadConfig().then(_savedData);

    // Toggle the mode
    container.addEventListener('dblclick', function() {
      var mode = container.getAttribute('mode');
      mode = mode === 'first' ? 'second' : 'first';

      container.setAttribute('mode', mode);

      if (Object.keys(items).length > 0) {
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

      if (Object.keys(items).length > 0) {
        toggler.configureItems(items);
      }

      document.body.style.fontSize = Math.round(res / 110) + 'px';
    };

    _resize();

    window.addEventListener('resize', _resize);
  });
})();
