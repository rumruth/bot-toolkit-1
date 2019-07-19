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

    this.binds = [
      {
        "keybind" : "CTRL + C + X",
        "description" : "Export configuration file",
        "badges" : [
          {
            "name" : "Mod",
            "description" : `Available as a part of the ${this.name} mod`
          }
        ]
      }
    ];
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

    var appendLeft = "", appendRight = "", assignedBadges = "";

    for (var i = 0; i < this.binds.length; i++) {
      if (this.binds[i].badges!=null&&this.binds[i].badges.length>0) {
        for (var j = 0; j < this.binds[i].badges.length; j++) {
          assignedBadges += `<span id="cemod001" class="badge pull-right" data-toggle="tooltip" data-placement="left" title="${this.binds[i].badges[j].description}">${this.binds[i].badges[j].name}</span>`;
        }
      }
      appendLeft += `<div class="well well-sm ${i<this.binds.length-1?'mb-10':'mb-0'}">${this.binds[i].keybind}</div>`;
      appendRight += `<div class="well well-sm ${i<this.binds.length-1?'mb-10':'mb-0'}">${this.binds[i].description} ${assignedBadges}</div>`;
      assignedBadges = "";
    }

    $("#keybind-container").append(`
      <div class="row split-equal mt-10">
        <div class="col-sm-3">${appendLeft}</div>
        <div class="col-sm-9">${appendRight}</div>
      </div>
    `);

    $('#cemod001').tooltip();
  }
}
module.exports = plugin;