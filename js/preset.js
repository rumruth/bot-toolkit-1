class Preset {
  constructor(element, args, message, controller, ipc, bootbox, dict) { 
    this.elem = element;
    this.args = args;
    this.controller = controller;
    this.ipc = ipc;
    this.box = bootbox;
    this.message = message;
    this.dict = dict;

    this.serv;
    this.chan;
    this.user;
    this.usId;

    this.parent = $("<div>", { 'class': "panel panel-default" }).appendTo(this.elem);

    this.parent.append(`
      <div class="panel-heading">
        <h3 class="panel-title">${this.args.name}</h3>
      </div>
      <div class="panel-body">
        <div class="row split-equal">
          <div class="col-sm-6">
          </div>
          <div class="col-sm-6">
          </div>
        </div>
      </div>
    `);

    this.enabled = false;
    this.parent.find(".panel-title").append('<i class="fas fa-chevron-down right-icon pull-right pointer" style="display:none;"></i>');
    this.parent.find("h3").on('click', '.right-icon', () => { this.togglePanel(); });

    this.parent.find(".panel-title").append(`<button type="button" class="btn btn-primary btn-xs pull-right">${this.dict.send}</button>`);
    this.parent.find(".panel-title").append(`<button type="button" class="btn btn-warning btn-xs pull-right">${this.dict.load}</button>`);
    this.parent.find(".panel-title").append(`<button type="button" class="btn btn-danger btn-xs pull-right">${this.dict.delete}</button>`);

    this.parent.find(".btn-warning").click(() => {
      this.message.kind.val(this.args.type);
      this.message.kind.trigger('change');
      if (this.args.type=="0") {
        //console.log(this.args);
        this.message.serv.val(this.serv.val());
        this.message.serv.trigger('change');
        this.message.chan.val(this.chan.val());
      }
      else{
        this.message.user.val(this.user.val());
        this.message.userId.val(this.usId.val());
      }
      this.message.text.val(this.text.val());
      this.controller.remove(this);
    });

    this.parent.find(".btn-danger").click(() => {
      this.box.confirm({
        message: this.dict.are_you_sure,
        size: 'small',
        buttons: {
          confirm: { label: this.dict.ok, className: 'btn-primary' },
          cancel: { label: this.dict.cancel, className: 'btn-default' }
        },
        callback: (result) => { if (result) this.controller.remove(this); }
      });
    });

    this.body = this.parent.find(".panel-body").eq(0);

    if (this.args.type=="0") {
      this.parent.find(".col-sm-6").eq(0).append(`<select class="form-control"></select>`);
      this.parent.find(".col-sm-6").eq(1).append(`<select class="form-control"></select>`);
      this.serv = this.parent.find("select").eq(0);
      this.chan = this.parent.find("select").eq(1);
      this.message.populate(this.serv, this.args.array, this.dict.server);
      this.message.populate(this.chan, [], this.dict.channel);
      if (this.args.serv) this.message.populate(this.chan, this.args.array.find(x => x.id == this.args.serv).channels.text, this.dict.channel);
      else if (this.args.server) this.message.populate(this.chan, this.args.array.find(x => x.id == this.args.server).channels.text, this.dict.channel);
      else this.message.populate(this.chan, [], this.dict.channel);

      this.serv.val(this.args.server);
      this.chan.val(this.args.channel);
      if (this.args.channel=="direct") this.chan.val("");

      this.serv.change(() => {
        this.message.populate(this.chan, this.args.array.find(x => x.id == this.serv.val()).channels.text, this.dict.channel);
      });
    }
    else { 
      this.parent.find(".col-sm-6").eq(0).append(`<select class="form-control"></select>`);
      this.parent.find(".col-sm-6").eq(1).append(`<input class="form-control" value="${this.args.id||""}" placeholder="${this.dict.search_by_id}">`);
      this.user = this.parent.find("select").eq(0);
      this.usId = this.parent.find("input").eq(0);

      this.message.populate(this.user, this.args.array, this.dict.user);

      this.user.val(this.args.id);

      this.user.change(() => { this.usId.val(this.user.val()); });
      this.usId.keyup(() => { this.user.val(this.usId.val()); });
    }

    this.body.append(`
      <br>
      <textarea class="form-control" style="resize:vertical;" placeholder="${this.dict.message_text}">${this.args.message}</textarea>
    `);

    this.text = this.parent.find("textarea");

    this.parent.find(".btn-primary").click(() => {
      if (this.serv!=undefined && this.serv.val()!=null&&this.chan.val()!=null&&this.text.val()!="") this.ipc.send("send-msg", this.data);
      else if (this.user!=undefined && this.user.val()!=null&&this.text.val()!="") this.ipc.send("send-msg", this.data);
    });
  }

  disablePanel(){
    this.parent.find(".right-icon").hide();
    this.hidePanel();
    this.enabled = false;
  }
  enablePanel(){
    this.enabled = true;
    this.parent.find(".right-icon").show();
    this.showPanel();
  }
  showPanel(){
    if (!this.enabled) return;
    this.body.slideDown();
    this.parent.find(".right-icon").removeClass("fa-chevron-down");
    this.parent.find(".right-icon").addClass("fa-chevron-up");
  }
  hidePanel(){
    if (!this.enabled) return;
    this.body.slideUp();
    this.parent.find(".right-icon").removeClass("fa-chevron-up");
    this.parent.find(".right-icon").addClass("fa-chevron-down");
  }
  togglePanel(){
    if (!this.enabled) return;
    if (this.body.is(":visible")) this.hidePanel();
    else this.showPanel();
  }
  remove(){ this.parent.remove(); }
  get data(){
    return {
      type: this.args.type,
      server: this.serv?this.serv.val():"",
      channel: this.chan?this.chan.val():"",
      user: this.user?this.user.val():"",
      id: this.usId?this.usId.val():"",
      content : this.text.val()
    }
  }
}
module.exports = Preset;