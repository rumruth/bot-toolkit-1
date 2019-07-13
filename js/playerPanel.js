class PlayerPanel {
	constructor(element, renderer, status, dialog, fs, path) { 
		this.elem = element;
		this.dialog = dialog;
		this.ipc = renderer;
		this.status = status;
		this.setFile = false;
		this.fs = fs;
		this.path = path;

		this.inChannel = false;

		this.sourceType = this.elem.find("select").eq(0);

		this.fileSet = this.elem.find(".player-source").eq(0);
		this.ytSet = this.elem.find(".player-source").eq(1);

		this.clearButton = this.elem.find(".input-group-addon");

		this.ytSource = this.ytSet.find("input");
		this.fileSource = this.fileSet.find("input");

		this.sourceType.change(() => {
			if (this.sourceType.val() == "file") {
				this.fileSet.show();
				this.ytSet.hide();
			}
			else if (this.sourceType.val() == "yt") {
				this.fileSet.hide();
				this.ytSet.show();
			}
		});

		this.volumeBar = this.elem.find(".player").children("li").eq(5).find("input");
		this.playControl = this.elem.find(".player").children("li").eq(0);
		this.pauseControl = this.elem.find(".player").children("li").eq(1);
		this.stopControl = this.elem.find(".player").children("li").eq(2);
		this.volumeToggle = this.elem.find(".player").children("li").eq(4);

		this.volumeBar.on('input', () => {
			var vol = parseFloat(this.volumeBar.val())/100;
			this.ipc.send("set-vol", { "volume" : vol });
		});

		this.clearButton.click(() => {
			this.ytSource.val("");
			this.fileSource.val("");
			this.setFile = false;
			this.ipc.send("clear-dispatcher", {});
	    });

	    this.pauseControl.click(() => {
			this.ipc.send("pause-disp", {});
	    });

	    this.volumeToggle.click(() => {
			if (this.volumeBar.val()>0) this.volumeBar.val(0);
			else this.volumeBar.val(200);
	    });

	    this.playControl.click(() => {
	    	if (this.inChannel) {
				this.status.loading("loading_audio");
				var vol = parseFloat(this.volumeBar.val())/100;

				if (this.setFile && this.sourceType.val() == "file") this.ipc.send("play-disp", { "type" : "file", "source" : this.setFile, "volume" : vol });
				else if (this.sourceType.val()=="yt" && this.ytSource.val()!="") 
				this.ipc.send("play-disp", { "type" : "yt", "source" : this.ytSource.val(), "volume" : vol });
	    	}
	    });

		this.ipc.on('in-vc', (event, arg) => {
			this.inChannel = true;
		});
		this.ipc.on('out-vc', (event) => {
			this.inChannel = false;
		});

    	this.stopControl.click(() => { this.ipc.send("stop-disp"); });

    	this.fileSource.click(() => {
    		var fileName;
	      	this.dialog.showOpenDialog({ filters: [ { 
				name: 'Sounds', 
				extensions: [ 'mp3', 'wav', 'ogg' ] 
	        } ]}, (fileNames) => {
		        if (fileNames === undefined) return;
		        fileName = fileNames[0];
		        this.fs.readFile(fileName, 'utf-8', (err, data) => {
		          if (err) { this.status.error(err); return; }
		          this.fileSource.val(this.path.basename(fileName));
		          this.setFile = fileName;
	        	});
	      	}); 
	    });
	}
	//seemingly impossible with ytdl atm
	/*
	updateProgress(){ 
	}
	*/
}	
module.exports = PlayerPanel;