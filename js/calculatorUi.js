const Calculator = require('./calculator.js');
class CalculatorUI {
  constructor(element, invite, dict) {
    this.elem = element;

    this.dict = dict;

    this.columns = [];
    for (var i = 0; i < 6; i++) { this.columns.push(element.find(".col-sm-6").eq(i)); }

    this.calculator = new Calculator(invite);

    this.permList = require('../data/app-permissions.json'); 

    this.general = this.permList.general;
    this.text = this.permList.text;
    this.voice = this.permList.voice;

    this.selectGeneral = element.find(".well").eq(0).children(0);
    this.selectText = element.find(".well").eq(1).children(0);
    this.selectVoice = element.find(".well").eq(2).children(0);

    var id, bit, admin;

    var warn = `data-toggle="tooltip" data-placement="top" title="${this.dict.two_factor_warning}"`;

    for (var i = 0; i < this.general.length; i++) {
      id = this.general[i].name.replace(/ /g, "-");
      bit = this.general[i].bitVal;
      admin = this.general[i].admin;
      if (i%2!=0) {
        this.columns[1].append(`<div class="input-group btn-block">
            <span class="input-group-addon ${admin=="1"?"tf-warning":""}" ${admin=="1"?warn:""}>
              <input type="checkbox" id="${id}">
            </span>
            <label for="${id}" type="text" class="form-control no-select" readonly>${this.dict[this.general[i].name]}</label>
          </div>`);
      }
      else{
        this.columns[0].append(`
          <div class="input-group btn-block">
            <span class="input-group-addon ${admin=="1"?"tf-warning":""}" ${admin=="1"?warn:""}>
              <input type="checkbox" id="${id}">
            </span>
            <label for="${id}" type="text" class="form-control no-select" readonly>${this.dict[this.general[i].name]}</label>
          </div>
        `);
      }
      $("#" + id).bind('click', {bitVal:bit}, (e) => { 
        this.count(e);
        if (this.selectedGeneral==this.general.length) {
          this.selectGeneral.prop( "checked", true);
        }
        else if (this.selectedGeneral<this.general.length&&this.selectGeneral.prop("checked")) {
          this.selectGeneral.prop("checked", false);
        }
      });
    }
    for (var i = 0; i < this.text.length; i++) {
      id = this.text[i].name.replace(/ /g, "-");
      bit = this.text[i].bitVal;
      admin = this.text[i].admin;
      if (i%2!=0) {
        this.columns[3].append(`<div class="input-group btn-block">
            <span class="input-group-addon ${admin=="1"?"tf-warning":""}" ${admin=="1"?warn:""}>
              <input type="checkbox" id="${id}">
            </span>
            <label for="${id}" type="text" class="form-control no-select" readonly>${this.dict[this.text[i].name]}</label>
          </div>`);
      }
      else{
        this.columns[2].append(`
          <div class="input-group btn-block">
            <span class="input-group-addon ${admin=="1"?"tf-warning":""}" ${admin=="1"?warn:""}>
              <input type="checkbox" id="${id}">
            </span>
            <label for="${id}" type="text" class="form-control no-select" readonly>${this.dict[this.text[i].name]}</label>
          </div>
        `);
      }
      $("#" + id).bind('click', {bitVal:bit}, (e) => { 
        this.count(e);
        if (this.selectedText==this.text.length) {
          this.selectText.prop( "checked", true);
        }
        else if (this.selectedText<this.text.length&&this.selectText.prop("checked")) {
          this.selectText.prop("checked", false);
        }
        if (this.selectedVoice==this.voice.length) {
          this.selectVoice.prop( "checked", true);
        }
        else if (this.selectedVoice<this.voice.length&&this.selectVoice.prop("checked")) {
          this.selectVoice.prop("checked", false);
        }
      });
    }
    for (var i = 0; i < this.voice.length; i++) {
      id = this.voice[i].name.replace(/ /g, "-");
      bit = this.voice[i].bitVal;
      admin = this.voice[i].admin;
      if (i%2!=0) {
        this.columns[5].append(`<div class="input-group btn-block">
            <span class="input-group-addon ${admin=="1"?"tf-warning":""}" ${admin=="1"?warn:""}>
              <input type="checkbox" value="" id="${id}">
            </span>
            <label for="${id}" type="text" class="form-control no-select" readonly>${this.dict[this.voice[i].name]}</label>
          </div>`);
      }
      else{
        this.columns[4].append(`
          <div class="input-group btn-block">
            <span class="input-group-addon ${admin=="1"?"tf-warning":""}" ${admin=="1"?warn:""}>
              <input type="checkbox" value="" id="${id}">
            </span>
            <label for="${id}" type="text" class="form-control no-select" readonly>${this.dict[this.voice[i].name]}</label>
          </div>
        `);
      }
      $("#" + id).bind('click', {bitVal:bit}, (e) => {
        this.count(e);
        if (this.selectedText==this.text.length) {
          this.selectText.prop( "checked", true);
        }
        else if (this.selectedText<this.text.length&&this.selectText.prop("checked")) {
          this.selectText.prop("checked", false);
        }
        if (this.selectedVoice==this.voice.length) {
          this.selectVoice.prop( "checked", true);
        }
        else if (this.selectedVoice<this.voice.length&&this.selectVoice.prop("checked")) {
          this.selectVoice.prop("checked", false);
        }
      });
    }

    //SELECT ALL ITEMS IN EACH PANEL

    function clickFalse(){ if ($(this).prop( "checked", false)) $(this).trigger("click"); }
    function clickTrue(){ if ($(this).prop( "checked", true)) $(this).trigger("click"); }

    this.selectGeneral.click((e) => {
      if ($(e.currentTarget).prop( "checked")) {
        this.columns[0].find("input").each(clickFalse);
        this.columns[1].find("input").each(clickFalse);
      }
      else{
        this.columns[0].find("input").each(clickTrue);
        this.columns[1].find("input").each(clickTrue);
      }
    });
    this.selectText.click((e) => {
      if ($(e.currentTarget).prop( "checked")) {
        this.columns[2].find("input").each(clickFalse);
        this.columns[3].find("input").each(clickFalse);
      }
      else{
        this.columns[2].find("input").each(clickTrue);
        this.columns[3].find("input").each(clickTrue);
      }
    });
    this.selectVoice.click((e) => {
      if ($(e.currentTarget).prop( "checked")) {
        this.columns[4].find("input").each(clickFalse);
        this.columns[5].find("input").each(clickFalse);
      }
      else{
        this.columns[4].find("input").each(clickTrue);
        this.columns[5].find("input").each(clickTrue);
      }
    });
  }
  count(e){
    if (e.currentTarget.id=="View-Channel") $('#Read-Messages').prop('checked', $('#View-Channel').prop('checked'));
    else if (e.currentTarget.id=="Read-Messages") $('#View-Channel').prop('checked', $('#Read-Messages').prop('checked'));
    if ($(e.currentTarget).is(':checked')) this.calculator.add(e.data.bitVal);
    else this.calculator.remove(e.data.bitVal);
  }
  /*
  selectAllGeneral(){
    this.columns[0].find("input").each(function(){
      $(this).prop( "checked", true);
    });
    this.columns[1].find("input").each(function(){
      $(this).prop( "checked", true);
    });
  }
  selectAllText(){
    this.columns[2].find("input").each(function(){
      $(this).prop( "checked", true);
    });
    this.columns[3].find("input").each(function(){
      $(this).prop( "checked", true);
    });
  }
  selectAllVoice(){
    this.columns[4].find("input").each(function(){
      $(this).prop( "checked", true);
    });
    this.columns[5].find("input").each(function(){
      $(this).prop( "checked", true);
    });
  }
  */
  get selectedGeneral(){
    var total = 0;
    this.columns[0].find("input").each(function(){
      if ($(this).prop( "checked")) { total++; }
    });
    this.columns[1].find("input").each(function(){
      if ($(this).prop( "checked")) { total++; }
    });
    return total;
  }
  get selectedText(){
    var total = 0;
    this.columns[2].find("input").each(function(){
      if ($(this).prop( "checked")) { total++; }
    });
    this.columns[3].find("input").each(function(){
      if ($(this).prop( "checked")) { total++; }
    });
    return total;
  }
  get selectedVoice(){
    var total = 0;
    this.columns[4].find("input").each(function(){
      if ($(this).prop( "checked")) { total++; }
    });
    this.columns[5].find("input").each(function(){
      if ($(this).prop( "checked")) { total++; }
    });
    return total;
  }
}
module.exports = CalculatorUI;