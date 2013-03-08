
var App = function(el) {
  this.$el = el;

  this.$editor = this.$el.find(".editor");
  this.$preview = this.$el.find(".preview");

  this.$css = this.$editor.find(".css");
  this.$html = this.$editor.find(".html");

  // dividers
  var separators = this.$el.find(".separator");
  this.$vsep = separators.filter(".vertical");
  this.$hsep = separators.filter(".horizontal");

  // make dividers sraggable
  this.$vsep.draggable({ cursor: 'ew-resize', vertical: false });
  this.$hsep.draggable({ cursor: 'ns-resize', horizontal: false });
  separators.on("drag", $.proxy(this.resizeBySplits, this))
            .on("dragEnd", $.proxy(this.separatorToPercentage, this));

  // window events
  $(window).on("resize", $.proxy(this.resizeApp, this))
           .on("keyup", $.proxy(this.keyListener, this));

  this.$cssEditor = CodeMirror.fromTextArea(this.$css.find("textarea")[0], {
    wrapping: 'code_editor',
    lineNumbers: true,
    tabSize: 2,
    mode: "css"
  });
  this.$htmlEditor = CodeMirror.fromTextArea(this.$html.find("textarea")[0], {
    wrapping: 'code_editor',
    lineNumbers: true,
    tabSize: 2,
    mode: "htmlmixed"
  });

  // init
  this.resizeApp();

  this.$hsep.trigger("drag");
  this.$vsep.trigger("drag");
};
App.prototype = {
  resizeBySplits: function(e) {
    var $t = $(e.currentTarget);
    var offset = $t.offset();
    var height = this.$el.innerHeight();
    var width = this.$el.innerWidth();

    if ($t.hasClass("horizontal")) {
      this.cssHeight = ((offset.top - $t.outerHeight())/ height)*100 + '%';
      this.htmlHeight = ((height - offset.top) / height)*100 + '%';
    }
    if ($t.hasClass("vertical")) {
      this.editorWidth = ((offset.left - $t.outerWidth())/width)*100 + '%';
      this.previewWidth = ((width - offset.left) / width)*100 + '%';
    }
    this.resizeEditorSplits();
    this.resizeVerticalSplits();
  },
  resizeEditorSplits: function() {
    this.$css.css({
      height: this.cssHeight
    });
    this.$html.css({
      height: this.htmlHeight
    });
  },
  resizeVerticalSplits: function() {
    this.$editor.css({
      width: this.editorWidth
    });
    this.$preview.css({
      width: this.previewWidth
    });
  },
  separatorToPercentage: function(e) {
    var $t = $(e.currentTarget);
    var offset = $t.offset();

    if ($t.hasClass("horizontal")) {
      $t.css({
        top: ((offset.top - $t.outerHeight()) / this.$el.innerHeight())*100+'%'
      });
    }
    if ($t.hasClass("vertical")) {
      $t.css({
        left: ((offset.left - $t.outerWidth()) / this.$el.innerWidth())*100+'%'
      });
    }
  },
  keyListener: function(e) {
    var keys = [
      219,  // [
      221   // ]
    ];
    var myKey = e.keyCode;
  },
  resizeApp: function() {
    this.$el.css({
      height: $(window).outerHeight(),
      width: $(window).outerWidth()
    });
    this.resizeEditorSplits();
    this.resizeVerticalSplits();
  }
}

$(document).ready(function(){
  var app = new App($(".app"));
});
