const electron = require('electron');
var {app, BrowserWindow, ipcMain} = electron;

const path = require('path');
const url = require('url');

let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800, 
    height: 600,
    minWidth: 800,
    minHeight: 600,
    frame: false, 
    icon: __dirname + '/res/kit.png',
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});

//REQUIRE LIBRARIES
const Discord = require("discord.js");
const client = new Discord.Client();

const fs = require('fs');
const ytdl = require('ytdl-core');
//VARIABLES
var isOut = false;
//RENDERER INTERACTION
ipcMain.on('login', (event, arg) => { 
  client.login(arg).then(function() {
    //check for dupe bug
    var guilds = [], people = [], bots = [];
    for (var i = 0; i < client.guilds.size; i++) {
      var channelList = client.guilds.map(g => g.channels)[i];
      var voice = [], text = [];
      for (var j = 0; j < channelList.size; j++) {
        if (channelList.map(g => g.type)[j]=="text") text.push({
          name: channelList.map(g => g.name)[j],
          id: channelList.map(g => g.id)[j]
        });
        else if (channelList.map(g => g.type)[j]=="voice") voice.push({
          name: channelList.map(g => g.name)[j],
          id: channelList.map(g => g.id)[j]
        });
      }
      guilds.push({
        name: client.guilds.map(g => g.name)[i],
        id: client.guilds.map(g => g.id)[i],
        channels: { text: text, voice: voice }
      });
    }
    for (var i = 0; i < client.users.size; i++) {
      if (client.users.map(g => g.bot)[i]) bots.push({
        name: client.users.map(g => g.username)[i],
        id: client.users.map(g => g.id)[i],
        disc: client.users.map(g => g.discriminator)[i]
      });
      else people.push({
        name: client.users.map(g => g.username)[i],
        id: client.users.map(g => g.id)[i],
        disc: client.users.map(g => g.discriminator)[i]
      });
    }

    isOut = false;

    mainWindow.webContents.send('loggedIn', {
      user: client.user,
      stats : {
        users : client.users.size,
        channels: client.channels.size,
        guilds: client.guilds.size
      },
      guilds: guilds,
      users: {
        people: people,
        bots: bots
      }
    });
  }, function(err) {
    mainWindow.webContents.send('err', err.message);
    //client.destroy();
  });
});
ipcMain.on('send-msg', (event, arg) => {
  if (arg.type=="0") {
    client.guilds.get(arg.server).channels.get(arg.channel).send(arg.content).then(function() {
      mainWindow.webContents.send('success', "message_sent");
    }, function(err) {
      mainWindow.webContents.send('err', err);
    });
  }
  else{
    client.users.get(arg.id).send(arg.content).then(function() {
      mainWindow.webContents.send('success', "message_sent");
      mainWindow.webContents.send('dm-feed', {
        author: client.user,
        recipient: arg.id,
        content : arg.content
      });
    }, function(err) {
      mainWindow.webContents.send('err', err);
    });
  }
});
ipcMain.on('get-invites', (event, arg) => {
  if (arg.guild) {
    client.guilds.get(arg.guild).fetchInvites()
    .then(invites => {
      if (invites.size==0) mainWindow.webContents.send('receive-invites', []);
      else{
        var tempData = [];
        for (var i = 0; i < invites.size; i++) {
          tempData.push({
            url: "http://discord.gg/" + invites.map(g => g.code)[i],
            code: invites.map(g => g.code)[i],
            channel: invites.map(g => g.channel)[i].name,
            madeBy: invites.map(g => g.inviter)[i].username + "#" + invites.map(g => g.inviter)[i].discriminator
          });
        }
        mainWindow.webContents.send('receive-invites', tempData);
      }
    })
    .catch(err => {
      //mainWindow.webContents.send('err', err);
      mainWindow.webContents.send('receive-invites', []);
    });
  }
});

ipcMain.on('create-invite', (event, arg) => {
  if (arg.guild && arg.channel) {
    client.guilds.get(arg.guild).channels.get(arg.channel).createInvite().then(invite =>{
      mainWindow.webContents.send('success', "invite_created");
      client.guilds.get(arg.guild).fetchInvites()
      .then(invites => {
        if (invites.size==0) {
          console.log(invite);
          if (invite) {
            tempData.push({
              url: "http://discord.gg/" + invite.code,
              code: invite.code,
              channel: invite.name,
              madeBy: invites.inviter.username + "#" + invites.inviter.discriminator
            });
            mainWindow.webContents.send('receive-invites', []);
          }
        }
        else{
          var tempData = [];
          for (var i = 0; i < invites.size; i++) {
            tempData.push({
              url: "http://discord.gg/" + invites.map(g => g.code)[i],
              code: invites.map(g => g.code)[i],
              channel: invites.map(g => g.channel)[i].name,
              madeBy: invites.map(g => g.inviter)[i].username + "#" + invites.map(g => g.inviter)[i].discriminator
            });
          }
          mainWindow.webContents.send('receive-invites', tempData);
        }
      })
      .catch(err => {
        mainWindow.webContents.send('err', err.message);
        mainWindow.webContents.send('receive-invites', []);
      });
    }).catch(err => {
      mainWindow.webContents.send('err', err.message);
      mainWindow.webContents.send('receive-invites', []);
    });
  }
});

ipcMain.on('validate-dm', (event, arg) => {
  //console.log("got dm data request");
  if (client.users.get(arg).dmChannel!=undefined) mainWindow.webContents.send('dm-data', true);
  else mainWindow.webContents.send('dm-data', false);
});

ipcMain.on('start-typing', (event, arg) => {
  if (arg.type=="0") {
    client.guilds.get(arg.server).channels.get(arg.channel).startTyping();
  }
  else{
    client.users.get(arg.id).dmChannel.startTyping();
  }
});
ipcMain.on('stop-typing', (event, arg) => {
  if (arg.type=="0") {
    client.guilds.get(arg.server).channels.get(arg.channel).stopTyping(true);
  }
  else{
    client.users.get(arg.id).dmChannel.stopTyping();
  }
  //console.log(arg);
});


ipcMain.on('get-nick', (event, arg) => {
  mainWindow.webContents.send('take-nick', client.guilds.get(arg).members.get(client.user.id).nickname);
});
ipcMain.on('get-members', (event, arg) => {
  //console.log(arg);
  //kick act 0, ban act 1
  var guildMembers = [];

  for (var i = 0; i < client.guilds.get(arg.guild).members.size; i++) {
    if (arg.act=="0") {
      if (client.guilds.get(arg.guild).members.map(g => g.kickable)[i]) {
        guildMembers.push({
          id: client.guilds.get(arg.guild).members.map(g => g.user.id)[i],
          disc: client.guilds.get(arg.guild).members.map(g => g.user.discriminator)[i],
          name: client.guilds.get(arg.guild).members.map(g => g.user.username)[i]
        });
      }
    }
    else if (arg.act=="1") {
      if (client.guilds.get(arg.guild).members.map(g => g.bannable)[i]) {
        guildMembers.push({
          id: client.guilds.get(arg.guild).members.map(g => g.user.id)[i],
          disc: client.guilds.get(arg.guild).members.map(g => g.user.discriminator)[i],
          name: client.guilds.get(arg.guild).members.map(g => g.user.username)[i]
        });
      }
    }
  }
  mainWindow.webContents.send('take-members', guildMembers);
});
ipcMain.on('get-roles', (event, arg) => {
  var guildRoles = [];

  for (var i = 0; i < client.guilds.get(arg.guild).roles.size; i++) {
    guildRoles.push({
      name: client.guilds.get(arg.guild).roles.map(g => g.name)[i],
      id: client.guilds.get(arg.guild).roles.map(g => g.id)[i]
    });
  }

  mainWindow.webContents.send('take-roles', guildRoles);
});
ipcMain.on('set-nick', (event, arg) => { 
  client.guilds.get(arg.guild).members.get(client.user.id).setNickname(arg.nick)
    .then(function(value) { 
      mainWindow.webContents.send('success', "nickname_set");
      mainWindow.webContents.send('take-nick', client.guilds.get(arg.guild).members.get(client.user.id).nickname);
    })
    .catch(function(err) { mainWindow.webContents.send('err', err.message); });
});
ipcMain.on('act-user', (event, arg) => { 
  if (arg.act=="0") {
    client.guilds.get(arg.guild).members.get(arg.user).kick(arg.reason).then(() => {
      mainWindow.webContents.send('success', "member_kicked");
      sendGuilds();
    })
    .catch(function(err) { mainWindow.webContents.send('err', err.message); });
  }
  else if (arg.act=="1") {
    var banDays = 0;
    if (arg.days!="") banDays = Number(arg.days);
    client.guilds.get(arg.guild).members.get(arg.user).ban({
      reason: arg.reason,
      days: banDays
    }).then(() => {
      mainWindow.webContents.send('success', "member_banned");
      sendGuilds();
    })
    .catch(function(err) { mainWindow.webContents.send('err', err.message); });
  }
});
ipcMain.on('add-role', (event, arg) => { 
  client.guilds.get(arg.guild).members.get(arg.user).addRole(arg.role).then(() => {
    mainWindow.webContents.send('success', "member_role_added");
  })
  .catch(function(err) { mainWindow.webContents.send('err', err.message); });
});
ipcMain.on('remove-role', (event, arg) => { 
  client.guilds.get(arg.guild).members.get(arg.user).removeRole(arg.role).then(() => {
    mainWindow.webContents.send('success', "member_role_removed");
  })
  .catch(function(err) { mainWindow.webContents.send('err', err.message); });
});

ipcMain.on('set-profile', (event, arg) => { 
  if (arg.username!="") {
    client.user.setUsername(arg.username)
    .then(function(value) { 
      mainWindow.webContents.send('success', "username_set");
      mainWindow.webContents.send('data-update', client.user);
    })
    .catch(function(err) { mainWindow.webContents.send('err', err.message) });
  }
  if (arg.image!="") {
    client.user.setAvatar(arg.image)
    .then(function(value) { 
      mainWindow.webContents.send('success', "profile_image_set");
      mainWindow.webContents.send('data-update', client.user);
    })
    .catch(function(err) { mainWindow.webContents.send('err', err.message)});
  }
});
ipcMain.on('get-ping', (event) => { 
  mainWindow.webContents.send('new-ping', client.ping);
});
ipcMain.on('logout', (event, arg) => { 
  client.destroy().then(function() {
    if (arg=="quit"){ app.quit(); isOut = true; }
    else if (arg=="reload") { mainWindow.webContents.send('reload'); isOut = true; }
  }); 
});
ipcMain.on('set-presence', (event, arg) => {
  client.user.setPresence({ 
    game: { name: arg.game }, 
    status: arg.status }
  ).then(function() {
    mainWindow.webContents.send('success', "presence_set");
  }, function(err) {
    mainWindow.webContents.send('err', err);
  });
});

//EXPERIMENTAL
ipcMain.on('get-dm-messages', (event, arg) => {
  if (client.users.get(arg.user).lastMessage!=null) {
    client.users.get(arg.user).lastMessage.channel.fetchMessages({ limit: 10 }).then(messages => {
      //console.log(messages);
      var parsedMessages = [];

      for (var i = 0; i < messages.size; i++) {
        parsedMessages.push({
          author: messages.map(g => g.author)[i],
          content: messages.map(g => g.content)[i]
        });
      }

      parsedMessages.reverse();

      mainWindow.webContents.send('return-dm-messages', parsedMessages);
    })
    .catch(console.error);
  }
  else{
    mainWindow.webContents.send('return-dm-messages', []);
  }
});

ipcMain.on('join-vc', (event, arg) => {
  var vc = client.channels.get(arg.channel);
  vc.join()
  .then(connection => {
    mainWindow.webContents.send('success', "channel_joined");
    mainWindow.webContents.send('in-vc', {
      guild : vc.guild.name,
      channel : vc.name
    });

    var paused = false;
    var dispatcher;

    ipcMain.on('clear-dispatcher', (event, arg) => { 
      paused = false;
      if (dispatcher) dispatcher.end();
      dispatcher = undefined;
    });

    ipcMain.on('play-disp', (event, arg) => { 
      mainWindow.webContents.send('loading', "playing_audio_file");

      if (!paused) {
        if (arg.type=="file") dispatcher = connection.playFile(arg.source, { volume: arg.volume });
        else if (arg.type=="yt") {
          const stream = ytdl(arg.source, { filter : 'audioonly' });
          dispatcher = connection.playStream(stream, { seek: 0, volume: arg.volume });
        }

        dispatcher.on('end', (e) => {
          console.log(e);
          mainWindow.webContents.send('success', "playback_complete");
        });

        ipcMain.on('set-vol', (event, arg) => { 
          if (dispatcher) dispatcher.setVolume(arg.volume);
        });

        ipcMain.on('pause-disp', (events) => { 
          mainWindow.webContents.send('success', "pausing_audio_file");
          dispatcher.pause();
          paused = true;
        });

        ipcMain.on('stop-disp', (events) => { 
          mainWindow.webContents.send('success', "stopping_audio_file");
          dispatcher.end(); 
        });
      }
      else{
        dispatcher.resume();
        paused = false;
      }

    });

  })
  .catch(console.error);
});

ipcMain.on('leave-vc', (event, arg) => {
  var vc = client.channels.get(arg.channel);
  vc.leave();
  mainWindow.webContents.send('success', "channel_left");
    mainWindow.webContents.send('out-vc');
});

//CONNECTION ERROR HANDLING

/*
process.on('uncaughtException', function(err) {
  mainWindow.webContents.send('err', err);
});
*/

//EVENTS

/*
client.on("guildCreate", (guild) => {
  mainWindow.webContents.send('newEvent', client.user.username + " was invited to and joined " + guild.name);
});
client.on("guildMemberAdd", (guild, member) => {
  mainWindow.webContents.send('newEvent', member.user.username + " joined " + guild.name);
});*/

function sendGuilds(){ 
  var guilds = [], people = [], bots = [];
  for (var i = 0; i < client.guilds.size; i++) {
    var channelList = client.guilds.map(g => g.channels)[i];
    var voice = [], text = [];
    for (var j = 0; j < channelList.size; j++) {
      if (channelList.map(g => g.type)[j]=="text") text.push({
        name: channelList.map(g => g.name)[j],
        id: channelList.map(g => g.id)[j]
      });
      else if (channelList.map(g => g.type)[j]=="voice") voice.push({
        name: channelList.map(g => g.name)[j],
        id: channelList.map(g => g.id)[j]
      });
    }
    guilds.push({
      name: client.guilds.map(g => g.name)[i],
      id: client.guilds.map(g => g.id)[i],
      channels: { text: text, voice: voice }
    });
  }
  for (var i = 0; i < client.users.size; i++) {
    if (client.users.map(g => g.bot)[i]) bots.push({
      name: client.users.map(g => g.username)[i],
      id: client.users.map(g => g.id)[i],
      disc: client.users.map(g => g.discriminator)[i]
    });
    else people.push({
      name: client.users.map(g => g.username)[i],
      id: client.users.map(g => g.id)[i],
      disc: client.users.map(g => g.discriminator)[i]
    });
  }

  mainWindow.webContents.send('updateServers', {
    user: client.user,
    stats : {
      users : client.users.size,
      channels: client.channels.size,
      guilds: client.guilds.size
    },
    guilds: guilds,
    users: {
      people: people,
      bots: bots
    }
  });
}

client.on("guildCreate", guild => {
  mainWindow.webContents.send('newEvent', `New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  sendGuilds();
});

client.on("guildDelete", guild => {
  mainWindow.webContents.send('newEvent', `Bot was removed from: ${guild.name} (id: ${guild.id})`);
  sendGuilds();
});

client.on('guildMemberAdd', member => {
  mainWindow.webContents.send('newEvent', `New user has joined ${member.guild.name}`);
  sendGuilds();
});

client.on('guildMemberRemove', member => {
  mainWindow.webContents.send('newEvent', `A user has left ${member.guild.name}`);
  sendGuilds();
});

client.on('disconnect', function () { if(!isOut) mainWindow.webContents.send('loggedOut'); });
client.on('message', function (message) { 
  if (message.guild === null) {
    mainWindow.webContents.send('dm-feed', {
      author: message.author,
      content : message.content
    });
  }
});