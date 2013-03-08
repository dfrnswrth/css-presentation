/*! Draggable - v0.5.0 - 2012-12-05
 * https://github.com/dfarnsworth/draggable
 * Copyright (c) 2012 Dylan Farnsworth; Licensed MIT */

/*jshint smarttabs:true jquery:true browser:true expr:true*/
/*global define*/
(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else {
    factory(jQuery);
  }
}(function ($) {
  "use strict";

  var Draggable = function(element,options){
  // instance globals for use later
    var offsetStartX, offsetStartY, positionStartX, positionStartY, pageStartX, pageStartY;
    var $el = element;	// the draggable element
    var opts = options;	// instance options
    var height = $el.outerHeight();
    var width = $el.outerWidth();
    var origCursor = $el.css("cursor");

    // touch event polyfill
    var touchable = 'ontouchstart' in window.document;
    var eStart = touchable ? 'touchstart' : 'mousedown';
    var eMove = touchable ? 'touchmove' : 'mousemove';
    var eEnd = touchable ? 'touchend' : 'mouseup';

    // assign cursor type
    opts.cursor && $el.css("cursor",opts.cursor);

    function getConstraints() {
      if (opts.contain) {
        var $parent = $el.parent();
        opts.xMin = 0;
        opts.xMax = $parent.outerWidth() - width;
        opts.yMin = 0;
        opts.yMax = $parent.outerHeight() - height;
      }
    }

    // event listeners
    $el.on(eStart, startDrag)
    .on("dragremove", destroy);

    // startDrag()
    function startDrag(e){
      getConstraints();
      var ev = touchable ? e.originalEvent : e;
      var offset = $el.offset();
      var position = $el.position();

      // get click position
      pageStartX = ev.pageX;
      pageStartY = ev.pageY;
      offsetStartX = offset.left + width - pageStartX;
      offsetStartY = offset.top + height - pageStartY;
      positionStartX = position.left;
      positionStartY = position.top;

      $(window).on(eMove, doDrag).on(eEnd, stopDrag);
    }

    // stopDrag()
    function stopDrag(){
      $(window).off(eMove, doDrag).off(eEnd, stopDrag);
      $el.trigger(opts.eventEnd);
    }

    // doDrag()
    function doDrag(e){
      e.preventDefault();
      var ev = touchable ? e.originalEvent : e;
      var position = {};	// container for positioning via css
      var change = {
        dX: ev.pageX - pageStartX,	// horizontal change
        dY: ev.pageY - pageStartY	// vertical change
      };
      var newX = opts.contain ?
        change.dX + positionStartX :
        ev.pageX + offsetStartX - width;
      var newY = opts.contain ?
        change.dY + positionStartY :
        ev.pageY + offsetStartY - height;

      // horizontal constraints
      if (opts.xMin !== false && newX <= opts.xMin) newX = opts.xMin;
      if (opts.xMax !== false && newX >= opts.xMax) newX = opts.xMax;
      // vertical constraints
      if (opts.yMin !== false && newY <= opts.yMin) newY = opts.yMin;
      if (opts.yMax !== false && newY >= opts.yMax) newY = opts.yMax;

      // populate position object
      if (opts.horizontal) position.left = newX;
      if (opts.vertical) position.top = newY;

      // reposition $el
      opts.contain ? $el.css(position) : $el.offset(position);

      // trigger move event on object
      $el.trigger(opts.eventDrag);
    }

    // destroy()
    function destroy() {
      $el.off(eStart, startDrag)
      .off("dragremove", destroy)
      .css({"cursor": origCursor})
      .removeData("draggable");
    }
  };

  // plugin definition
  $.fn.draggable = function(options){
    return this.each(function(){
      var target = $(this),
      data = target.data("draggable"),
      opts = $.extend({},$.fn.draggable.defaults,options);
      if (!data) {
        target.data("draggable", new Draggable(target, opts));
      }
    });
  };

  // plugin defaults
  $.fn.draggable.defaults = {
    cursor: "move",       // cursor type developer.mozilla.org/en-US/docs/CSS/cursor
    contain: true,        // contain within parent
    eventDrag: "drag",    // event triggered on drag
    eventEnd: "dragEnd",  // event triggered on drag end
    horizontal: true,     // draggable horizontally
    vertical: true,       // draggable vertically
    xMin: false,          // left boundary
    xMax: false,          // right boundary
    yMin: false,          // top boundary
    yMax: false           // bottom boundary
  };
}));