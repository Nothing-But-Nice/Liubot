var Discord = require('discord.io');
var BOT_TOKEN = require('./BOT-TOKEN.json');
var ITEM_LIST = require('./itemlist.json');
var bot = new Discord.Client({
    token: BOT_TOKEN.token,
    autorun: true
});
var bot_activation_string = '!lucy';
var ITEM_LIST_KEYS = Object.keys(ITEM_LIST);

bot.on('ready', function() {
    console.log(bot.username + " - (" + bot.id + ")");
    console.log("I've loaded the file and it has: " + ITEM_LIST_KEYS.length + " items.");
});

bot.on('message', function(user, userID, channelID, message, event) {

    var bot_string_regex = new RegExp(bot_activation_string, 'i');
    if (bot_string_regex.test(message)) {
        var item_lookup_string = message.replace(bot_activation_string + " ", "");
        var found_item = ITEM_LIST[item_lookup_string];
        // console.log(found_item);
        var reply_message = "I can't seem to find '" + item_lookup_string + "', perhaps you wanted '" + ITEM_LIST_KEYS[getRandomIntInclusive(0, ITEM_LIST_KEYS.length-1)] + "' instead?";
        if(found_item) {
            reply_message = "Is this what you are looking for? " + found_item.url;
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
