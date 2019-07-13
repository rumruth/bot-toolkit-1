class TokenControl {
  constructor(element, ipc, status, verbose, dict) { 
    this.elem = element;
    this.field = element.find(">:first-child");
    this.button = element.find(">:last-child");
    this.ipc = ipc;
    this.dict = dict;
    this.status = status;
    this.loggedIn = false;
    this.verbose = verbose;
    this.field.on('keyup', (e) => { if (e.keyCode == 13) this.button.trigger('click'); });
    this.button.click( () => {
      if (this.empty && !this.loggedIn){ this.err(); return; }
      else this.noErr();
      if (!this.loggedIn) { 
        this.status.loading("logging_in");
        this.verbose.newline("Attempting login...");
        this.ipc.send('login', this.token);
      }
      else this.callLogout();
    });
  }
  lock(){ this.field.prop("disabled", true); }
  unlock(){ this.field.prop("disabled", false); }
  toggle(){
    if (this.field.prop("disabled")) this.unlock();
    else this.lock();
  }
  hide(){ this.field.attr('type', 'password'); }
  show(){ this.field.attr('type', 'text'); }
  set(msg){ this.field.val(msg); }
  login(){ 
    this.loggedIn = true;
    this.button.text(this.dict.logout);
    this.button.removeClass(" btn-primary primary-override");
    this.button.addClass(" btn-warning warning-override");
    this.lock();
  }
  quitSafely(){
    this.status.loading("quitting_safely");
    this.ipc.send('logout', "quit");
  }
  reloadSafely(){
    this.status.loading("reloading_safely");
    this.ipc.send('logout', "reload");
  }
  callLogout(){
    this.status.loading("logging_out");
    this.ipc.send('logout', false);
  }
  logout(){ 
    this.loggedIn = false; 
    this.button.text(this.dict.login);
    this.button.removeClass(" btn-warning warning-override");
    this.button.addClass(" btn-primary primary-override");
    this.unlock();
  }
  clear(){ this.field.val(""); }
  get token(){ return this.field.val(); }
  get empty(){
    if (this.field.val().trim() == '') return true;
    else return false;
  }
  err(){ this.elem.addClass("has-error"); }
  noErr(){ this.elem.removeClass("has-error"); }
}
module.exports = TokenControl;