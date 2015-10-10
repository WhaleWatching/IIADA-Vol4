(function ($, window, document) {
  var
    elem_body = $('body'),
    elem_stage = $('#stage'),
    elem_scenes = $('#stage>[scene]');
  var
    delegate = $.delegate_factory(elem_body);

  // Setup scene.js
  $.scene.setScenes(elem_scenes);

  // Setup cover canvas
  (function () {
    var
      render = new PIXI.autoDetectRenderer(elem_stage.width() * 2, elem_stage.height() * 2, {transparent: true, antialias: false}),
      stage = new PIXI.Container(),
      loader = PIXI.loader;
    $(render.view).height(elem_stage.height());
    $(render.view).width(elem_stage.width());
    elem_scenes.filter('[data-scene=cover]').append(render.view);

    loader.add('deepsea', '/vol4/img/deepsea.png');

    var assets = {};

    loader.load(function (loader, resources) {
      assets.sprites = {};
      assets.textures = {};
      assets.sprites.deepsea_set = [];

      assets.textures.deepsea = resources.deepsea.texture;

      for (var i = 0; i < 20; i++) {
        var tile = new PIXI.Sprite(
          new PIXI.Texture(resources.deepsea.texture, new PIXI.Rectangle(30 * i, 0, 30, resources.deepsea.texture.height))
          );
        tile.offset = i;
        assets.sprites.deepsea_set.push(tile);
        stage.addChild(tile);
      }
      updateTimestamp();
      requestAnimationFrame(animate);
    });

    var begin = {
      camera: {
        value: 6000,
        timestamp: 0
      }
    };
    var destiny = {
      camera: {
        value: 1000,
        duration: 8000
      }
    };
    var progess = {
      camera: {
        value: 6000,
        timestamp: 0
      }
    };

    // Return the delta
    var begin_timestamp = 0;
    var current_timestamp = 0;
    var updateTimestamp = function (global_timestamp) {
      if(!global_timestamp) {
        begin_timestamp = performance.now();
      } else {
        var last_timestamp = current_timestamp;
        current_timestamp = global_timestamp - begin_timestamp;
        return current_timestamp - last_timestamp;
      }
    }

    var animate = function (global_timestamp) {
      var delta = updateTimestamp(global_timestamp);

      
      requestAnimationFrame(animate);
      render.render(stage);
    }
  })();

  $(document).ready(function () {
  });

})(jQuery, window, document);

