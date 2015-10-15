// By AdWARDS
(function ($, window, document) {
  var scenes = $(),
    elem_body = $('body');
  var
    delegate = $.delegate_factory(elem_body);
  delegate('click.director', '[data-scene-director]', function () {
    director = $(this);
    scene_name = director.data('scene-director');
    switch(scene_name) {
    case '$next':
      next();
    case '$prev':
      prev();
    default:
      jump(scene_name);
    }
  });
  var jumpByElement = function (scene) {
    if(scenes.filter('.segue-enter, .segue-back, .segue-hide, .segue-leave').length > 0) {
      return false;
    }
    prev_scene = scenes.filter('.camera-on');
    if(scene.length > 1) {
      throw 'Scenes duplicated for ' + scene;
    } else if (scene.length === 0) {
      console.warn('Scene not found for ' + scene)
      return;
    }
    if(scene.index() > prev_scene.index()) {
      scene.addClass('segue-enter');
      prev_scene.addClass('segue-hide');
    } else {
      scene.addClass('segue-back');
      prev_scene.addClass('segue-leave');
    }
    scene.addClass('camera-on');
    if(scene.css('transition-duration') != '0s' || scene.css('animation-duration') != '0s') {
      scene.one('animationend transitionend', function () {
        scene.removeClass('segue-enter segue-back');
      });
    } else {
      scene.removeClass('segue-enter segue-back');
    }
    if(prev_scene.css('transition-duration') != '0s' || scene.css('animation-duration') != '0s') {
      prev_scene.one('animationend transitionend', function () {
        prev_scene.removeClass('camera-on');
        prev_scene.removeClass('segue-leave segue-hide');
      });
    } else {
      prev_scene.removeClass('camera-on');
      prev_scene.removeClass('segue-leave segue-hide');
    }
    $('[scene-indicator]').attr('scene-indicator', scene.data('scene'));
    elem_body.trigger('scene:jump', [scene.data('scene'), prev_scene.data('scene')]);
    return true;
  }
  var jumpByName = function (scene_name) {
    return jumpByElement(scenes.filter('[data-scene=' + scene_name + ']'));
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
  var next = function () {
    current_scene = scenes.filter('.camera-on');
    var next_scene = scenes[current_scene.index() + 1];
    if(next_scene) {
      jumpByElement($(next_scene));
    }
  }
  var prev = function () {
    current_scene = scenes.filter('.camera-on');
    var prev_scene = scenes[current_scene.index() - 1];
    if(prev_scene) {
      jumpByElement($(prev_scene));
    }
  }
  $.scene = {
    setScenes: setScenes,
    jump: function (argu) {
      if(typeof(argu) == 'string') {
        return jumpByName(argu);
      } else if(argu instanceof $) {
        return jumpByElement(argu);
      }
      console.warn('Arguments wrong %o', argu);
      return false;
    },
    next: next,
    prev: prev
  };
})(jQuery, window, document);