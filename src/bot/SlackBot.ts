///<reference path="../../typings/node/node.d.ts" />

import IConfig = require('../config/IConfig');
import IModule = require("./module/IModule");
import IRTMMessage = require("./message/IRTMMessage");
import ICommandMessage = require("./message/ICommandMessage");

import EchoModule = require("./module/echo/EchoModule");
import TimeSpeakerModule = require("./module/timespeaker/TimeSpeakerModule");

var Slack = require('slack-node');
var SlackClient = require('node-slackbot');



class SlackBot {
  private _slackAPI:any;
  private _slackClient:any;
  private _id:string;
  private _name:string;
  private _homeChannelId:string;

  private _modules:IModule[];
  private _commands:{[key:string]: IModule};

  constructor(private _config:IConfig) {
    this._slackAPI = new Slack(this._config.apiToken);

    //TODO:機能足りなくなったらコイツforkする
    this._slackClient = new SlackClient(this._config.apiToken);
    this._slackClient.use((message:IRTMMessage, cb:Function) => {
      this._messageHandler(message);
      cb();
    });
    this._slackClient.connect();

    this._commands = {};

    /*
    this._commands["commands"] =  (message:string) => {
      this.say(this.commands.toString());
    };
    */
    this._slackAPI.api('auth.test',{}, (error:any, resp:any) => {
      if (error) {
        console.log("Auth.test error!!");
        return
      }

      this._name = resp.user;
      this._id = resp.user_id;
      this._loadModule();
      this._initializedMessage();
    });
  }

  private _loadModule(): void {
    this._modules = [];
    this._modules.push(new EchoModule(this));
    this._modules.push(new TimeSpeakerModule(this));

    for (var key in this._modules) {
      var mod = this._modules[key];
      var command = mod.name;
      this._commands[command] = mod;
    }
  }


  // 初期化された事を伝える
  private _initializedMessage():void {
    this.say("I am " + this._name + ":" + this._id + ". I'm ready.");
  }

  public say(message:string, channel:string = this._config.home): void {
    this._slackAPI.api('chat.postMessage', {text:message, channel:channel, as_user:true});
  }

  get commands():string[] {
    var result:string[] = [];
    for (var key in this._commands) {
      result.push(key);
    }

    return result;


  }

  private _messageHandler(message:IRTMMessage): void {
    if (message.type !== "message") {
      return;
    }

    // 自分自身の発言はスルーする
    if (message.user === this._id) {
      this._homeChannelId = message.channel;
      return
    }

    var commandMessage = this._parseMessage(message);
    if (!commandMessage) {
      return;
    }

    console.log(commandMessage);
    if (!this._commands[commandMessage.command]) {
      this.say(commandMessage.command + " : Unknown Command.");
      return;
    }

    this._commands[commandMessage.command].exec(commandMessage);
  }

  private _parseMessage(message:IRTMMessage): ICommandMessage {
    var result:ICommandMessage = {
      command:null,
      options:null,
      message:null,
      user:null
    }
    var text = message.text;
    // textが無ければスルー
    if (!text) {
      return;
    }

    var splitted = text.split(' ');

    // 書式がコマンドではない
    if (splitted.length < 2) {
      return;
    }

    // 自分宛のメンションでなければスルー
    if (splitted[0].indexOf("@" + this._id) < 0) {
      return;
    }

    //.で繋げられた文字列の先頭をコマンド、残りをオプションと見なす
    var commands = splitted[1].split(".");

    result.command = commands[0];
    result.options = commands.slice(1);

    //残りの文字列はメッセージと見なし、全て連結して入れる
    var messages = splitted.slice(2);
    result.message = messages.join(" ");

    result.user = message.user;
    return result;
  }

  private _helpModule():IModule {
    return {
      name: "commands",
      description: "登録済みのコマンド一覧を表示します",
      usage: "@botname commands",
      exec: (ICommandMessage) => {
        var result:string[] = [];

        for (var key in this._commands) {
          result.push(key);
        }

        this.say(result.join(","));

      } 
    }
  }

}

export=SlackBot;
