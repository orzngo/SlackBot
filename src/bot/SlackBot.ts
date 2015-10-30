///<reference path="../../typings/node/node.d.ts" />

import IConfig = require('../config/IConfig');
import ICommand = require("./command/ICommand");
import IRemarkMessage = require("./message/IRemarkMessage");
import ICommandMessage = require("./message/ICommandMessage");
import BotSayClient = require("./client/say/BotSayClient");
import EchoCommand = require("./command/echo/Echo");
import TimeSpeakerCommand = require("./command/timespeaker/TimeSpeaker");
import OmikujiCommand = require("./command/omikuji/Omikuji");
import OtenkiCommand = require("./command/otenki/Otenki");
import fs = require("fs");

var Slack = require('slack-node');
var SlackClient = require('node-slackbot');

class SlackBot {
  private _slackAPI:any;
  private _slackClient:any;
  private _id:string;
  private _name:string;
  private _homeChannelId:string;

  private _sayClient:BotSayClient;

  private _commands:{[key:string]: ICommand};

  // このフラグがfalseのときは、何も喋らなくなります。
  private _active:boolean = true;

  constructor(private _config:IConfig) {
    this._slackAPI = new Slack(this._config.apiToken);

    //TODO:機能足りなくなったらコイツforkする
    this._slackClient = new SlackClient(this._config.apiToken);
    this._slackClient.use((message:IRemarkMessage, cb:Function) => {
      this._messageHandler(message);
      cb();
    });

    this._slackClient.connect();

    this._commands = {};

    this._commands["commands"] = this._helpCommand();
    this._commands["die"] = this._dieCommand();
    this._commands["resurrect"] = this._resurrectCommand();
    this._slackAPI.api('auth.test',{}, (error:any, resp:any) => {
      if (error) {
        console.log("Auth.test error!!");
        return
      }

      this._name = resp.user;
      this._id = resp.user_id;

      this._sayClient = new BotSayClient(this);


      this._loadCommand();
      this._initializedMessage();
    });
  }

  private _loadCommand(): void {
    var modules:ICommand[] = [];
    modules.push(new EchoCommand(this._sayClient));
    modules.push(new TimeSpeakerCommand(this._sayClient));
    modules.push(new OmikujiCommand(this._sayClient));
    modules.push(new OtenkiCommand(this._sayClient));

    for (var key in modules) {
      var mod = modules[key];
      var command = mod.name;
      this._commands[command] = mod;
    }
  }


  // 初期化された事を伝える
  private _initializedMessage():void {
    //this.say("I am " + this._name + ":" + this._id + ". I'm ready.");
  }


  public say(message:string, channel:string = this._config.home): void {
    if (!this._active)
      return;
    this._slackAPI.api('chat.postMessage', {text:message, channel:channel, as_user:true});
  }

  public debug(message:string, channel:string = this._config.debug): void {
    this._slackAPI.api('chat.postMessage', {text:message, channel:channel, as_user:true});
  }

  get commands():string[] {
    var result:string[] = [];
    for (var key in this._commands) {
      result.push(key);
    }

    return result;
  }

  private _messageHandler(message:IRemarkMessage): void {
    if (message.type !== "message") {
      return;
    }

    /*
    // 自分自身の発言はスルーする
    if (message.user === this._id) {
      this._homeChannelId = message.channel;
      return
    }
    */


    var commandMessage = this._parseMessage(message);
    if (!commandMessage) {
      return;
    }

    if (!this._active && commandMessage.command !== "resurrect") {
      this.debug("Doverbotは無効状態です。復活させるにはresurrect", commandMessage.channel);
      return;
    }

    console.log(commandMessage);
    if (!this._commands[commandMessage.command]) {
      this.say(commandMessage.command + " : Unknown Command. \n使えるコマンド一覧を見るにはcommandsと入力してください", commandMessage.channel);
      return;
    }

    if (commandMessage.options[0] === "?") {
      this.say(this._commands[commandMessage.command].usage, commandMessage.channel);
    } else {
      this._commands[commandMessage.command].exec(commandMessage);
    }
  }

  private _parseMessage(message:IRemarkMessage): ICommandMessage {
    var result:ICommandMessage = {
      command:null,
      options:null,
      message:null,
      user:null,
      channel:null
    }
    var text = message.text;
    // textが無ければスルー
    if (!text) {
      return;
    }

    result.channel = message.channel;

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

  private _helpCommand():ICommand {
    return {
      name: "commands",
      description: "登録済みのコマンド一覧を表示します",
      usage: "@botname commands",
      exec: (message:ICommandMessage) => {
        var result:string[] = [];
        result.push("コマンド名に続けて.?と入力すると、そのコマンドの使い方を出力します。例：commands.?\n");

        for (var key in this._commands) {
          result.push(key + " : " + this._commands[key].description);
        }

        this.say(result.join("\n"), message.channel);

      } 
    }
  }

  private _dieCommand():ICommand {
    return {
      name: "die",
      description: "死んで何も喋らなくなります。起こすときはresurrect",
      usage: "@botname die[.hard]",
      exec: (commandMessage: ICommandMessage) => {
        if (commandMessage.options[0] === "hard"){
          this.say("ホォォリィィィィィィィィ！！！", commandMessage.channel);
        } else {
          this.say("I'll be back.", commandMessage.channel);
        }

        this._active = false;
      } 
    }
  }

  private _resurrectCommand():ICommand {
    return {
      name: "resurrect",
      description: "喋らなくなったBotを元通りにします。",
      usage: "@botname ressurect",
      exec: (commandMessage: ICommandMessage) => {
        this._active = true;
        this.say("復活!!");
      } 
    }
  }

    

}

export=SlackBot;
