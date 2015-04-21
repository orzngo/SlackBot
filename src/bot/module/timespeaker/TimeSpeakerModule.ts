///<reference path="../../../../typings/node/node.d.ts" />

import IModule = require("../IModule");
import SlackBot = require("../../SlackBot");
import ICommandMessage = require("../../message/ICommandMessage");
import Job = require("./Job");

import fs = require("fs");

interface ICronMessage {
  time:string;
  message:string;
}


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
        this._unset(message);
        break;
      default:
        this._bot.say("Unknown Option :" + message.options[0]);
    }
  }


  private _start(message:ICommandMessage): void {
    var targetId:number = Number(message.options[1]);

    // 本体のステータス変更
    if (isNaN(targetId)) {
      this._startSelf();
      return;
    }

    this._startJob(targetId);

  }

  private _startJob(id:number): void {
    if (!this._jobList[id]) {
      this._bot.say("Unknown job id : " + id);
      return;
    }
    this._jobList[id].start();
    this._bot.say("job id : " + id + " started.");
  }

  private _startSelf(): void {
    if (!this._running) {
      this._running = true;
      this._bot.say("Started.");
      return;
    }
    this._bot.say("Already started.");
  }



  private _stop(message:ICommandMessage): void {
    var targetId:number = Number(message.options[1]);

    // 本体のステータス変更
    if (isNaN(targetId)) {
      this._stopSelf();
      return;
    }

    this._stopJob(targetId);
  }

  private _stopJob(id:number): void {
    if (!this._jobList[id]) {
      this._bot.say("Unknown job id : " + id);
      return;
    }
    this._jobList[id].stop();
    this._bot.say("job id : " + id + " stopped.");
  }


  private _stopSelf(): void {
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
    var id = Number(message.options[1]);

    var cronMessage = this._parseMessage(message.message);

    if (!cronMessage) {
      this._bot.say("parse failed. : " + message.message);
    }

    var job = new Job(this._bot, cronMessage.time, cronMessage.message);

    if (isNaN(id) || !this._jobList[id]) {
      // 新規ジョブ作成
      this._jobList.push(job);
      this._bot.say("Job created!");
    }else {
      // 既存ジョブの設定変更
      this._jobList[id].set(cronMessage.time, cronMessage.message);
      this._bot.say("Job updated!");
    }
  }


  private _parseMessage(message:string): ICronMessage {
    var messages = message.split(" ");

    if (messages.length < 6) {
      return null;
    }

    var crontime = messages.slice(0,5).join(" ");
    var text = messages.slice(5).join(" ");

    var result:ICronMessage = {
      time: crontime,
      message: text
    }
    return result;


  }

  private _unset(message:ICommandMessage): void {
    var id = Number(message.options[1]);

    if (isNaN(id) || !this._jobList[id]) {
      this._bot.say("Unknown job id : " + id);
      return;
    }

    this._jobList[id].stop();
    delete this._jobList[id];

    this._bot.say("job id : " + id + " deleted.");
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

    return mes;
  }
}

export=TimeSpeakerModule;
