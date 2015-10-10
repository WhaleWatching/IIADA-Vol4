
# Unused Code

## The blink 

    var randomerMostOrigin = function () {
      return Math.random() > 0.2 ? Math.random() * 0.05 + 0.49 : Math.random();
    }

    for (var i = assets.sprites.deepsea_set.length - 1; i >= 0; i--) {
      assets.sprites.deepsea_set[i].position.x = render.view.width / 2 - assets.textures.deepsea.width / 2 + 30 * assets.sprites.deepsea_set[i].offset;
      assets.sprites.deepsea_set[i].position.y = render.view.height / 2 - assets.textures.deepsea.height / 2 - 100 + randomerMostOrigin() * 200;
    }

