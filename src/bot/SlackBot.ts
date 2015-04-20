///<reference path="../../typings/node/node.d.ts" />

import IConfig = require('../config/IConfig');
import IModule = require("./module/IModule");

import EchoModule = require("./module/echo/EchoModule");
import TimeSpeakerModule = require("./module/timespeaker/TimeSpeakerModule");

var Slack = require('slack-node');



class SlackBot {
  private _slackAPI:any;
  private _id:string;
  private _name:string;

  private _modules:IModule[];
  private _commands:{[key:string]: Function};

  constructor(private _config:IConfig) {
    this._slackAPI = new Slack(this._config.apiToken);

    this._commands = {};

    this._commands["commands"] =  (message:string) => {
      this.say(this.commands.toString());
    };
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
      this._commands[command] = mod.exec;
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
}

export=SlackBot;
