//External Dependencies
const request = require('request');
const cheerio = require('cheerio');
const Discord = require('discord.js');
const Converter = require("csvtojson").Converter;
const converter = new Converter({});
const _FUSE = require('fuse.js');
let fuse;

//Configurable Paramaters
// const BOT_TOKEN = process.env.BOT_TOKEN;
const BOT_TOKEN = 'MjQwNTQyNTY4MTMwMTUwNDAz.DhQXIA.06i9iiL_UbsqWieEqMBrEcapg6c';
const LUCY_ITEM_URL = "http://lucy.allakhazam.com/item.html?id=";
const BOT_ACTIVATION_STRING = '!lucy';
const FUSE_OPTIONS = {
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

let ITEM_LIST = [];

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

const bot = new Discord.Client();

bot.on('disconnect', (errMsg, code) => {
    console.error("ERROR WHEN TRYING TO CONNECT!!!");
    console.error(errMsg, code);
});

bot.on('ready', () => {
    console.log(bot.username + " has begun operation.");
    console.log("To share this bot please use the following URL: \n" +
        "==========\n" +
        "https://discordapp.com/oauth2/authorize?&client_id=" + bot.user.id + "&scope=bot&permissions=0\n" +
        "==========");
});

bot.on('message', (message) => {

    let messageContent = message.content;
    var bot_string_regex = new RegExp(BOT_ACTIVATION_STRING, 'gi');
    if (bot_string_regex.test(messageContent)) {
        var item_lookup_string = messageContent.replace(BOT_ACTIVATION_STRING, "");
        console.log("Searching for: ", item_lookup_string);
        var found_items = fuse.search(item_lookup_string);
        var reply_message = "I was unable to find what you were looking for, please try again. ";
        if(found_items.length) {
            reply_message = "I found " + found_items.length + " items that match.  Displaying top results:";
            var top_results_count = found_items.length > 3 ? 3 : found_items.length;
            for(var x = 0; x < top_results_count; x++) {
                reply_message += "\n" + found_items[x].name + " : " + found_items[x].lucylink;
            }
            getDataFromLucyAndSendToChannel(found_items[0].id, found_items[0].name, message.channel);
        }
        message.channel.send(reply_message);
    }
});

function getDataFromLucyAndSendToChannel(itemId, itemName, channel) {
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
            channel.send(formatted_message);
        } else {
            console.log("ERROR: " + error);
            channel.send(error);
        }
    });
}

bot.login(BOT_TOKEN);


//HEROKU SPECIFIC - KEEPS APP FROM DIEING DUE TO PORT NOT BEING BOUND

const express = require('express');
const web_app = express();

web_app.get('/', function(req, res) {
    res.send('\n 👋 🌍 \n');
});

web_app.listen(process.env.PORT || 5000, function(err) {
    if (err) {
        throw err;
    }
    console.log("\n🚀  Liubot LIVES on PORT " + (process.env.PORT || 5000));
});

//END HEROKU SPECIFIC
