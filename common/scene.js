// By AdWARDS
(function ($, window, document) {
  var scenes = $(),
    elem_body = $('body');
  var
    delegate = $.delegate_factory(elem_body);
  delegate('click.director', '[data-scene-director]', function () {
    director = $(this);
    scene_name = director.data('scene-director');
    jump(scene_name);
  });
  var jump = function (scene_name) {
    scene = scenes.filter('[data-scene=' + scene_name + ']');
    prev_scene = scenes.filter('.camera-on');
    if(scene.length > 1) {
      throw 'Scenes duplicated for ' + scene_name;
    } else if (scene.length === 0) {
      console.warn('Scene not found for ' + scene_name)
      return;
    }
    prev_scene.removeClass('camera-on');
    scene.addClass('camera-on');
    $('[scene-indicator]').attr('scene-indicator', scene_name);
    elem_body.trigger('scene:jump', [scene_name, prev_scene.data('scene')]);
  }
  var setScenes = function (_scenes) {
    if(_scenes instanceof $) {
      scenes = _scenes;
    } else if(typeof(_scenes) === 'string') {
      scenes = $(_scenes);
    } else {
      return false;
    }
    scenes = scenes.filter('[data-scene]');
    return true;
  }
  $.scene = {
    setScenes: setScenes,
    jump: jump
  };
})(jQuery, window, document);