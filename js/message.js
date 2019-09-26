class Message {
  constructor(element, bootbox, ipc, presets, dict, dialog, path, os) { 
    this.elem = element;
    this.box = bootbox;
    this.opts = require('../data/app-langlist.json');
    this.ipc = ipc;
    this.presets = presets;
    this.dict = dict;
    this.dialog = dialog;
    this.path = path;
    this.os = os;

    this.guild;
    this.people;

    this.kind = element.find("select").eq(0);
    this.direct = element.find("div").eq(2);
    this.public = element.find("div").eq(3);

    this.serv = element.find("select").eq(1);
    this.chan = element.find("select").eq(2);
    this.user = element.find("select").eq(3);
    this.userId = element.find("input").eq(0);

    this.wrappers = element.find("[data-wrap]");
    this.text = element.find("textarea");

    this.pickCode = element.find("button").eq(5);
    this.pickUser = element.find("button").eq(6);

    this.sendImage = element.find("button").eq(7);

    this.typing = element.find("button").eq(8);
    this.save = element.find("button").eq(9);
    this.send = element.find("button").eq(10);

    this.well = element.find(".well").eq(0);
    this.wellText = this.well.find("span").eq(0);
    this.wellClose = this.well.find("span").eq(1);

    this.filesAttached = [];

    this.kind.change(() => {
      if (this.kind.val()=="0") {
        this.direct.show();
        this.public.hide();
      }
      else{
        this.direct.hide();
        this.public.show();
      }
    });

    this.user.on('change', () => { this.userId.val(this.user.val()); });
    this.userId.on('keyup', () => { this.user.val(this.userId.val()); });

    this.serv.change(() => {
      this.populate(this.chan, this.guild.find(x => x.id == this.serv.val()).channels.text, "channel");
      if (this.chan.val()) this.typing.prop( "disabled", false );
      else this.typing.prop( "disabled", true );
    });

    this.chan.change(() => {
      if (this.chan.val()) this.typing.prop( "disabled", false );
      else this.typing.prop( "disabled", true );
    });

    this.user.change(() => {
      if (this.user.val()) this.ipc.send("validate-dm", this.userId.val());
      else this.typing.prop( "disabled", true );
    });

    this.wrappers.each((index, element) => {
      $(element).on("click", (e) => {
        this.wrap(this.text, $(e.currentTarget).data("wrap"), $(e.currentTarget).data("wrap")); 
      });
    });

    this.ipc.on('dm-data', (event, arg) => {
      if (arg) this.typing.prop( "disabled", false ); 
      else this.typing.prop( "disabled", true );
    });

    this.pickUser.click(() => {
      this.box.prompt({
        title: this.dict.choose_a_user,
        inputType: 'select',
        backdrop: true,
        inputOptions: this.options(this.people),
        callback: (e) => { if (e) this.wrap(this.text, '', `<@${e}>`); }
      });
    });

    this.pickCode.click(() => {
      this.box.prompt({
        title: this.dict.choose_a_language,
        inputType: 'select',
        size: 'small',
        backdrop: true,
        inputOptions: this.opts,
        callback: (e) => { if (e) this.wrap(this.text, '\n```' + e + '\n', '\n```\n'); }
      });
    });

    this.save.click(() => {
      this.box.prompt({
        title: this.dict.preset_name,
        inputType: 'text',
        size: 'small',
        backdrop: true,
        callback: (e) => {
          if (e===null) return;
          var name = e;
          if (e=="") name = this.dict.untitled;
          this.presets.new({
            name: name,
            type : this.kind.val(),
            message : this.text.val(),
            server: this.serv.val(),
            channel: this.chan.val(),
            user: this.user.val(),
            id: this.userId.val(),
            array : this.kind.val()=="0"?this.guild:this.people
          }, this);
        }
      });
    });

    this.send.click(() => {
      this.ipc.send("send-msg", {
        type: this.kind.val(),
        server: this.serv.val(),
        channel: this.chan.val(),
        user: this.user.val(),
        id: this.userId.val(),
        content : this.text.val(),
        files: this.filesAttached
      });

      this.well.hide();
      this.wellText.text("");
      this.filesAttached = [];

      setTimeout(function(){ if (this.user != undefined && this.user.val()) this.ipc.send("validate-dm", this.userId.val()); }, 1000);
    });

    this.typing.click(() => {
      if (!this.typing.hasClass("btn-success")) {
        this.typing.addClass("btn-success");
        this.ipc.send("start-typing", {
          type: this.kind.val(),
          server: this.serv.val(),
          channel: this.chan.val(),
          user: this.user.val(),
          id: this.userId.val(),
          content : this.text.val()
        });
      }
      else{
        this.typing.removeClass("btn-success");
        this.ipc.send("stop-typing", {
          type: this.kind.val(),
          server: this.serv.val(),
          channel: this.chan.val(),
          user: this.user.val(),
          id: this.userId.val(),
          content : this.text.val()
        });
      }
    });

    this.sendImage.click(() => {
      this.dialog.showOpenDialog({
          title: "Select image",
          defaultPath: this.path.join(this.os.homedir(), 'Desktop')
        }, (fileNames) => {
          if (fileNames === undefined){ return; }
          var fileName = fileNames[0];
          
          this.filesAttached = [fileName];
          this.wellText.text(fileName);
          this.well.show();

          this.wellClose.click(() => {
            this.well.hide();
            this.wellText.text("");
            this.filesAttached = [];
          });
      });
    });
  }
  options(item){
    var arr = [];
    arr.push({ text: "None", value: "" });
    for (var i = 0; i < item.length; i++) arr.push({ text: item[i].name+"#"+item[i].disc, value: item[i].id });
    return arr;
  }
  populate(item, array, placeholder){
    item.find('option').remove(); //most likely causing the server caching bug
    item.append(`<option value="" selected disabled>${this.dict[placeholder]==undefined?placeholder:this.dict[placeholder]}</option>`);
    if (array) {
      for (var i = 0; i < array.length; i++) {
        var itemName = array[i].name;
        if (array[i].disc) itemName = array[i].name+"#"+array[i].disc;
        item.append(`<option value="${array[i].id}">${itemName}</option>`);
      }
    }
    item.val("");
  }
  wrap(textArea, openTag, closeTag) {
    var len = textArea.val().length;
    var start = textArea[0].selectionStart;
    var end = textArea[0].selectionEnd;
    var selectedText = textArea.val().substring(start, end);
    var replacement = openTag + selectedText + closeTag;
    textArea.val(textArea.val().substring(0, start) + replacement + textArea.val().substring(end, len));
  }
  setGuild(e){ 
    this.guild = e;
    this.populate(this.serv, e, this.dict.server);
  }
  setPeople(e){ 
    this.people = e; 
    this.populate(this.user, e, this.dict.user);
  }
}
module.exports = Message;