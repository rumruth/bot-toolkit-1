const Preset = require('./preset.js');
class PresetController {
  constructor(element, ipc, bootbox, dict) { 
    this.elem = element; 
    this.preset = Preset;
    this.presets = [];
    this.ipc = ipc;
    this.box = bootbox;
    this.dict = dict;
  }
  new(args, message){ 
    this.presets.push(new this.preset(this.elem, args, message, this, this.ipc, this.box, this.dict));
    this.presets[this.presets.length-1].enablePanel();
  }
  remove(preset){
    var presetId = this.presets.indexOf(preset);
    this.presets[presetId].remove();
    if(presetId != -1) this.presets.splice(presetId, 1);
  }
  removeAll(){ 
    for (var i = 0; i < this.presets.length; i++) this.presets[i].remove();
    this.presets.splice(i, 1);
  }
  load(array, message, guild, people){
    this.presets = [];
    for (var i = 0; i < array.length; i++) {
      var args = {
            name: array[i].name,
            type : array[i].data.type,
            message : array[i].data.content,
            server: array[i].data.server,
            channel: array[i].data.channel,
            user: array[i].data.user,
            id: array[i].data.id,
            array : array[i].data.type=="0"?guild:people
          }, message;
      this.new(args, message);
    }
  }
  hideAll(){ for (var i = 0; i < this.presets.length; i++) this.presets[i].hidePanel(); }
  showAll(){ for (var i = 0; i < this.presets.length; i++) this.presets[i].showPanel(); }
  enableAll(){ for (var i = 0; i < this.presets.length; i++) this.presets[i].enablePanel(); }
  disableAll(){ for (var i = 0; i < this.presets.length; i++) this.presets[i].disablePanel(); }
  get data(){
    var values = [];
    for (var i = 0; i < this.presets.length; i++) {
      var name = this.presets[i].args.name;
      var data = this.presets[i].data;
      values.push({
        name : name,
        data: data
      });
    }
    return values;
  }
}
module.exports = PresetController;