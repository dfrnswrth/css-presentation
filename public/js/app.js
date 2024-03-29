var App = function(el) {
  this.$el = el;

  var self = this;
  this.SLIDE = 0;

  this.$editorWrap = this.$el.find(".editor");
  this.$previewWrap = this.$el.find(".preview");
  this.$preview = $("#rendered_preview");

  this.$css = this.$editorWrap.find(".css");
  this.$html = this.$editorWrap.find(".html");

  // dividers
  var separators = this.$el.find(".separator");
  this.$vsep = separators.filter(".vertical");
  this.$hsep = separators.filter(".horizontal");

  // make dividers sraggable
  this.$vsep.draggable({ cursor: 'ew-resize', vertical: false });
  this.$hsep.draggable({ cursor: 'ns-resize', horizontal: false });
  separators.on("drag", $.proxy(this.resizeBySplits, this))
            .on("dragEnd", $.proxy(this.separatorToPercentage, this));

  this.$cssEditor = CodeMirror.fromTextArea(this.$css.find("textarea")[0], {
    wrapping: 'code_editor',
    lineWrapping: true,
    lineNumbers: true,
    tabSize: 2,
    mode: "css"
  });
  this.$htmlEditor = CodeMirror.fromTextArea(this.$html.find("textarea")[0], {
    wrapping: 'code_editor',
    lineWrapping: true,
    lineNumbers: true,
    tabSize: 2,
    mode: "htmlmixed"
  });

  this.$cssEditor.on("change", function() {
    self.updatePreviewFromEditor("css");
  });
  this.$htmlEditor.on("change", function() {
    self.updatePreviewFromEditor("html");
  });

  // window events
  $(window).on("resize", $.proxy(this.resizeApp, this))
           .on("keydown", $.proxy(this.keyListener, this))
           .on("iframe_ready", $.proxy(this.refreshPreview, this))
           .on("hashchange", $.proxy(this.getHashChange, this));

  // init
  this.resizeApp();
  this.$hsep.trigger("drag");
  this.$vsep.trigger("drag");

  this.getHashChange();
};
App.prototype = {
  getHashChange: function() {
    this.SLIDE = parseInt(window.location.hash.replace(/#\//g, ""), 10) || 1;
    this.moveToSlide();
  },
  moveToSlide: function() {
    var slide = "ajax/slide-" + this.SLIDE + ".html";
    this.$preview.attr("src", slide);
    var self = this;
    setTimeout(function(){
      self.refreshPreview();
    }, 20);
  },
  refreshPreview: function() {
    this.$previewBody = this.$preview.contents().find("body") || '';
    this.$previewStyles = this.$preview.contents().find("#style") || '';

    this.setEditorFromPreview("css", this.$previewStyles.html());
    this.setEditorFromPreview("html", this.$previewBody.html());
  },
  updatePreviewFromEditor: function(trigger) {
    var editor = trigger == "css" ? this.$cssEditor : this.$htmlEditor;
    var val = editor.getValue();
    this.setPreviewValue(trigger, val);
  },
  setPreviewValue: function(type, value) {
    var target = type == "css" ? this.$previewStyles : this.$previewBody;
    target.html(value);
  },
  setEditorFromPreview: function(type, value) {
    var target = type == "css" ? this.$cssEditor : this.$htmlEditor;
    value = value || '';
    target.setValue(value);
  },
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
    this.$editorWrap.css({
      width: this.editorWidth
    });
    this.$previewWrap.css({
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
      190,  // >
      188   // <
    ];
    if (!e.metaKey && !e.shiftKey) return;
    var myKey = e.keyCode;
    if (e.keyCode === 190) {
      this.SLIDE++;
    }
    if (e.keyCode === 188) {
      this.SLIDE--;
    }
    if (this.SLIDE <= 1) this.SLIDE = 1;
    window.location.hash = "#/" + this.SLIDE;
  },
  resizeApp: function() {
    this.$el.css({
      height: $(window).outerHeight(),
      width: $(window).outerWidth()
    });
    this.resizeEditorSplits();
    this.resizeVerticalSplits();
  }
};

$(document).ready(function(){
  var app = new App($(".app"));
  window.iframe_ready = function(){
    $(window).trigger("iframe_ready");
  };
});
