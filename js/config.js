class Config {
  constructor(menu, storage, bootbox, status, verbose, token, dialog, path, fs, os, presets, dict) { 
    this.menu = menu;
    
    this.load = this.menu.find("li").eq(0);
    this.save = this.menu.find("li").eq(1);
    this.import = this.menu.find("li").eq(2);
    this.export = this.menu.find("li").eq(3);
    this.remove = this.menu.find("li").eq(4);

    this.store = storage;
    this.box = bootbox;
    this.status = status;
    this.verb = verbose;
    this.token = token;
    this.dialog = dialog;
    this.path = path;
    this.presets = presets;
    this.fs = fs;
    this.os = os;
    this.dict = dict;

    this.loadPresets = false;

    this.load.click(() => { this.loadConfig(); });
    this.save.click(() => { this.saveConfig(); });
    this.import.click(() => { this.importConfig(); });
    this.export.click(() => { this.exportConfig(); });
    this.remove.click(() => { this.removePrompt(); });

  }
  loadConfig(){
    this.status.loading("loading_config");
    this.verb.newline("Loading configuration file...");
    this.store.has('app-config', (error, hasKey) => {
      if (error) throw error;
      if (!hasKey){
        this.status.error("config_not_found");
        this.verb.newline("Configuration file missing.");
      }
      else{
        this.store.get('app-config', (error, data) => {
          if (error) throw error;
          if (data.token==""&&data.presets.length==0){
            this.status.error("config_data_empty");
            this.verb.newline("Configuration file does not contain data.");
          }
          else{
            this.token.set(data.token);
            if (data.presets.length>0) this.loadPresets = data.presets;
            this.status.success("config_loaded");
            this.verb.newline("Configuration file loaded.");
          }
        });
        //if (this.token.loggedIn) this.presets.load(this.loadPresets, message, arg.guilds, arg.users.people);
      }
    });
  }
  saveConfig(){
    this.store.has('app-config', (error, hasKey) => {
      if (error) throw error;
      if (!hasKey) this.saveFile();
      else{
        this.store.get('app-config', (error, data) => {
          if (error) throw error;
          if (data.token == "" && data.presets.length == 0) this.saveFile();
          else{
            this.box.confirm({
              message: this.dict.overwrite_config_prompt, size: 'small',
              buttons: {
                confirm: { label: this.dict.ok, className: 'btn-primary' },
                cancel: { label: this.dict.cancel, className: 'btn-default' }
              },
              callback: (result) => { if (result) this.saveFile(); }
            });
          }
        });
      }
    });
  }
  saveFile(){
    this.status.loading("saving_config");
    this.verb.newline("Saving configuration file...");
    this.store.set('app-config', {
      token: this.token.token,
      presets: this.presets.data
    }, (error) => { 
      if (error) throw error; 
      this.status.success("config_saved");
      this.verb.newline("Configuration file saved.");
    });
  }
  importConfig(){
    this.status.loading("importing_config");
    this.verb.newline("Importing configuration file...");
    this.dialog.showOpenDialog({
        title: this.dict.import_config,
        defaultPath: this.path.join(this.os.homedir(), 'Desktop'),
        filters: [ { name: 'JSON', extensions: ['json'] } ]
      }, (fileNames) => {
        if (fileNames === undefined){
          this.status.warning("config_import_cancelled");
          this.verb.newline("Configuration file import cancelled.");
          return;
        }
        var fileName = fileNames[0];
        this.fs.readFile(fileName, 'utf-8', (err, data) => {
          if (err) { 
            this.status.error(err);
            this.verb.newline(err);
            return; 
          }
          this.store.set('app-config', JSON.parse(data), (error) => { 
            if (error) throw error; 
            else{ 
              this.status.success("config_imported"); 
              this.verb.newline("Configuration file imported.");
              return; 
            }
          });
        });
    });
  }
  exportConfig(){
    this.status.loading("exporting_config");
    this.verb.newline("Exporting configuration file...");
    this.store.has('app-config', (error, hasKey) => {
      if (error) throw error;
      if (!hasKey) {
        this.status.error("config_not_found");
        this.verb.newline("Configuration file missing.");
      }
      else{
        this.store.get('app-config', (error, data) => {
          if (error) throw error;
          var desktopPath = this.path.join(this.os.homedir(), 'Desktop');
          this.dialog.showSaveDialog({
              title: 'Export config',
              defaultPath: this.path.join(desktopPath, 'app-config.json'),
              filters: [ { name: 'JSON', extensions: ['json'] } ]
            }, (fileName) => {
            if (fileName === undefined) {
              this.status.warning("config_export_cancelled");
              this.verb.newline("Configuration file export cancelled.");
              return;
            }
            this.fs.writeFile(fileName, JSON.stringify(data), (err) => {
              if (err) { status.error(err); return; }
              this.status.success("config_exported");
              this.verb.newline("Configuration file exported.");
              return;
            });
          });
        });
      }
    });
  }
  removeConfig(){
    this.status.loading("removing_config_file");
    this.verb.newline("Removing configuration file...");
    this.store.has('app-config', (error, hasKey) => {
      if (error) throw error;
      if (!hasKey) this.status.success("Config is clear!");
      else{
        this.store.remove('app-config', (error) => {
          if (error) throw error;
          this.status.success("config_removed");
          this.verb.newline("Configuration file removed.");
        });
      }
    });
  }
  removePrompt(){
    this.box.confirm({
      message: this.dict.remove_config_prompt,
      size: 'small',
      buttons: {
        confirm: { label: this.dict.oc, className: 'btn-primary' },
        cancel: { label: this.dict.cancel, className: 'btn-default' }
      },
      callback: (result) => { if (result) this.removeConfig(); }
    });
  }
}
module.exports = Config;