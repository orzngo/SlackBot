///<reference path="../../typings/node/node.d.ts" />

import IConfig = require('../config/IConfig');
import IModule = require("./module/IModule");
import IRTMMessage = require("./message/IRTMMessage");
import ICommandMessage = require("./message/ICommandMessage");

import EchoModule = require("./module/echo/EchoModule");
import TimeSpeakerModule = require("./module/timespeaker/TimeSpeakerModule");
import OmikujiModule = require("./module/omikuji/OmikujiModule");
import OtenkiModule = require("./module/otenki/OtenkiModule");
import fs = require("fs");

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

  // このフラグがfalseのときは、何も喋らなくなります。
  private _active:boolean = true;

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

    this._commands["commands"] = this._helpModule();
    this._commands["die"] = this._dieModule();
    this._commands["resurrect"] = this._resurrectModule();
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
    this._modules.push(new OmikujiModule(this));
    this._modules.push(new OtenkiModule(this));

    for (var key in this._modules) {
      var mod = this._modules[key];
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

  private _messageHandler(message:IRTMMessage): void {
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
      this.say(commandMessage.command + " : Unknown Command.", commandMessage.channel);
      return;
    }

    if (commandMessage.options[0] === "?") {
      this.say(this._commands[commandMessage.command].usage, commandMessage.channel);
    } else {
      this._commands[commandMessage.command].exec(commandMessage);
    }
  }

  private _parseMessage(message:IRTMMessage): ICommandMessage {
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

  private _helpModule():IModule {
    return {
      name: "commands",
      description: "登録済みのコマンド一覧を表示します",
      usage: "@botname commands",
      exec: (message:ICommandMessage) => {
        var result:string[] = [];

        for (var key in this._commands) {
          result.push(key + " : " + this._commands[key].description);
        }

        this.say(result.join("\n"), message.channel);

      } 
    }
  }

  private _dieModule():IModule {
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

  private _resurrectModule():IModule {
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

  /**
   * 簡単なテキストデータの書き込み機能
   * 各モジュール毎にディレクトリが切られる
   *
   * @param data {string} 書き込みたいデータ
   * @param dirname {string} 保存したいディレクトリ
   * @param filename {string} 保存したいファイル名
   *
   * @return {boolean} 書き込みに成功したかどうか
   */
  public save(data:string, dirname:string, filename:string = "save.txt"): boolean {
    if (!dirname) {
      dirname = "global";
    }
    try {
      if (!fs.existsSync("./etc/" + dirname)) {
        fs.mkdirSync("./etc/" + dirname);
      }
      fs.writeFileSync("./etc/" + dirname + "/" + filename, data);
    } catch (e) {
      return false;
    }

    return true;

  }
    
  /**
   * 簡単なテキストデータの読み込み機能
   *
   * @param dirname {string} 読み込むディレクトリ
   * @param filename {string} 読み込むファイル名
   *
   * @return {string} 読み込んだ文字列 
   */
  public load(dirname:string, filename:string = "save.txt"): string {
    if (!dirname) {
      dirname = "global";
    }
    try{
      var file = String(fs.readFileSync("./etc/" + dirname + "/" + filename));
    }catch(e) {
      return null;
    }

    return file;
  }

}

export=SlackBot;
