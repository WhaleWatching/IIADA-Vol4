// Editing adjustable

(function ($) {

  // Global state
  var state = 'normal';

  var helper_element = $(
    '<div class="" style="position: fixed; bottom: 10px; left: 10px; background-color: #ddd; z-index: 9999; padding: 4px 8px; border-radius: 3px; box-shadow: 0 0 0 1px #fff, 0 3px 14px -2px rgba(0,0,0,0.6); font-family: monospace; font-size: 12px;">' +
      '<div style="color: #888; margin-right: 1em;">Editing adjustable</div>' +
      '<div style="color: #737;" class="current-selector"></div>' +
      '<span class="content" style="color: #000;"></span>' +
    '</div>');
  var helper_element_content = helper_element.children('.content');
  var helper_element_selector = helper_element.children('.current-selector');

  var applyChanges = function (target) {
    var results = '';
    ['left', 'top', 'right', 'bottom'].forEach(function (attr) {
      if(target.data('editing-adjustable-position')[attr] !== false) {
        target.css(attr, 
            (target.data('editing-adjustable-position')[attr]).toString() + 'px'
          );
      }
    });
  }

  var displayPosition = function (target) {
    var results = '';
    ['left', 'top', 'right', 'bottom'].forEach(function (attr) {
      if(target.data('editing-adjustable-position')[attr] !== false) {
        results += attr + ': ' + (target.data('editing-adjustable-position')[attr]).toString() + 'px;\n';
      }
    });
    console.log(
      '%c editing-adjustable.js %c state for element\n%o\n' + results,
      'background: #222; color: #bada55', 'color: #471',
      target[0]);
  }

  // Shared editing func
  var beginAdjusting = function (target, begin_event) {
    helper_element_content.text('');
    state = 'editing';
    var begin_mouse_position = {
      x: begin_event.pageX,
      y: begin_event.pageY
    }
    var changed = false;
    $(document).on('selectstart.editing-adjustable-editing, dragstart.editing-adjustable-editing', function (event) {
      event.preventDefault();
      return false;
    });
    $(document).on('mousemove.editing-adjustable-editing', function (event) {
      changed = true;
      helper_element_content.text('');
      if(target.data('editing-adjustable-position')['left'] !== false) {
        var value = (target.data('editing-adjustable-position')['left'] + (event.pageX - begin_mouse_position.x)).toString() + 'px';
        target.css('left', value);
        helper_element_content[0].innerText += 'left: ' + value + '(' + (event.pageX - begin_mouse_position.x).toString() + ')\n'
      }
      if(target.data('editing-adjustable-position')['right'] !== false) {
        var value = (target.data('editing-adjustable-position')['right'] - (event.pageX - begin_mouse_position.x)).toString() + 'px';
        target.css('right', value);
        helper_element_content[0].innerText += 'right: ' + value + '(' + (event.pageX - begin_mouse_position.x).toString() + ')\n'
      }
      if(target.data('editing-adjustable-position')['top'] !== false) {
        var value = (target.data('editing-adjustable-position')['top'] + (event.pageY - begin_mouse_position.y)).toString() + 'px';
        target.css('top', value);
        helper_element_content[0].innerText += 'top: ' + value + '(' + (event.pageY - begin_mouse_position.y).toString() + ')\n'
      }
      if(target.data('editing-adjustable-position')['bottom'] !== false) {
        var value = (target.data('editing-adjustable-position')['bottom'] - (event.pageY - begin_mouse_position.y)).toString() + 'px';
        target.css('bottom', value);
        helper_element_content[0].innerText += 'bottom: ' + value + '(' + (event.pageY - begin_mouse_position.y).toString() + ')\n'
      }
    });
    $(document).on('mouseup.editing-adjustable-editing', function (event) {
      if(target.data('editing-adjustable-position')['left'] !== false) {
        target.data('editing-adjustable-position')['left'] =
          target.data('editing-adjustable-position')['left'] + (event.pageX - begin_mouse_position.x);
      }
      if(target.data('editing-adjustable-position')['right'] !== false) {
        target.data('editing-adjustable-position')['right'] =
          target.data('editing-adjustable-position')['right'] - (event.pageX - begin_mouse_position.x);
      }
      if(target.data('editing-adjustable-position')['top'] !== false) {
        target.data('editing-adjustable-position')['top'] =
          target.data('editing-adjustable-position')['top'] + (event.pageY - begin_mouse_position.y);
      }
      if(target.data('editing-adjustable-position')['bottom'] !== false) {
        target.data('editing-adjustable-position')['bottom'] =
          target.data('editing-adjustable-position')['bottom'] - (event.pageY - begin_mouse_position.y);
      }
      quitAdjusting(target, changed);
    });
  }

  var quitAdjusting = function (target, changed) {
    applyChanges(target);
    if(changed) {
      displayPosition(target);
    }
    state = 'preview';
    $(document).off('.editing-adjustable-editing');
    target.off('.editing-adjustable-editing');
  }

  $(document).on('keydown.editing-adjustable-mode-switch', function (event) {
    if(event.ctrlKey && (event.which == 69 || event.which == 101)) {
      if(state == 'editing')
        return;
      if(state == 'normal') {
        state = 'preview';
        $('body').append(helper_element[0]);
        helper_element_content.text('');
        console.log('%c editing-adjustable.js BEGIN ' + new Date(), 'background: #66a; color: #bada55');
      } else {
        state = 'normal';
        helper_element.remove();
        console.log('%c editing-adjustable.js END ', 'background: #66a; color: #bada55');
      }
    }
  });

  var prepareForEditing = function () {
    var self = $(this);

    if (self.css('position') != 'absolute' && self.css('position') != 'relative' && self.css('position') != 'fixed') {
      console.warn('Can not apply editing-adjustable to element %o, because of its `position` css rule is not `fixed`, `relative` or `absolute`.', self[0]);
      return self;
    }

    var initial_position = {
      top: self.css('top'),
      left: self.css('left'),
      bottom: self.css('bottom'),
      right: self.css('right')
    }

    // Set attr
    self.attr('editing-adjustable', '');
    var position = {
      left: initial_position.left.search(/[0-9]/g) < 0 ? false : new Number(initial_position.left.replace(/[^-0-9\.]+/g, '')),
      top: initial_position.top.search(/[0-9]/g) < 0 ? false : new Number(initial_position.top.replace(/[^-0-9\.]+/g, '')),
      right: initial_position.right.search(/[0-9]/g) < 0 ? false : new Number(initial_position.right.replace(/[^-0-9\.]+/g, '')),
      bottom: initial_position.bottom.search(/[0-9]/g) < 0 ? false : new Number(initial_position.bottom.replace(/[^-0-9\.]+/g, ''))
    };
    if(position.right === false && position.left === false && position.bottom === false && position.top === false) {
      position.left = 0;
      position.top = 0;
    }
    self.data('editing-adjustable-position', position);


    // Binding the editing mouse events
    self.on('mousedown.editing-adjustable-trigger', function (event) {
      // Call shared func
      if(state == 'preview') {
        beginAdjusting(self, event);
      }
    });

    self.on('mouseenter.editing-adjustable-trigger', function (event) {
      if(state == 'preview') {
        helper_element_content[0].innerText = '';
        ['left', 'top', 'right', 'bottom'].forEach(function (attr) {
          if(self.data('editing-adjustable-position')[attr] !== false) {
            helper_element_content[0].innerText += attr + ': ' + (self.data('editing-adjustable-position')[attr]).toString() + 'px\n';
          }
        });
        helper_element_selector[0].innerText = self.attr('class');
      }
    });
    self.on('mouseleave.editing-adjustable-trigger', function (event) {
      if(state == 'preview') {
        helper_element_content[0].innerText = '';
        helper_element_selector[0].innerText = '';
      }
    });
  }

  // Bind api
  jQuery.fn.extend({
    editingAdjustable: function () {
      this.each(function () {
        prepareForEditing.apply(this);
      })
    }
  });

  jQuery.editingAdjustableShowLatest = function (argu) {
    var target = null;
    if (typeof argu === 'string') {
      target = $('[editing-adjustable]' + argu);
    } else if (argu instanceof $) {
      target = argu;
    } else {
      target = $('[editing-adjustable]');
    }
    console.log('%c editing-adjustable.js latest results', 'background: #66a; color: #bada55');
    target.each(function () {
      displayPosition($(this));
    });
  };

})(jQuery);