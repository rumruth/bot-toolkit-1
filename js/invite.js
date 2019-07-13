const shell = require('electron').shell;
class Invite {
  constructor(element, status) {
    this.elem = element;
    this.link = element.find("textarea");
    this.id = element.find("input").eq(0);
    this.perms = element.find("input").eq(1);
    this.open = element.find("button").eq(1);
    this.full = element.find("button").eq(0);
    this.status = status;
    
    this.id.on('input', () => { this.setLink(); });
    this.perms.on('input', () => { this.setLink(); });
    this.open.on('click', () => { shell.openExternal(this.link.val()); });
    this.full.on('click', () => { this.copy(); });
    this.link.on("click", () => { this.link.select(); });
  }
  setLink(){ this.link.val(`https://discordapp.com/oauth2/authorize?client_id=${this.id.val()}&scope=bot&permissions=${this.perms.val()}`); }
  setPerms(val){
    this.perms.val(val);
    this.setLink();
  }
  setId(val){
    this.id.val(val);
    this.setLink();
  }
  open(){ shell.openExternal(this.link.val()); }
  copy(){
    var dummy = document.createElement("input");
    document.body.appendChild(dummy);
    dummy.setAttribute('value', this.link.val());
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
    this.status.success("link_copied");
  }
}
module.exports = Invite;