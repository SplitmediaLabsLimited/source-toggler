/* globals require */

(function() {
  'use strict';

  var xjs = require('xjs');

  xjs.ready().then(xjs.Item.getCurrentSource).then(function(curItem) {
    var videoItems = [];
    var curScene = '';
    var curID = '';
    var saveButton = document.getElementById('save');
    var cancelButton = document.getElementById('cancel');
    var transform = document.querySelector('[name=transform]');
    var itemsDom = [
      document.querySelector('[name=item1]'),
      document.querySelector('[name=item2]')
    ];

    // Configure config window style/type
    var configWindow = xjs.SourceConfigWindow.getInstance();
    configWindow.useTabbedWindow({
      customTabs: ['Custom'],
      tabOrder: ['Custom', 'Color', 'Layout', 'Transition']
    });

    // Save event listener
    saveButton.addEventListener('click', function() {
      var json = { data: [
        { id : itemsDom[0].value },
        { id : itemsDom[1].value },
        { transform : transform.checked }
      ] };

      // Re-arrange the source list
      var _rearrange = function(i) {
        videoItems[i].getID().then(function(id) {
          if (id === curID) {
            var _item = videoItems.splice(i, 1);
            curScene.setItemOrder(videoItems.concat(_item));
          }
        });
      };

      for (var i = 0; i < videoItems.length; i++) {
        _rearrange(i);
      }

      curItem.requestSaveConfig(json);

      configWindow.closeConfig();
    });

    // Cancel event listener
    cancelButton.addEventListener('click', function() {
      configWindow.closeConfig();
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

          var promise;
          if (curID === '') {
            promise = curItem.getID().then(function(id) {
              curID = id;
              return new Promise(function(resolve, reject) {
                item.getID().then(function(iID) {
                  if (curID !== iID) {
                    resolve(iID);
                  } else {
                    reject(Error('do not add current item'));
                  }
                });
              });
            });
          } else {
            promise = item.getID().then(function(id) {
              return new Promise(function(resolve, reject) {
                if (curID !== id) {
                  resolve(id);
                } else {
                  reject(Error('do not add current item'));
                }
              });
            });
          }

          return new Promise(function(resolve) {
            promise.then(function(id) {
              option.value = id;
              return item.getCustomName();
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
        return curItem.loadConfig();
      }).then(function(config) {
        if (typeof config !== 'object') return;

        var tmpCnt = 0;
        for (var i in config.data) {
          if (config.data[i].id) {
            itemsValue[tmpCnt] = config.data[i].id;
            itemsDom[tmpCnt].value = config.data[i].id;
            tmpCnt++;
          } else if (config.data[i].transform !== undefined) {
            transform.checked = config.data[i].transform;
          }
        }
      });
    });
  });
})();
