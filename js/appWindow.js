class appWindow {
  constructor(element, window, token) { 
    this.elem = element;
    this.window = window;
    this.token = token;
    this.min = element.find("a").eq(0);
    this.max = element.find("a").eq(1);
    this.cls = element.find("a").eq(2);

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
  toggleMaximize(){
    if (this.window.isMaximized()) this.unmaximize();
    else this.maximize();
  }
  minimize(){ this.window.minimize(); }
  close(){ 
    if (this.token.loggedIn) this.token.quitSafely();
    this.window.close(); 
  }
}
module.exports = appWindow;