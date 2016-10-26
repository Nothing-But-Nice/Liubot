//External Dependencies
var Discord = require('discord.io');
var Converter = require("csvtojson").Converter;
var converter = new Converter({});
var _FUSE = require('fuse.js');
var fuse;

//Configurable Paramaters
var BOT_TOKEN = require('./BOT-TOKEN.json');
var BOT_ACTIVATION_STRING = '!lucy';
var FUSE_OPTIONS = {
    caseSensitive: false,
    shouldSort: true,
    threshold: 0.2,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    keys: [
        "name"
    ]
};

var ITEM_LIST = [];

converter.fromFile("./itemlist.txt",function(err,result){
    console.log("Converting csv to json...");
    if(err) {
        console.log(err);
        process.exit(-1);
    } else {
        ITEM_LIST = result;
        console.log("I've loaded the file and it has: " + ITEM_LIST.length + " items.");
        fuse = new _FUSE(ITEM_LIST, FUSE_OPTIONS);
    }
});

var bot = new Discord.Client({
    token: BOT_TOKEN.token,
    autorun: true
});

bot.on('ready', function() {
    console.log(bot.username + " has begun operation.");
    console.log("To share this bot please use the following URL: \n==========\nhttps://discordapp.com/oauth2/authorize?&client_id=" + bot.id + "&scope=bot&permissions=0\n==========");
});

bot.on('message', function(user, userID, channelID, message, event) {

    var bot_string_regex = new RegExp(BOT_ACTIVATION_STRING, 'i');
    if (bot_string_regex.test(message)) {
        var item_lookup_string = message.replace(BOT_ACTIVATION_STRING, "");
        console.log(item_lookup_string);
        var found_items = fuse.search(item_lookup_string);
        var reply_message = "I was unable to find what you were looking for, please try again. ";
        if(found_items.length) {
            reply_message = "I found " + found_items.length + " items that match.  Displaying top results:";
            var top_results_count = found_items.length > 3 ? 3 : found_items.length;
            for(var x = 0; x < top_results_count; x++) {
                reply_message += "\n" + found_items[x].name + " : " + found_items[x].lucylink;
            }
        }
        bot.sendMessage({
            to: channelID,
            message: reply_message
        });
    }
});

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
