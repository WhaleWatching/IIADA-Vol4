(function ($, window, document) {
  var
    elem_body = $('body'),
    elem_stage = $('#stage'),
    elem_scenes = $('#stage>[scene]');
  var
    delegate = $.delegate_factory(elem_body);

  // Setup scene.js
  $.scene.setScenes(elem_scenes);

  // Random fuctions
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
    loader.add('deepsea_entities', '/vol4/img/deepsea-entities.json');

    var assets = {};

    var matrix_column_width = 40;

    loader.load(function (loader, resources) {
      assets.sprites = {};
      assets.textures = {};
      assets.sprites.deepsea_set = [];

      assets.textures.deepsea = resources.deepsea.texture;
      assets.deepsea_entities = resources.deepsea_entities.textures;

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
        duration: 6000
      }
    };
    var progess = {
      camera: {
        value: 6000,
        progess: 0
      }
    };


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
    var wave_range = 3;
    var wave_vector_range = 800;
    var updateOrCreateWaveState = function (wave_state, delta) {
      if(wave_state) {
        if(randomFunctions.timeRelated(2, delta)) {
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

    // Standalone timestamp
    var last_timestamp = 0;
    var current_timestamp = 0;

    var last_width = 0;

    var animate = function (global_timestamp) {
      if(!$(render.view).is(':visible')) {
        requestAnimationFrame(animate);
        return;
      }
      var delta = global_timestamp - last_timestamp;
      last_timestamp = global_timestamp;
      if (delta > 40) {
        delta = 40;
      }
      current_timestamp += delta;

      var container = new PIXI.Rectangle(0, 0, render.view.width, render.view.height);
      var center = new PIXI.Point(container.width / 2, container.height / 2);
      var matrix_column_number = Math.ceil(container.width / matrix_column_width);
      var matrix_width = matrix_column_number * matrix_column_width;
      updateValue('camera', 'easeOutQuad');

      if(last_width != container.width) {
        last_width = container.width;
      }
      
      // Calculating the Deepsea title position
      for (var i = assets.sprites.deepsea_set.length - 1; i >= 0; i--) {
        updateOrCreateWaveState(assets.sprites.deepsea_set[i].wave_state, delta);
        assets.sprites.deepsea_set[i].position.x = center.x - assets.textures.deepsea.width / 2 + matrix_column_width * assets.sprites.deepsea_set[i].offset;
        assets.sprites.deepsea_set[i].position.y =
          center.y - assets.textures.deepsea.height / 2 - 150 +
          progess.camera.value - 1010 + assets.sprites.deepsea_set[i].z_offset * 600 * (1.04 - progess.camera.progess) +
          assets.sprites.deepsea_set[i].wave_state.offset;
      }

      // Deal with seafoods
      var current_seafoods_density = 0.001 * progess.camera.value;
      var seafoods_per_frame = 1;
      if(current_timestamp > 20 * 60 * 1000) {
        current_seafoods_density = 100;
        seafoods_per_frame = 20;
      }
      if(randomFunctions.timeRelated(current_seafoods_density, delta)) {
        for (var i = 0; i < seafoods_per_frame; i++) {
          var seafood = new PIXI.Rectangle(randomFunctions.byFlooredRange(0, matrix_column_number) * matrix_column_width - (matrix_width / 2 - center.x), container.height, matrix_column_width, randomFunctions.byRange(22, 88));
          seafood.vector_y = -randomFunctions.byRange(0.1 * progess.camera.value, 0.5 * progess.camera.value);
          seafood.wave_state = updateOrCreateWaveState();
          seafood.logic_position = {x: seafood.x, y: seafood.y};
          seafood.sprite = new PIXI.Sprite(assets.deepsea_entities[randomFunctions.byFlooredRange(1, 20).toString() + '.png']);
          stage.addChild(seafood.sprite);
          seafood.sprite.height = seafood.height = seafood.sprite.height * (seafood.width / seafood.sprite.width);
          seafood.sprite.width = seafood.width;
          seafood.sprite.x = seafood.x;
          seafood.sprite.y = seafood.y;
          seafoods.push(seafood);
        }
      }

      // Calculate and display sea foods
      seafoods_graphics.clear();
      seafoods_graphics.beginFill(0x969696);
      // seafoods_graphics.lineStyle(4, 0xffd900, 1);
      // seafoods_graphics.moveTo(center.x, 0);
      // seafoods_graphics.lineTo(center.x, container.height);
      // seafoods_graphics.drawRect(10, 10, 90, 90);
      for (var i = seafoods.length - 1; i >= 0; i--) {
        seafoods[i].logic_position.y += seafoods[i].vector_y * (delta / 1000);
        updateOrCreateWaveState(seafoods[i].wave_state, delta);
        seafoods[i].y = seafoods[i].logic_position.y + seafoods[i].wave_state.offset * 2;
        // seafoods_graphics.drawRect(seafoods[i].x, seafoods[i].y, seafoods[i].width, seafoods[i].height);

        seafoods[i].sprite.x = seafoods[i].x;
        seafoods[i].sprite.y = seafoods[i].y;
      }
      seafoods_graphics.endFill();

      // Remove out of screen seafoods
      seafoods = seafoods.filter(function (seafood) {
        if(seafood.height + seafood.y > 0) {
          return true;
        } else {
          stage.removeChild(seafood.sprite);
          return false;
        }
      });

      // Query next frame func
      render.render(stage);
      requestAnimationFrame(animate);
    }
  })();

  $(document).ready(function () {
    if($.fn.editingAdjustable)
      $('vertial-line, vertial-line-chn, img.iiada, exhibit-frame, exhibit-info').editingAdjustable();

    // The scroll and arrow keys handling
    $(window).on('wheel.scene-director, keydown.scene-director', function (event) {
      if (event.type == "wheel") {
        event.preventDefault();
        if(event.originalEvent.deltaY > 0) {
          $.scene.next();
        }
        if(event.originalEvent.deltaY < 0) {
          $.scene.prev();
        }
      } else if(event.type == "keydown" && event.keyCode >= 37 && event.keyCode <= 40) {
        event.preventDefault();
        switch(event.keyCode) {
          case 37:
          case 38:
            $.scene.prev();
            break;
          case 39:
          case 40:
            $.scene.next();
            break;
        }
      }
    });

    // Like and share
    delegate('click.like-and-share', '.like-and-share .icon', function () {
      var self = $(this);
      if (self.hasClass('like')) {
        self.toggleClass('active');
      }
    });
    delegate('mouseenter.like-and-share', '.like-and-share .share-set', function () {
      var self = $(this);
      if(self.find('.icon.douban').length < 1) {
        var url = window.location.href.split('?')[0];
        var image = self.find('.icon.share').data('share-image');
        if(!image) {
          image = '';
        }
        var share_box = $(
            '<a target="_blank" href="http://www.douban.com/share/service?image=' + image + '&href=' + url + '" class="icon douban"></a>' +
            '<a target="_blank" href="https://www.facebook.com/dialog/feed?app_id=514810405354859&display=page&link=' + url + '&redirect_uri=http://iiada.serotoninphobia.info&picture=' + image + '" class="icon facebook"></a>' +
            '<a target="_blank" href="https://twitter.com/intent/tweet?text=' + url + '" class="icon twitter"></a>' +
            '<a target="_blank" href="http://service.weibo.com/share/share.php?url=' + url + '" class="icon weibo"></a>'
            );
        self.append(
            share_box
          );
      }
    });

  });

})(jQuery, window, document);

