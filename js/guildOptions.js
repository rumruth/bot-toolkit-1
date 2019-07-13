class guildOptions {
  constructor(element, ipc, msg, stat, dict) { 
    this.elem = element;
    this.ipc = ipc;
    this.msg = msg;
    this.status = stat;
    this.dict = dict;

    this.guild;

    this.server = element.find("select").eq(0);
    this.nick = element.find("input").eq(0);
    this.saveNick = element.find("button").eq(0);
    this.member = element.find("select").eq(1);
    this.act = element.find("select").eq(2);
    this.reason = element.find("textarea").eq(0);
    this.actMember = element.find("button").eq(1);
    this.userId = element.find("input").eq(1);
    this.days = element.find("input").eq(2);
    this.channel = element.find("select").eq(5);
    this.inviteWell = element.find(".well").eq(4);
    this.createInvite = element.find("button").eq(4);

    this.role = element.find("select").eq(3);
    this.roleTarget = element.find("select").eq(4);
    this.roleTargetID = element.find("input").eq(3);
    this.addRole = element.find("button").eq(2);
    this.removeRole = element.find("button").eq(3);

    this.saveNick.click(() => { this.setNick(this.nick.val()); });
    this.server.change(() => { 
      this.ipc.send("get-nick", this.server.val()); 
      this.ipc.send("get-members", { guild: this.server.val(), act: this.act.val() }); 
      this.ipc.send("get-roles", { guild: this.server.val(), act: this.act.val() }); 
    });
    this.act.change(() => { 
      this.ipc.send("get-members", { guild: this.server.val(), act: this.act.val() }); 
    });
    this.actMember.click(() => {
      if (this.act=="0") this.status.loading("kicking_member");
      else if (this.act=="1") this.status.loading("banning_member");
      this.ipc.send("act-user", { 
        user: this.member.val(), 
        guild: this.server.val(), 
        reason: this.reason.val(), 
        act: this.act.val(),
        days: this.days.val()
      }); 
    });
    this.addRole.click(() => {
      this.status.loading("assigning_role");
      this.ipc.send("add-role", { 
        user: this.roleTarget.val(), 
        guild: this.server.val(),
        role: this.role.val()
      }); 
    });
    this.removeRole.click(() => {
      this.status.loading("removing_role");
      this.ipc.send("remove-role", { 
        user: this.roleTarget.val(), 
        guild: this.server.val(),
        role: this.role.val()
      }); 
    });
    this.member.change(() => { this.userId.val(this.member.val()); });
    this.roleTarget.change(() => { this.roleTargetID.val(this.roleTarget.val()); });
    this.userId.keyup(() => { this.member.val(this.userId.val()); });
    this.roleTargetID.keyup(() => { this.roleTarget.val(this.roleTargetID.val()); });

    this.ipc.on('take-nick', (event, arg) => { if (arg) this.nick.val(arg); });
    this.ipc.on('take-members', (event, arg) => { 
      this.msg.populate(this.member, arg, this.dict.member); 
      this.msg.populate(this.roleTarget, arg, this.dict.member); 
    });

    this.ipc.on('receive-invites', (event, arg) => { 
      this.inviteWell.empty();
      if (arg.length>0) {
        for (var i = 0; i < arg.length; i++) {
          this.inviteWell.append(`
            <div class="input-group ${i<arg.length-1?'mb-5':''}">
              <span class="input-group-addon">${arg[i].channel}</span>
              <input type="text" class="form-control" readonly value="${arg[i].url}">
              <span class="input-group-addon pointer" data-copy="${arg[i].url}"><i class="far fa-clipboard"></i></span>
            </div>
          `);
        }
      }
      else this.inviteWell.append(`<center>${this.dict.no_invites_found}</center>`);
      this.inviteWell.find('.input-group-addon').click((e) => {
        this.copy($(e.currentTarget).data('copy'));
      });
    });

    this.createInvite.click(() => {
      this.status.loading("creating_invite");
      this.ipc.send("create-invite", { 
        guild: this.server.val(),
        channel: this.channel.val()
      }); 
    });

    this.ipc.on('take-roles', (event, arg) => { 
      this.msg.populate(this.role, arg, this.dict.role);
    });

    this.server.change(() => { 
      this.msg.populate(this.channel, this.guild.find(x => x.id == this.server.val()).channels.text, this.dict.channel);
      this.ipc.send("get-invites", { guild: this.server.val() });
    });
  }
  setNick(text){ 
    this.status.loading("setting_nickname");
    this.ipc.send("set-nick", { guild:this.server.val(), nick:text }); 
  }
  setGuild(array){ 
    this.guild = array;
    this.msg.populate(this.server, array, this.dict.server);
  }
  copy(text){
    var dummy = document.createElement("input");
    document.body.appendChild(dummy);
    dummy.setAttribute('value', text);
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
    this.status.success("link_copied");
  }
} 
module.exports = guildOptions;