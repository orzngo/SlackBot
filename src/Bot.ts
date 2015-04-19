///<reference path="../typings/node/node.d.ts" />
import SlackBot = require("./bot/SlackBot");
import IConfig = require('./config/IConfig');

var Config:IConfig = require("config");


class Bot {
  constructor() {
    var bot:SlackBot = new SlackBot(Config);
  }
}


//export=Bot;

new Bot();
