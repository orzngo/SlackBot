///<reference path="../../../../typings/node/node.d.ts" />

import IModule = require("../IModule");
import SlackBot = require("../../SlackBot");
import ICommandMessage = require("../../message/ICommandMessage");
import Job = require("./Job");

import fs = require("fs");

interface ICronMessage {
  id:number;
  running:boolean;
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
    this._load();
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
        this._bot.say(this._list());
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
    this._save();
  }

  private _startSelf(): void {
    if (!this._running) {
      this._running = true;
      this._bot.say("Started.");
      return;
    }
    this._bot.say("Already started.");
  }


  private _set(message:ICommandMessage) {
    var res = this._create(this._parseCommandMessage(message.message));
    if (!res) {
      this._bot.say("command set failed.");
    } else {
      this._bot.say("I will say " + res.message);
    }
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
    this._save();
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

  private _list():string {
    var result = "";
    for (var key in this._jobList) {
      var job = this._jobList[key];
      if (job.running) {
        result += "o ";
      } else {
        result += "x ";
      }
      result += key + " : " + this._jobList[key].time + " " + this._jobList[key].text + "\n";
    }

    return result;
  }


  private _create(cronMessage:ICronMessage): ICronMessage {
    if (!cronMessage) {
      return;
    }
    var job:Job;

    if (isNaN(cronMessage.id) || !this._jobList[cronMessage.id]) {
      // 新規ジョブ作成
      job = new Job(this._bot, cronMessage.time, cronMessage.message);
      this._jobList.push(job);
    }else {
      // 既存ジョブの設定変更
      job=this._jobList[cronMessage.id];
      job.set(cronMessage.time, cronMessage.message);
    }

    if (cronMessage.running) {
      job.start();
    } else {
      job.stop();
    }
    this._save();

    return cronMessage;
  }


  private _parseCommandMessage(message:string): ICronMessage {
    var messages = message.split(" ");

    if (messages.length < 6) {
      return null;
    }
    var id = Number(messages[1]);

    var crontime = messages.slice(0,5).join(" ");
    var text = messages.slice(5).join(" ");

    var result:ICronMessage = {
      id: id,
      running: false,
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

    this._save();
    this._bot.say("job id : " + id + " deleted.");
  }

  private _save(): void {
    console.log("save");
    fs.writeFileSync(this._path + "/job", this._list());
  }

  private _load(): void {
    try{
      var file = String(fs.readFileSync(this._path + "/job")).split("\n");
      for (var key in file) {
        this._create(this._parseSaveMessage(file[key]));
      }
    }catch(e) {
      return;
    }
  }

  private _parseSaveMessage(message:string):ICronMessage {
    var messages = message.split(" ");
    var cronMessage:ICronMessage = {
      id: null,
      running: false,
      time: "",
      message: ""
    }

    if (messages.length < 10) {
      return null;
    }

    if (messages[0] === "o") {
      cronMessage.running = true;
    }

    cronMessage.id = Number(message[1]);
    cronMessage.time = messages.splice(3,5).join(" ");
    cronMessage.message = messages.splice(3).join(" ");
    return cronMessage;

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
