(function ($, window, document) {
  var
    elem_body = $('body'),
    elem_stage = $('#stage'),
    elem_scenes = $('#stage>[scene]');
  var
    delegate = $.delegate_factory(elem_body);

  // Setup scene.js
  $.scene.setScenes(elem_scenes);

  var randomFunctions = {
    // Return Boolean
    byProbability: function (probability) {
      return Math.random() < probability;
    },
    // Return number
    byRange: function (from, to) {
      return Math.random() * (to - from) + from;
    },
    byFlooredRange: function (from, to) {
      return Math.floor(Math.random() * (to - from) + from);
    },
    // Return Boolean
    timeRelated: function (number_per_second, timerange) {
      if(timerange > 1000) {
        timerange = 1000;
      }
      return Math.floor(Math.random() * 1000) < timerange * number_per_second;
    }
  };

  // Setup cover canvas
  (function () {
    var
      render = new PIXI.autoDetectRenderer(50, 50, {transparent: true, antialias: false}),
      stage = new PIXI.Container(),
      loader = PIXI.loader;

    var updateStageSize = function () {
      render.resize(elem_stage.width() * 2, elem_stage.height() * 2);
      $(render.view).height(elem_stage.height());
      $(render.view).width(elem_stage.width());
    }
    $(window).resize(updateStageSize);
    $(window).trigger('resize');
    elem_scenes.filter('[data-scene=cover]').append(render.view);

    loader.add('deepsea', '/vol4/img/deepsea.png');

    var assets = {};

    var matrix_column_width = 40;

    loader.load(function (loader, resources) {
      assets.sprites = {};
      assets.textures = {};
      assets.sprites.deepsea_set = [];

      assets.textures.deepsea = resources.deepsea.texture;

      for (var i = 0; i < resources.deepsea.texture.width / matrix_column_width; i++) {
        var tile = new PIXI.Sprite(
          new PIXI.Texture(resources.deepsea.texture, new PIXI.Rectangle(matrix_column_width * i, 0, matrix_column_width, resources.deepsea.texture.height))
          );
        tile.offset = i;
        tile.wave_state = updateOrCreateWaveState();
        // tile.z_offset = Math.random();
        tile.z_offset = 0;
        assets.sprites.deepsea_set.push(tile);
        stage.addChild(tile);
      }
      updateTimestamp();
      requestAnimationFrame(animate);
    });

    // A Easing value time-related system
    var begin = {
      camera: {
        value: 6000,
        timestamp: 0
      }
    };
    var destiny = {
      camera: {
        value: 1000,
        duration: 7000
      }
    };
    var progess = {
      camera: {
        value: 6000,
        progess: 0
      }
    };

    // Standalone timestamp
    var begin_timestamp = 0;
    var current_timestamp = 0;
    // Return the delta
    var updateTimestamp = function (global_timestamp) {
      if(!global_timestamp) {
        begin_timestamp = performance.now();
      } else {
        var last_timestamp = current_timestamp;
        current_timestamp = global_timestamp - begin_timestamp;
        return current_timestamp - last_timestamp;
      }
    }

    // Update value by valueName
    var updateValue = function (valueName, easingName) {
      if(current_timestamp >= begin[valueName].timestamp && progess[valueName].value != destiny[valueName].value) {
        var progess_time = current_timestamp - begin[valueName].timestamp;
        if(progess_time > destiny[valueName].duration) {
          progess_time = destiny[valueName].duration;
        }
        progess[valueName].progess = progess_time / destiny[valueName].duration;
        progess[valueName].value =
          (
            (1 - window.easingFunctions[easingName](progess[valueName].progess)) *
            (begin[valueName].value - destiny[valueName].value)
          ) + (destiny[valueName].value);
        // console.log(progess[valueName].value);
      }
    }

    // The seafoods
    var seafoods = [];
    var seafoods_graphics = new PIXI.Graphics();
    stage.addChild(seafoods_graphics);

    // The wave
    var wave_range = 10;
    var wave_vector_range = 20;
    var updateOrCreateWaveState = function (wave_state, delta) {
      if(wave_state) {
        if(randomFunctions.timeRelated(3, delta)) {
          wave_state.vector = randomFunctions.byRange(-wave_vector_range, wave_vector_range);
        }
        if(wave_state.offset > wave_range || wave_state.offset < -wave_range) {
          wave_state.vector = -wave_state.vector;
        }
        wave_state.offset += wave_state.vector * (delta / 1000);
        return wave_state;
      } else {
        return {
          offset: randomFunctions.byRange(-wave_range, wave_range),
          vector: randomFunctions.byRange(-wave_vector_range, wave_vector_range)
        };
      }
    }

    var animate = function (global_timestamp) {
      var delta = updateTimestamp(global_timestamp);
      var container = new PIXI.Rectangle(0, 0, render.view.width, render.view.height);
      var center = new PIXI.Point(container.width / 2, container.height / 2);
      var matrix_column_number = Math.ceil(container.width / matrix_column_width);
      var matrix_width = matrix_column_number * matrix_column_width;
      updateValue('camera', 'easeOutQuad');
      
      // Calculating the Deepsea title position
      for (var i = assets.sprites.deepsea_set.length - 1; i >= 0; i--) {
        updateOrCreateWaveState(assets.sprites.deepsea_set[i].wave_state, delta);
        assets.sprites.deepsea_set[i].position.x = center.x - assets.textures.deepsea.width / 2 + matrix_column_width * assets.sprites.deepsea_set[i].offset;
        assets.sprites.deepsea_set[i].position.y =
          center.y - assets.textures.deepsea.height / 2 +
          progess.camera.value - 1010 + assets.sprites.deepsea_set[i].z_offset * 600 * (1.04 - progess.camera.progess) +
          assets.sprites.deepsea_set[i].wave_state.offset;
      }

      // Deal with seafoods
      var current_seafoods_density = 0.0008 * progess.camera.value;
      if(randomFunctions.timeRelated(current_seafoods_density, delta)) {
        var seafood = new PIXI.Rectangle(randomFunctions.byFlooredRange(0, matrix_column_number) * matrix_column_width - (matrix_width / 2 - center.x), container.height, matrix_column_width, randomFunctions.byRange(12, 52));
        seafood.vector_y = -randomFunctions.byRange(0.1 * progess.camera.value, 0.5 * progess.camera.value);
        seafood.wave_state = updateOrCreateWaveState();
        seafood.logic_position = {x: seafood.x, y: seafood.y};
        seafoods.push(seafood);
      }

      // Calculate and display sea foods
      seafoods_graphics.clear();
      seafoods_graphics.beginFill(0x969696);
      for (var i = seafoods.length - 1; i >= 0; i--) {
        seafoods[i].logic_position.y += seafoods[i].vector_y * (delta / 1000);
        updateOrCreateWaveState(seafoods[i].wave_state, delta);
        seafoods[i].y = seafoods[i].logic_position.y + seafoods[i].wave_state.offset * 2;
        seafoods_graphics.drawRect(seafoods[i].x, seafoods[i].y, seafoods[i].width, seafoods[i].height);
      }
      seafoods_graphics.endFill();

      // Remove out of screen seafoods
      seafoods = seafoods.filter(function (seafood) {
        if(seafood.height + seafood.y > 0) {
          return true;
        } else {
          return false;
        }
      });

      // Query next frame func
      render.render(stage);
      requestAnimationFrame(animate);
    }
  })();

  $(document).ready(function () {
  });

})(jQuery, window, document);

