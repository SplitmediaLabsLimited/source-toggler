/* globals require, Promise */

(function() {
  'use strict';

  var xjs = require('xjs');
  var videoItems = [];
  var curScene = '';
  var curItem = '';
  var saveButton = document.getElementById('save');
  var cancelButton = document.getElementById('cancel');
  var transform = document.querySelector('[name=transform]');
  var itemsDom = [
    document.querySelector('[name=item1]'),
    document.querySelector('[name=item2]')
  ];

  xjs.ready().then(() => {
    return xjs.Item.getItemList()
  }).then(item => {
    curItem = item[0]
    return item[0].getId()
  }).then(function(curID) {
    // Configure config window style/type
    var configWindow = xjs.SourcePropsWindow.getInstance();
    configWindow.useTabbedWindow({
      customTabs: ['Custom'],
      tabOrder: ['Custom', 'Color', 'Layout', 'Transition']
    });

    // Save event listener
    saveButton.addEventListener('click', function() {
      var json = {
        item1     : itemsDom[0].value,
        item2     : itemsDom[1].value,
        transform : transform.checked
      };

      // Re-arrange the source list
      var _rearrange = function(i) {
        videoItems[i].getId().then(function(id) {
          if (id === curID) {
            var _item = videoItems.splice(i, 1);
            videoItems.unshift(_item[0])
            curScene.setItemOrder(videoItems);
          }
        });
      };

      for (var i = 0; i < videoItems.length; i++) {
        _rearrange(i);
      }
      curItem.applyConfig(json);
      curItem.requestSaveConfig(json).then(() => {
        configWindow.close();
      })

    });

    // Cancel event listener
    cancelButton.addEventListener('click', function() {
      configWindow.close();
    });

    // Select box event listeners
    var itemsValue = [];
    itemsDom[0].addEventListener('select-changed', function()
    {
        if (this.value === itemsValue[1])
        {
            itemsDom[1].value = itemsValue[0];
            itemsValue[1] = itemsValue[0];
        }

        itemsValue[0] = this.value;
    });

    itemsDom[1].addEventListener('select-changed', function()
    {
        if (this.value === itemsValue[0])
        {
            itemsDom[0].value = itemsValue[1];
            itemsValue[0] = itemsValue[1];
        }

        itemsValue[1] = this.value;
    });

    // Populate options
    xjs.Scene.getActiveScene().then(function(scene) {
      curScene = scene;
      scene.getItems().then(function(items) {
        var _addItem = function(item) {
          var option = document.createElement('xui-option');


          return new Promise(function(resolve) {
            item.getId().then(function(id) {
              if (curID !== id) {
                option.value = id;
                return item.getCustomName();
              } else {
                return new Promise(function(resolve, reject) {
                  reject(Error('do not add current item'));
                });
              }
            }).then(function(cname) {
              if (cname === '') {
                return item.getName();
              } else {
                return new Promise(function(resolve) {
                  resolve(cname);
                });
              }
            }).then(function(name) {
              option.textContent = name;

              var clone = option.cloneNode();
              clone.textContent = name;

              itemsDom[0].appendChild(option);
              itemsDom[1].appendChild(clone);
              resolve(this);
            }).catch(function() {
              resolve(this);
            });
          });
        };

        var promises = [];
        videoItems = items;

        for (var i in items) {
          promises.push(_addItem(items[i]));
        }

        return Promise.all(promises);
      }).then(function() {
        // Load saved config
        return curItem.loadConfig();
      }).then(function(config) {
        if (typeof config !== 'object') return;
        itemsValue[0] = config.item1;
        itemsDom[0].value = config.item1;
        itemsValue[1] = config.item2;
        itemsDom[1].value = config.item2;
        transform.checked = config.transform;
      });
    });
  });
})();
