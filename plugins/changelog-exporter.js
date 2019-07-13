class plugin {
  constructor(args) { 
  	this.name = "Changelog exporter";
  	this.version = "0.0.1";

  	this.fs = args.fs;
  	this.path = args.path;
  	this.dialog = args.dialog;
  	this.os = args.os;
  	this.mousetrap = args.mt;
  	this.verbose = args.vb;
  	this.status = args.status;
  	this.storage = args.storage;
  }
  run(){
  	this.mousetrap.bind('ctrl+c+x', (e) => { 
	    this.status.loading("Exporting changelog...");
	    this.verbose.newline("Exporting changelog file...");
        this.storage.get('app-changelog', (error, data) => {
          	if (error) throw error;
	  		var desktopPath = this.path.join(this.os.homedir(), 'Desktop');
			this.dialog.showSaveDialog({
				title: 'Export settings',
				defaultPath: this.path.join(desktopPath, 'app-changelog.json'),
				filters: [ { name: 'JSON', extensions: ['json'] } ]
			}, (fileName) => {
				if (fileName === undefined) {
					this.verbose.newline("Changelog file export cancelled.");
					this.status.warning("Changelog export cancelled");
					return;
				}
				this.fs.writeFile(fileName, JSON.stringify(data), (err) => {
					if (err) { this.status.error(err); return; }
					this.status.success("Changelog exported!");
					this.verbose.newline("Changelog file exported.");
					return;
				});
			});
		});
  	});
  	$("#keybind-container").append(`
      <div class="row split-equal">
        <div class="col-sm-3"><div class="well well-sm mt-10 mb-0"}">CTRL + C + X</div></div>
        <div class="col-sm-9"><div class="well well-sm mt-10 mb-0">Export configuration file</div></div>
      </div>
    `);
  }
}
module.exports = plugin;