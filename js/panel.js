class Panel {
  constructor(element) { 
    this.elem = element;
    this.body = this.elem.find(".panel-body");
    this.elem.find(".panel-title").append('<i class="fas fa-chevron-down right-icon pull-right pointer" style="display:none;"></i>');
    this.elem.find("h3").on('click', '.right-icon', () => { this.togglePanel(); });
    this.enabled = false;
  }
  disablePanel(){
    this.elem.find(".right-icon").hide();
    this.hidePanel();
    this.enabled = false;
  }
  enablePanel(){
    this.enabled = true;
    this.elem.find(".right-icon").show();
    this.showPanel();
  }
  showPanel(){
    if (!this.enabled) return;
    this.body.slideDown();
    this.elem.find(".right-icon").removeClass("fa-chevron-down");
    this.elem.find(".right-icon").addClass("fa-chevron-up");
  }
  hidePanel(){
    if (!this.enabled) return;
    this.body.slideUp();
    this.elem.find(".right-icon").removeClass("fa-chevron-up");
    this.elem.find(".right-icon").addClass("fa-chevron-down");
  }
  togglePanel(){
    if (!this.enabled) return;
    if (this.body.is(":visible")) this.hidePanel();
    else this.showPanel();
  }
}
module.exports = Panel;