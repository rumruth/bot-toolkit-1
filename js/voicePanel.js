class VoicePanel {
	constructor(element, msg, renderer, status, dict) { 
	  this.elem = element;
	  this.msg = msg;
	  this.ipc = renderer;
	  this.status = status;
	  this.dict = dict;

	  this.guild;

	  this.well = element.find(".well").eq(0);

	  this.serv = element.find("select").eq(0);
	  this.chan = element.find("select").eq(1);

	  this.serv.change(() => {
	    this.msg.populate(this.chan, this.guild.find(x => x.id == this.serv.val()).channels.voice, this.dict.channel);
	  });

	  this.join = element.find("button").eq(0);
	  this.leave = element.find("button").eq(1);

	  this.join.click(() => {
	    this.status.loading("joining_voice_channel");
	    this.ipc.send("join-vc", { channel : this.chan.val() });
	  });
	  this.leave.click(() => {
	    this.status.loading("leaving_voice_channel");
	    this.ipc.send("leave-vc", { channel : this.chan.val() });
	  });

	  this.ipc.on('in-vc', (event, arg) => {
	    this.well.text(this.dict.currently_in + " " + arg.channel + ", " + arg.guild);
	    this.well.fadeIn();
	  });
	  this.ipc.on('out-vc', (event) => {
	  	//bug here
	    this.well.fadeOut(() => { this.well.text(''); });
	  });

	}
	setGuild(array){ 
	  this.guild = array; 
	  this.populate(this.serv, this.guild, this.dict.server);
	}
	populate(item, array, placeholder){ this.msg.populate(item, array, placeholder); }
}	
module.exports = VoicePanel;