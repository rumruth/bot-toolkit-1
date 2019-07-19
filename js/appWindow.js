class appWindow {
  constructor(element, window, token) { 
    this.elem = element;
    this.window = window;
    this.window.setAlwaysOnTop(false);
    this.token = token;
    this.top = false;
    this.pin = element.find("a").eq(0);
    this.min = element.find("a").eq(1);
    this.max = element.find("a").eq(2);
    this.cls = element.find("a").eq(3);

    this.pin.click(() => { this.togglePinned(); });
    this.min.click(() => { this.minimize(); });
    this.max.click(() => { this.toggleMaximize(); });
    this.cls.click(() => { this.close(); });
  }
  maximize(){
    this.window.maximize();
    this.max.children().addClass("fa-window-restore");
    this.max.children().removeClass("fa-window-maximize");
  }
  unmaximize(){
    this.window.unmaximize();
    this.max.children().removeClass("fa-window-restore");
    this.max.children().addClass("fa-window-maximize");
  }
  _pin(){
    this.window.setAlwaysOnTop(true);
    this.pin.addClass("pinned");
    this.top = true;
  }
  unpin(){
    this.window.setAlwaysOnTop(false);
    this.pin.removeClass("pinned");
    this.top = false;
  }
  toggleMaximize(){
    if (this.window.isMaximized()) this.unmaximize();
    else this.maximize();
  }
  togglePinned(){
    if (!this.top) this._pin();
    else this.unpin();
  }
  minimize(){ this.window.minimize(); }
  close(){ 
    if (this.token.loggedIn) this.token.quitSafely();
    this.window.close(); 
  }
}
module.exports = appWindow;