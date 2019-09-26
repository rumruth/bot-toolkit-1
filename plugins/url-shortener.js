class plugin {
  constructor(args) { 
  	this.name = "URL shortener";
  	this.version = "0.0.1";

    this.invite = args.invite;
    this.bootbox = args.bootbox;
    this.status = args.status;

    this.APIKey = "<YOUR_ZEENIN_KEY>";

    this.controlID = Date.now();
    this.inputID = Date.now()+1;
    this.copyID = Date.now()+2;
  }
  run(){
    this.invite.elem.append(`
      <br>
      <button type="button" id="${this.controlID}" class="btn btn-default btn-block">Shorten URL</button>
    `);

    $("#"+this.controlID).click(() => {
      if(this.invite.link.val()!=""){
        fetch(`https://zeenin.ga/api.php?key=${this.APIKey}&url=${this.invite.link.val()}`)
        .then((response) => { return response.json(); })
        .then((e) => {
          if (e.url) {
            this.bootbox.alert({
                message: `
                  <div class="input-group btn-block">
                    <span class="input-group-addon pointer" id="${this.copyID}">
                      <i class="far fa-clipboard"></i>
                    </span>
                    <input type="text" class="form-control" id="${this.inputID}" value="${e.url}" readonly>
                  </div>
                `
            });

            $("#"+this.copyID).click(() => {
              navigator.clipboard.writeText($("#"+this.inputID).val())
              .then(() => {
                this.status.success("link_copied");
              })
              .catch(err => {
                this.status.error(err);
              });
            });
          }
        })
        .catch(err => {
          this.status.error(err);
        });
      }
    });
  }
}
module.exports = plugin;