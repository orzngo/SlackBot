///<reference path="../../../../typings/node/node.d.ts" />

import IModule = require("../IModule");
import SlackBot = require("../../SlackBot");
import ICommandMessage = require("../../message/ICommandMessage");
import fs = require("fs");

var Cron = require("cron");

class TimeSpeakerModule implements IModule {
  private _jobList:Array<any> = [];
  private _path:string;

  private _running:Boolean = true;

  constructor(private _bot:SlackBot){
    this._path = "./etc/" + this.name;

    // Job保存用パスの確認
    if (!fs.existsSync(this._path)) {
      fs.mkdirSync(this._path);
    }
  }


  public exec(message:ICommandMessage):void {
    switch (message.options[0]) {
      case "start":
        this._start(message);
        break;
      case "stop":
        this._stop(message);
        break;
      case "status":
        this._status(message);
        break;
      case "set":
        break;
      case "list":
        break;
      case "unset":
        break;
      default:
        this._bot.say("Unknown Option :" + message.options[0]);
    }
  }


  private _start(message:ICommandMessage): void {
    if (!this._running) {
      this._running = true;
      this._bot.say("Started.");
      return;
    }
    this._bot.say("Already started.");
  }

  private _stop(message:ICommandMessage): void {
    if (this._running) {
      this._running = false;
      this._bot.say("Stopped.");
      return;
    }
    this._bot.say("Already stopped.");
  }

  private _status(message:ICommandMessage): void {
    this._bot.say("running = " + String(this._running));
  }



  get name():string {
    return "timespeaker";
  }
  get description():string {
    return "cron的に発言する";
  }
  get usage():string {
    var mes ="";
    mes += 'timespeaker.start\n';
    mes += 'timespeaker.stop\n';
    mes += 'timespeaker.status\n';
    mes += 'timespeaker.set * * * * * * message\n';
    mes += 'timespeaker.set.id * * * * * * message\n';
    mes += 'timespeaker.list\n';
    mes += 'timespeaker.unset.id\n';

    return mes
  }
}

export=TimeSpeakerModule;
