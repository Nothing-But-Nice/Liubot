//External Dependencies
var Discord = require('discord.io');
var Converter = require("csvtojson").Converter;
var converter = new Converter({});

//Configurable Paramaters
var BOT_TOKEN = require('./BOT-TOKEN.json');
var BOT_ACTIVATION_STRING = '!lucy';

var ITEM_LIST = [];

converter.fromFile("./itemlist.txt",function(err,result){
    console.log("Converting csv to json...");
    if(err) {
        console.log(err);
        process.exit(-1);
    } else {
        ITEM_LIST = result;
        console.log("I've loaded the file and it has: " + ITEM_LIST.length + " items.");
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
        var item_lookup_string = message.replace(BOT_ACTIVATION_STRING + " ", "");
        var found_item = {};
        var reply_message = "I am broken.";
        if(found_item) {
            reply_message = found_item.lucylink;
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
