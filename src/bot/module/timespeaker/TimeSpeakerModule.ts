///<reference path="../../../../typings/node/node.d.ts" />

import IModule = require("../IModule");
import SlackBot = require("../../SlackBot");
import ICommandMessage = require("../../message/ICommandMessage");
import Job = require("./Job");

import fs = require("fs");


class TimeSpeakerModule implements IModule {
  private _jobList:Array<Job> = [];
  private _path:string;

  private _running:Boolean = true;

  constructor(private _bot:SlackBot){
    this._path = "./etc/" + this.name;

    // Job保存用パスの確認
    if (!fs.existsSync(this._path)) {
      fs.mkdirSync(this._path);
    }


    //test
    this._jobList.push(new Job(this._bot, "* * * * *", "hogehoge"));
    this._jobList.push(new Job(this._bot, "*/1 * * * *", "hogepiyo"));
    var job = new Job(this._bot, "* * 2 * *", "hogeearaefas");
    job.start();
    this._jobList.push(job);
    this._jobList.push(new Job(this._bot, "* * * * *", "あはん"));

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
        this._set(message);
        break;
      case "list":
        this._list(message);
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

  private _list(message:ICommandMessage): void {
    var result = "";
    for (var key in this._jobList) {
      var job = this._jobList[key];
      if (job.running) {
        result += "o ";
      } else {
        result += "x ";
      }
      result += key + " : " + this._jobList[key].time + " : " + this._jobList[key].text + "\n";
    }
    this._bot.say(result);

  }


  private _set(message:ICommandMessage): void {
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
