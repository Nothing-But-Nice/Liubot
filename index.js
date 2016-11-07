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
    // tokenize: true,
    threshold: 0.15,
    location: 0,
    distance: 10,
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

    var bot_string_regex = new RegExp(BOT_ACTIVATION_STRING, 'gi');
    if (bot_string_regex.test(message)) {
        var item_lookup_string = message.replace(BOT_ACTIVATION_STRING, "");
        console.log("Searching for: ", item_lookup_string);
        var found_items = fuse.search(item_lookup_string);
        var reply_message = "I was unable to find what you were looking for, please try again. ";
        if(found_items.length) {
            reply_message = "I found " + found_items.length + " items that match.  Displaying top results:";
            var top_results_count = found_items.length > 3 ? 3 : found_items.length;
            for(var x = 0; x < top_results_count; x++) {
                reply_message += "\n" + found_items[x].name + " : " + found_items[x].lucylink;
            }
            getDataFromLucyAndSendToChannel(found_items[0].id, found_items[0].name, channelID);
        }
        bot.sendMessage({
            to: channelID,
            message: reply_message
        });
    }
});

function getDataFromLucyAndSendToChannel(itemId, itemName, channelID) {
    var options = {
        url: LUCY_ITEM_URL + itemId,
        headers: {
            "Accept" : "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Encoding":"gzip, deflate, sdch",
            "Accept-Language":"en-US,en;q=0.8",
            "Cache-Control":"max-age=0",
            "Connection":"keep-alive",
            "Cookie":"__qca=P0-771874657-1469654866999; __gads=ID=7401942ee4b36263:T=1469726292:S=ALNI_MaAu7MQVA771x8n92DCRlUx1kxhxQ; LucySessionID=67.170.11.131.1476676558548614; _ga=GA1.2.280683370.1469654867; __utmt=1; __utma=187107893.280683370.1469654867.1477525882.1477591816.16; __utmb=187107893.1.10.1477591816; __utmc=187107893; __utmz=187107893.1477519636.13.7.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided)",
            "DNT":1,
            "Host":"lucy.allakhazam.com",
            "Upgrade-Insecure-Requests":1,
            "User-Agent": 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36',
        }
    };
    request(options, function(error, response, html){
        if(!error){
            var $ = cheerio.load(html);
            var parsed_text = $('.shotdata').text();
            var formatted_message = "```markdown\n" + 
                itemName + 
                "\n---\n" +
                parsed_text.trim() +
                "\n```";
            bot.sendMessage({
                to: channelID,
                message: formatted_message
            });
        } else {
            console.log("ERROR: " + error);
            bot.sendMessage({
                to: channelID,
                message: error
            });
        }
    });
}
