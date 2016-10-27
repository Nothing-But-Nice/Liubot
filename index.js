//External Dependencies
var request = require('request');
var cheerio = require('cheerio');
var Discord = require('discord.io');
var Converter = require("csvtojson").Converter;
var converter = new Converter({});
var _FUSE = require('fuse.js');
var fuse;

//Configurable Paramaters
var BOT_TOKEN = require('./BOT-TOKEN.json');
var LUCY_ITEM_URL = "http://lucy.allakhazam.com/item.html?id=";
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
    console.log("To share this bot please use the following URL: \n" +
        "==========\n" +
        "https://discordapp.com/oauth2/authorize?&client_id=" + bot.id + "&scope=bot&permissions=0\n" +
        "==========");
});

bot.on('message', function(user, userID, channelID, message, event) {

    var bot_string_regex = new RegExp(BOT_ACTIVATION_STRING, 'i');
    if (bot_string_regex.test(message)) {
        var item_lookup_string = message.replace(BOT_ACTIVATION_STRING, "");
        var item_info_message;
        console.log(item_lookup_string);
        var found_items = fuse.search(item_lookup_string);
        var reply_message = "I was unable to find what you were looking for, please try again. ";
        if(found_items.length) {
            reply_message = "I found " + found_items.length + " items that match.  Displaying top results:";
            var top_results_count = found_items.length > 3 ? 3 : found_items.length;
            for(var x = 0; x < top_results_count; x++) {
                reply_message += "\n" + found_items[x].name + " : " + found_items[x].lucylink;
            }
            // item_info_message = "Here is information for " + 
            //     found_items[0].name + 
            //     "\n" + getDataFromLucy(found_items[0].id);
        }
        bot.sendMessage({
            to: channelID,
            message: reply_message + item_info_message
        });
    }
});

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function getDataFromLucy(id) {
    var options = {
        url: LUCY_ITEM_URL + id,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36',
            "Accept" : "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Encoding":"gzip, deflate, sdch",
            "Accept-Language":"en-US,en;q=0.8",
            "Cache-Control":"max-age=0",
            "Connection":"keep-alive",
            "Cookie":"",
            "DNT":1,
            "Host":"lucy.allakhazam.com",
            "Referer": LUCY_ITEM_URL + id,
            "Upgrade-Insecure-Requests":1
        }
    };
    request(options, function(error, response, html){
        if(!error){
            var $ = cheerio.load(html);
            return $('.shotdata').text();
        }
    });
    return;
}
