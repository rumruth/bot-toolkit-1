$(document).ready(function() {
  //REQUIRE LIBRARIES
  var {ipcRenderer, remote} = require('electron');
  const dialog = remote.dialog;
  var fs = require('fs');
  const window = remote.getCurrentWindow();
  var main = remote.require("./main.js");
  const shell = require('electron').shell;
  const storage = require('electron-json-storage');
  var path = require('path');
  const os = require('os');
  var commandExists = require('command-exists');
  const semver = require('semver');

  storage.setDataPath(path.resolve(__dirname + "/data"));

  //VERIFY FFMPEG
  commandExists('ffmpeg', function(err, command) { if(command) $("#verify-ffmpeg").hide(); });
  
  //DEFAULT DATA FALLBACK FOR RESETS
  const defaults = require(path.resolve(__dirname + "/data/app-defaults.json"));

  //APP IDENTITIY SETUP
  storage.has('app-id', function(error, hasKey) {
    if (error) throw error;
    if (!hasKey) storage.set('app-id', defaults.identity, function(error) { if (error) throw error; });
    else{
      storage.get('app-id', function(error, data1) {
        if (error) throw error;
        //SET GLOBAL APP VERSION REFERENCE
        document.title = document.title + data1.version;
        $("#bot-app").val(data1.version);
        $(".version").text("v" + data1.version);
        if (!data1.seen) {
          $('#changelogModal').modal('show');
          appVersion = data1.version;
          storage.set('app-id', { seen: 1, version: data1.version }, function(error) { if (error) throw error; });
        }

        //SETTINGS SETUP
        storage.has('app-settings', function(error, hasKey) {
          if (error) throw error;
          if (!hasKey) storage.set('app-settings', defaults.settings, function(error) { if (error) throw error; });
          else{
            storage.get('app-settings', function(error, data) {
              if (error) throw error;
              //SET SETTING VALUES
              $('#debug-mode').prop('checked', data.debug);
              data.debug?$("#debug-toggle").show():$("#debug-toggle").hide();
              if (data.debug) {
                Mousetrap.bind('ctrl+a', function(e) { e.preventDefault(); panels.enableAll(); });
                Mousetrap.bind('shift+ctrl+i', function(e) { e.preventDefault(); window.toggleDevTools(); });
              }
              $('#hide-token').prop('checked', data.token);
              data.token?token.hide():token.show();
              $('#disable-tooltips').prop('checked', data.tooltips);
              if (!data.tooltips) $('[data-toggle="tooltip"]').tooltip({ container: 'body' });
              $('#show-verbose').prop('checked', data.verbose);
              data.verbose?verbose.show():verbose.hide();

              $('#dark-mode').prop('checked', data.dark);
              if (data.dark) $('head').append('<link rel="stylesheet" type="text/css" href="css/dark.css">');

              $('#app-lang').val(data.language);

              $('#check-updates').prop('checked', data.updates);
              if (data.updates) fetch('https://source.dog/toolkit/update.php')
                .then(function(response) { return response.json(); }).then(function(info) {
                  if (semver.gt(info.version, data1.version)) $("#version-control").show();
                });
            });
          }
        });

      });
    }
  });

  //CHANGELOG SETUP
  storage.has('app-changelog', function(error, hasKey) {
    if (error) throw error;
    else{
      storage.get('app-changelog', function(error, data) {
        if (error) throw error;
        $("#changelog-container").append(`<p style="text-align:justify;">${data.description}</p><ul>`);
        var toAppend = "<ul>";
        if (data.changes.added.length>0){
          toAppend += "<li>Added:<ul>";
          for (var i = 0; i < data.changes.added.length; i++) toAppend += `<li>${data.changes.added[i]}</li>`;
          toAppend += "</ul></li>"
        }
        if (data.changes.removed.length>0){
          toAppend += "<li>Removed:<ul>";
          for (var i = 0; i < data.changes.removed.length; i++) toAppend += `<li>${data.changes.removed[i]}</li>`;
          toAppend += "</ul></li>"
        }
        if (data.changes.fixed.length>0){
          toAppend += "<li>Fixed:<ul>";
          for (var i = 0; i < data.changes.fixed.length; i++) toAppend += `<li>${data.changes.fixed[i]}</li>`;
          toAppend += "</ul></li>"
        }
        if (data.changes.misc.length>0){
          toAppend += "<li>Miscellaneous:<ul>";
          for (var i = 0; i < data.changes.misc.length; i++) toAppend += `<li>${data.changes.misc[i]}</li>`;
          toAppend += "</ul></li>"
        }
        $("#changelog-container").append(toAppend + `</ul>`);
      });
    }
  });

  //KEYBIND SETUP
  storage.has('app-keybinds', function(error, hasKey) {
    if (error) throw error;
    else{
      storage.get('app-keybinds', function(error, data) {
        if (error) throw error;

        var appendLeft = "", appendRight = "", assignedBadges = "";

        for (var i = 0; i < data.length; i++) {
          if (data[i].badges!=null&&data[i].badges.length>0) {
            for (var j = 0; j < data[i].badges.length; j++) {
              assignedBadges += `<span class="badge pull-right" data-toggle="tooltip" data-placement="left" title="${data[i].badges[j].description}">${data[i].badges[j].name}</span>`;
            }
          }
          appendLeft += `<div class="well well-sm ${i<data.length-1?'mb-10':'mb-0'}">${data[i].keybind}</div>`;
          appendRight += `<div class="well well-sm ${i<data.length-1?'mb-10':'mb-0'}">${data[i].description} ${assignedBadges}</div>`;
          assignedBadges = "";
        }

        $("#keybind-container").append(`
          <div class="row split-equal">
            <div class="col-sm-3">${appendLeft}</div>
            <div class="col-sm-9">${appendRight}</div>
          </div>
        `);
      });
    }
  });

  //RENDER AUTHOR'S DISCORD TAG
  fetch('http://discord-data-bot.herokuapp.com/?id=233159595261034497')
    .then(function(response) { return response.json(); }).then(function(data) {
      $(".author").text(data.username+"#"+data.discriminator);
    });

  //LOAD CLASS FILES
  const Status = require('./js/status.js');
  const PanelController = require('./js/panelController.js');
  const CalculatorUI = require('./js/calculatorUi.js');
  const Invite = require('./js/invite.js');
  const appWindow = require('./js/appWindow.js');
  const TokenControl = require('./js/tokenControl.js');
  const Verbose = require('./js/verbose.js');

  //CLASS VARIABLES
  const status = new Status($("#status"), dict);
  const panels = new PanelController($("[data-cp='1']"));

  //CUSTOM CLASS VARIABLES
  const invite = new Invite($("[data-inv='1']"), status);
  const calculatorUi = new CalculatorUI($("[data-calculator='1']"), invite, dict);
  const verbose = new Verbose($("[data-verb='1']"));
  const token = new TokenControl($("[data-token='1']"), ipcRenderer, status, verbose, dict);
  const appWin = new appWindow($("[data-wc='1']"), window, token);
  const PresetController = require('./js/presetController.js');
  const presets = new PresetController($("[data-pres='1']"), ipcRenderer, bootbox, dict);
  const Message = require('./js/message.js');
  const message = new Message($("[data-msg='1']"), bootbox, ipcRenderer, presets, dict);
  const VoicePanel = require('./js/voicePanel.js');
  const vPanel = new VoicePanel($("[data-vp='1']"), message, ipcRenderer, status, dict);
  const PlayerPanel = require('./js/playerPanel.js');
  const pPanel = new PlayerPanel($("[data-pl='1']"), ipcRenderer, status, dialog, fs, path);
  const Configuration = require('./js/config.js');
  const config = new Configuration(
    $("[data-cfg='1']"), 
    storage, 
    bootbox, 
    status, 
    verbose, 
    token, 
    dialog, 
    path, 
    fs, 
    os, 
    presets,
    dict
  );
  const guildOptions = require('./js/guildOptions.js');
  const guildData = new guildOptions($("[data-gd='1']"), ipcRenderer, message, status, dict);  

  //CLASS SAMPLE
  /*
  class Status {
    constructor(element) { this.elem = element; }
    text(msg){ $(this.elem).text(msg); }
  }
  */

  //EXPERIMENTAL

  //DM FEED
  ipcRenderer.on('dm-feed', (event, arg) => { 
    /*$("#dm-feed").append(`
      <div class="dm-message">${arg}</div>
    `);*/ 
    if (($("#dm-feed-users").val()==arg.author.id || $("#dm-feed-users").val()==arg.recipient) && $("#dm-feed-users").val()!=null) {
      $("#dm-feed").append(`
        <div class="dm-message">${arg.author.username}: ${arg.content}</div>
      `);
    }
  });

  ipcRenderer.on('return-dm-messages', (event, arg) => { 
    $("#dm-feed").empty();
    for (var i = 0; i < arg.length; i++) {
      $("#dm-feed").append(`
        <div class="dm-message">${arg[i].author.username}: ${arg[i].content}</div>
      `);
    }
  });

  $("#dm-feed-users").change(function(){
    ipcRenderer.send("get-dm-messages", {
      "user" : $("#dm-feed-users").val()
    });
  });

  //PANEL SEARCH ENGINE
  var searchMap = require("./data/app-map.json");
  //please enable ctrl+a as an exception
  Mousetrap.bind('ctrl+f', function(e) { 
    e.preventDefault(); 

    if (!$(".app-body").hasClass("app-body-bar-extended")) {
      $(".result-count").text("");
      $(".app-body").addClass("app-body-bar-extended");
      $(".bottom-bar").addClass("bottom-bar-visible");
      setTimeout(function(){ $("#bottom-search-input").focus(); }, 500);
    }
    else{
      $(".app-body").removeClass("app-body-bar-extended");
      $(".bottom-bar").removeClass("bottom-bar-visible");
      $("#bottom-search-input").blur();
      $(".result-count").text("");
    }
  });
  
  $("#bottom-search-button").click(searchAgain);

  var match = [];
  var searchIndex = 0;

  function getMatches(){
    var query = $("#bottom-search-input").val();

    for (var i = 0; i < searchMap.length; i++) {
      for (var j = 0; j < searchMap[i].keywords.length; j++) {
        if (query.trim().toLowerCase()==searchMap[i].keywords[j]) match.push(searchMap[i]);
      }
    }

    if (match.length>0){
      $(".result-count").text(`${match.length} ${match.length==1?"result":"results"} found`);

      searchPanel(0);

      if (match.length>1) $(".multiple-search-buttons").addClass("msb-show");
    }
    else {
      $(".result-count").text("No results found");
      $(".multiple-search-buttons").removeClass("msb-show");
    }
  }

  function searchAgain(){
    match = [];
    $(".result-count").text("");
    searchPanel();
  }

  function searchPanel(index){
    if (match.length>0 && match[index]) {
      $(`[data-search-tab='${match[index].tab}']`).click();

      if (match[index].element) {
        $('.main-container').scrollTop(0)

        var offset = $(`[data-search='${match[index].element}']`).offset();
        $('.main-container').animate({ scrollTop: offset.top-130 });
      }
    }
    else getMatches();
  }

  $("#next-result-search").click(function(){
    if (match.length>0) {
      if (match[searchIndex-1]) {
        searchIndex--;
        searchPanel(searchIndex);
      }
      else searchPanel(searchIndex);
    }
    else searchPanel();
  });

  $("#prev-result-search").click(function(){
    if (match.length>0) {
      if (match[searchIndex+1]) {
        searchIndex++;
        searchPanel(searchIndex);
      }
      else searchPanel(searchIndex);
    }
    else searchPanel();
  });

  $("#bottom-search-input").keyup(function(e){
    if(e.keyCode == 13) searchAgain();
  });

  $("#close-search-panel").click(function(){
    $(".app-body").removeClass("app-body-bar-extended");
    $(".bottom-bar").removeClass("bottom-bar-visible");
    $("#bottom-search-input").blur();
    $(".result-count").text("");
  });

  //MODAL CLOSE FIX
  $('.modal').on('show.bs.modal', function () {
    $('.modal').not($(this)).each(function () { $(this).modal('hide'); });
  });
  //PREVENT LOADING DRAGGED FILE FIX
  $(document).bind('dragover', function(e){ e.preventDefault(); });
  $(document).on("drop", function(e){ e.preventDefault(); });
  //OPEN LINKS IN EXTERNAL
  $("a").each(function(i, item){
    if (!item.href.endsWith("#")) {
      $(this).click(function(e){
        verbose.newline("Opening external url...");
        e.preventDefault();
        shell.openExternal(this.href);
      });
    }
  });
  //LANGUAGE LOADER
  const langCodes = require(path.resolve(__dirname + "/lib/" + "langCodes.js"));
  fs.readdir(path.resolve(__dirname + "/locale/"), (err, files) => {
    files.forEach(file => {
      var lc = file.split('.')[0];
      $("#app-lang").append(`<option value="${lc}">${langCodes[lc].name}</option>`);
    });
  });
  //MULTILEVEL DROPDOWN FIX
  var lastUl = false;
  $('.dropdown-submenu a.submenu-a').on("click", function(e){
    if(lastUl) lastUl.toggle();
    $(this).next('ul').toggle();
    lastUl = $(this).next('ul');
    e.stopPropagation();
    e.preventDefault();
  });
  $(".app-menu").click(function() {
    if(lastUl) lastUl.toggle();
    lastUl = false;
  });
  //FULL SIZE PROFILE IMAGE
  $("#bot-pic").mouseenter(function(){ $("#full-pic").show(); });
  $("#bot-pic").mouseleave(function(){ $("#full-pic").hide(); });
  $("#bot-pic").mousemove(function(e){
    var parentOffset = $(this).parent().offset();
    $("#full-pic").css({ top: (e.pageY - parentOffset.top), left: (e.pageX - parentOffset.left) }); 
  });
  //SET PRESENCE
  $("#set-presence").click(function(){ 
    status.loading("setting_presence");
    verbose.newline(`Setting presence. Status: ${$("#bot-status").val()}, Game: ${ $("#bot-game").val() };`);
    ipcRenderer.send("set-presence", {
      "status" : $("#bot-status").val(),
      "game" : $("#bot-game").val()
    });
  });
  //SIDEBAR MENU
  $(".side-menu").click(function(){
    $(".main-container").hide();
    $("#" + $(this).data("target")).show();
    $(".side-menu").removeClass("active");
    $(this).addClass("active");
  });
  //PROFILE DATA BATCH
  var fileName = "";
  $("#pic-name").click(function(){ 
    dialog.showOpenDialog({ filters: [ { 
        name: dict.images, 
        extensions: [ 'jpg', 'jpeg', 'png', 'gif' ] 
      } ]}, function (fileNames) {
      if (fileNames === undefined) return;
      fileName = fileNames[0];
      fs.readFile(fileName, 'utf-8', function (err, data) {
        if (err) { status.error(err); return; }
        $("#pic-name").val(path.basename(fileName));
      });
    }); 
  });
  //SAVE SETTINGS
  $("#save-settings").click(function(){
    status.success("saving_settings");
    verbose.newline("Saving settings...");
    storage.set('app-settings', {
      debug: $("#debug-mode").prop('checked')?1:0,
      token: $("#hide-token").prop('checked')?1:0,
      tooltips: $("#disable-tooltips").prop('checked')?1:0,
      verbose: $("#show-verbose").prop('checked')?1:0,
      dark: $("#dark-mode").prop('checked')?1:0,
      language: $("#app-lang").val(),
      updates: $("#check-updates").prop('checked')?1:0
    }, function(error) { 
      if (error) throw error; 
      else {
        status.success("settings_saved");
        verbose.newline("Settings saved.");
      }
    });
  });
  //KEYBINDS
  Mousetrap.bind('ctrl+r', function(e) { e.preventDefault(); token.loggedIn?token.reloadSafely():window.reload(); });
  Mousetrap.bind('ctrl+shift+r', function(e) { e.preventDefault(); window.reload(); });
  Mousetrap.bind('ctrl+s', function(e) { e.preventDefault(); config.saveConfig(); });
  Mousetrap.bind('ctrl+l', function(e) { e.preventDefault(); config.loadConfig(); });
  Mousetrap.bind('ctrl+e', function(e) { e.preventDefault(); config.exportConfig(); });
  Mousetrap.bind('ctrl+i', function(e) { e.preventDefault(); config.importConfig(); });
  Mousetrap.bind('ctrl+d', function(e) { e.preventDefault(); config.removePrompt(); });
  Mousetrap.bind('ctrl+q', function(e) { e.preventDefault(); window.close(); });
  Mousetrap.bind('alt+d', function(e) { e.preventDefault(); $("#debug-toggle").toggle(); });
  //DEBUG OPTIONS
  $("#debug-enable-panels").click(function(){ panels.enableAll(); });
  $("#debug-disable-panels").click(function(){ panels.disableAll(); });
  $("#debug-show-panels").click(function(){ panels.showAll(); });
  $("#debug-hide-panels").click(function(){ panels.hideAll(); });
  $("#debug-show-presets").click(function(){ presets.showAll(); });
  $("#debug-hide-presets").click(function(){ presets.hideAll(); });
  $("#debug-clear-presets").click(function(){ presets.removeAll(); });
  $("#debug-enable-presets").click(function(){ presets.enableAll(); });
  $("#debug-disable-presets").click(function(){ presets.disableAll(); });
  $("#debug-reload-window").click(function(){ window.reload(); });
  $("#debug-safe-reload").click(function(){ token.reloadSafely(); });
  $("#debug-devtools").click(function(){ window.toggleDevTools(); });
  $("#debug-close-window").click(function(){ window.close(); });
  $("#debug-lock-token").click(function(){ token.lock(); });
  $("#debug-unlock-token").click(function(){ token.unlock(); });
  $("#debug-hide-token").click(function(){ token.hide(); });
  $("#debug-show-token").click(function(){ token.show(); });
  $("#debug-clear-token").click(function(){ token.clear(); });
  $("#debug-reset-id").click(function(){
    storage.set('app-id', defaults.identity, function(error) { if (error) throw error; });
  });
  $("#settings-import").click(function(){
    status.loading("importing_settings");
    verbose.newline("Importing settings file...");
    dialog.showOpenDialog({
        title: dict.import_settings,
        defaultPath: path.join(os.homedir(), 'Desktop'),
        filters: [ { name: 'JSON', extensions: ['json'] } ]
      }, (fileNames) => {
        if (fileNames === undefined){
          status.warning("settings_import_cancelled");
          verbose.newline("Settings file import cancelled.");
          return;
        }
        fileName = fileNames[0];
        fs.readFile(fileName, 'utf-8', (err, data) => {
          if (err) { 
            status.error(err);
            verbose.newline(err);
            return; 
          }
          //add file content validity verification
          storage.set('app-settings', JSON.parse(data), (error) => { 
            if (error) throw error; 
            else{ 
              status.success("settings_imported"); 
              verbose.newline("Settings file imported.");
              return; 
            }
          });
        });
    });
  });
  $("#settings-export").click(function(){
    status.loading("exporting_settings");
    verbose.newline("Exporting settings file...");
    storage.has('app-settings', (error, hasKey) => {
      if (error) throw error;
      if (!hasKey) {
        status.error("settings_not_found");
        verbose.newline("Settings file missing.");
      }
      else{
        storage.get('app-settings', (error, data) => {
          if (error) throw error;
          var desktopPath = path.join(os.homedir(), 'Desktop');
          dialog.showSaveDialog({
              title: dict.export_settings,
              defaultPath: path.join(desktopPath, 'app-settings.json'),
              filters: [ { name: 'JSON', extensions: ['json'] } ]
            }, (fileName) => {
            if (fileName === undefined) {
              status.warning("settings_export_cancelled");
              verbose.newline("Settings file export cancelled.");
              return;
            }
            fs.writeFile(fileName, JSON.stringify(data), (err) => {
              if (err) { status.error(err); return; }
              status.success("settings_exported");
              verbose.newline("Settings file exported.");
              return;
            });
          });
        });
      }
    });
  });
  $("#debug-reset-settings").click(function(){
    storage.set('app-settings', defaults.settings, function(error) { if (error) throw error; });
  });
  $("#debug-full-reset").click(function(){
    storage.set('app-settings', defaults.settings, function(error) { if (error) throw error; });
    storage.set('app-id', defaults.identity, function(error) { if (error) throw error; });
    presets.removeAll();
    config.removeConfig();
    token.callLogout();
    bootbox.confirm({
      message: dict.app_reset_msg,
      size: 'small',
      buttons: {
        confirm: { label: dict.ok, className: 'btn-primary' },
        cancel: { label: dict.cancel, className: 'btn-default' }
      },
      callback: (result) => { if (result) window.reload(); }
    });
  });
  //EXPERIMENTAL PANEL STUFF
  $("#bot-node").val(process.versions.node);
  $("#bot-chrome").val(process.versions.chrome);
  $("#bot-electron").val(process.versions.electron);
  //RESET PROFILE IMAGE INPUT
  $("#remove-pic").click(function(){
    fileName = "";
    $("#pic-name").val("");
  });
  //SAVE PROFILE INFORMATION
  $("#save-profile").click(function(){
    if ($("#bot-username").val().trim()!=""||fileName!="") {
      status.loading("setting_profile_data");
      verbose.newline(`Setting profile data. Username: ${ $("#bot-username").val().trim() }, Image file: ${ fileName }`);
      ipcRenderer.send("set-profile", {
        username: $("#bot-username").val().trim(),
        image: fileName
      });
    }
  });
  //DEFAULT EVENT NOTIFIER
  ipcRenderer.on('newEvent', (event, arg) => { verbose.newline(arg); });
  //MAIN INTERACTION
  ipcRenderer.on('err', (event, arg) => { status.error(arg); });
  ipcRenderer.on('success', (event, arg) => { status.success(arg); });
  ipcRenderer.on('loading', (event, arg) => { status.loading(arg); });
  //UPDATE BOT PING
  ipcRenderer.on('new-ping', (event, arg) => { $("#bot-ping").val(Math.floor(arg)); });
  //UPDATE PROFILE IMAGE AND USERNAME
  ipcRenderer.on('data-update', (event, arg) => {
    $("#bot-name").val(arg.username+"#"+arg.discriminator);
    if (arg.avatar) {
      $("#bot-pic").css('background-image', `url(https://cdn.discordapp.com/avatars/${arg.id}/${arg.avatar}.png)`);
      $("#full-pic>img").attr('src', `https://cdn.discordapp.com/avatars/${arg.id}/${arg.avatar}.png`);
    }
  });
  //IPC CALLS
  var pingInterval;
  ipcRenderer.on('loggedIn', (event, arg) => {
    token.login();

    message.setGuild(arg.guilds);
    message.setPeople(arg.users.people);

    //populate guild data panel
    guildData.setGuild(arg.guilds);

    //poplate voice feedback window
    vPanel.setGuild(arg.guilds);

    //DM FEED USER LIST
    message.populate($("#dm-feed-users"), arg.users.people, dict.user);

    if (config.loadPresets) presets.load(config.loadPresets, message, arg.guilds, arg.users.people);

    $("#add-preset").click(function(){
      presets.new({
        type: $("#dummy-preset").val(),
        name: dict.untitled,
        message: "",
        array : $("#dummy-preset").val()=="0"?arg.guilds:arg.users.people
      }, message); 
    });

    status.success("logged_in");
    verbose.newline("Successfully logged in.");
    panels.enableAll();
    invite.setId(arg.user.id);
    invite.setPerms(0);
    invite.setLink();
    $("#bot-name").val(arg.user.username+"#"+arg.user.discriminator);
    if (arg.user.avatar) {
      $("#bot-pic").css('background-image', `url(https://cdn.discordapp.com/avatars/${arg.user.id}/${arg.user.avatar}.png)`);
      $("#full-pic>img").attr('src', `https://cdn.discordapp.com/avatars/${arg.user.id}/${arg.user.avatar}.png`);
    }
    //PING INTERVAL
    ipcRenderer.send("get-ping");
    pingInterval = setInterval(function(){ ipcRenderer.send("get-ping"); }, 10000);

    $("#bot-users").val(arg.stats.users);
    $("#bot-channels").val(arg.stats.channels);
    $("#bot-servers").val(arg.stats.guilds);
  });
  ipcRenderer.on('loggedOut', (event) => {
    token.logout();

    status.success("logged_out");
    verbose.newline("Successfully logged out.");
    clearInterval(pingInterval);
    panels.disableAll();
  });
  ipcRenderer.on('reload', (event) => { window.reload(); });

  ipcRenderer.on('updateServers', (event, arg) => {
    message.setGuild(arg.guilds);
    message.setPeople(arg.users.people);

    //populate guild data panel
    guildData.setGuild(arg.guilds);

    //poplate voice feedback window
    vPanel.setGuild(arg.guilds);

    message.populate($("#dm-feed-users"), arg.users.people, dict.user);
  });

  //TIMEOUT TO DETECT VERBOSE AND LET EVERYTHING ELSE PROCESS
  setTimeout(function(){

    //PLUGIN LOADER
    var plugins = [];
    fs.readdir(path.resolve(__dirname + "/plugins/"), (err, files) => {
      if (files != undefined && files.length>0) {
        files.forEach(file => {
          var item = require(path.resolve(__dirname + "/plugins/" + file));
          plugins.push(new item({
            fs: fs,
            mt: Mousetrap,
            path: path,
            dialog : dialog,
            os: os,
            vb: verbose,
            status: status,
            storage : storage
          }));
        });

        for (var i = 0; i < plugins.length; i++) {
          verbose.newline("Loading " + plugins[i].name + " v." + plugins[i].version);
          plugins[i].run();
          verbose.newline(plugins[i].name + " loaded");
        }
      }
    });

  }, 100);

  //hide loading screen
  if (!crashed) $("#loading-screen2").fadeOut();
});