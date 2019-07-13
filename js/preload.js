window.onerror = function(error, url, line) {
    $(".tip-box").append(error + ' on line ' + line + '\n' + url + '\n');
    crashed = true;
};

var aSettings = require("../data/app-settings.json");
dict = require('../locale/' + aSettings.language + '.json');