const Panel = require('./panel.js');
class panelController {
  constructor(array) { 
    this.panelList = [];
    for (var i = 0; i < array.length; i++) this.panelList.push(new Panel($(array[i])));
  }
  hideAll(){ for (var i = 0; i < this.panelList.length; i++) this.panelList[i].hidePanel(); }
  showAll(){ for (var i = 0; i < this.panelList.length; i++) this.panelList[i].showPanel(); }
  enableAll(){ for (var i = 0; i < this.panelList.length; i++) this.panelList[i].enablePanel(); }
  disableAll(){ for (var i = 0; i < this.panelList.length; i++) this.panelList[i].disablePanel(); }
}
module.exports = panelController;