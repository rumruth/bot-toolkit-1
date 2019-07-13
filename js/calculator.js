class Calculator {
  constructor(invite) {
    this.elem = invite.perms;
    this.invite = invite;
    this.map = [];
  }
  add(val){ 
    if (this.map.indexOf(val) == -1) this.map.push(val);
    this.count();
  }
  remove(val){
    var index = this.map.indexOf(val);
    if (index >= 0) this.map.splice(index, 1);
    this.count();
  }
  count(){
    var num = 0;
    for (var i = 0; i < this.map.length; i++) num += parseInt(this.map[i], 16);
    this.elem.val(num);
    this.invite.setLink();
  }
}
module.exports = Calculator;