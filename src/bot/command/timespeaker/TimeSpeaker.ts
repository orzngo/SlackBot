///<reference path="../../../../typings/node/node.d.ts" />

import ICommand = require("../ICommand");
import SlackBot = require("../../SlackBot");
import ICommandMessage = require("../../message/ICommandMessage");
import IBotSayClient = require("../../client/say/IBotSayClient");
import SpeakJob = require("./SpeakJob");
import ModuleStorage = require("../../module/storage/ModuleStorage");

interface ICronMessage {
  id: number;
  running: boolean;
  time: string;
  message: string;
  channel: string;
}


class TimeSpeaker implements ICommand {
  private _jobList:Array<SpeakJob> = [];
  private _path:string;
  private _channel:string;

  private _storage:ModuleStorage;

  private _running:Boolean = true;

  constructor(private _client:IBotSayClient){
    this._storage = new ModuleStorage(this);

    this._load();
  }

  public exec(message:ICommandMessage):void {
    this._channel = message.channel;
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
          var list = this._list()
          this._client.say((list.length > 0) ? list : "empty", this._channel);
        break;
      case "unset":
        this._unset(message);
        break;
      default:
        this._client.say("Unknown Option :" + message.options[0], this._channel);
    }
  }


  private _start(message:ICommandMessage): void {
    var targetId:number = Number(message.options[1]);

    // 本体のステータス変更
    if (isNaN(targetId)) {
      this._startSelf();
      return;
    }

    this._startSpeakJob(targetId);

  }

  private _startSpeakJob(id:number): void {
    if (!this._jobList[id]) {
      this._client.say("Unknown job id : " + id, this._channel);
      return;
    }
    this._jobList[id].start();
    this._client.say("job id : " + id + " started.", this._channel);
    this._save();
  }

  private _startSelf(): void {
    if (!this._running) {
      this._running = true;
      this._client.say("Started.", this._channel);
      return;
    }
    this._client.say("Already started.", this._channel);
  }


  private _set(message:ICommandMessage) {
    var res = this._create(this._parseCommandMessage(message));
    if (!res) {
      this._client.say("command set failed.", this._channel);
    } else {
      this._client.say("I will say " + res.message + " at here.", this._channel);
    }
  }

  private _stop(message:ICommandMessage): void {
    var targetId:number = Number(message.options[1]);

    // 本体のステータス変更
    if (isNaN(targetId)) {
      this._stopSelf();
      return;
    }

    this._stopSpeakJob(targetId);
  }

  private _stopSpeakJob(id:number): void {
    if (!this._jobList[id]) {
      this._client.say("Unknown job id : " + id, this._channel);
      return;
    }
    this._jobList[id].stop();
    this._client.say("job id : " + id + " stopped.", this._channel);
    this._save();
  }


  private _stopSelf(): void {
    if (this._running) {
      this._running = false;
      this._client.say("Stopped.", this._channel);
      return;
    }
    this._client.say("Already stopped.", this._channel);
  }

  private _status(message:ICommandMessage): void {
    this._client.say("running = " + String(this._running), this._channel);
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
      result += key + " : " + this._jobList[key].time + " " + this._jobList[key].channel + " " + this._jobList[key].text + "\n";
    }

    return result;
  }


  private _create(cronMessage:ICronMessage): ICronMessage {
    if (!cronMessage) {
      return;
    }
    var job:SpeakJob;
    if (isNaN(cronMessage.id) || !this._jobList[cronMessage.id]) {
      // 新規ジョブ作成
      job = new SpeakJob(cronMessage.time,this._client, cronMessage.channel, cronMessage.message);
      job.start();
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


  private _parseCommandMessage(message:ICommandMessage): ICronMessage {
    var messages = message.message.split(" ");

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
      message: text,
      channel: message.channel
    }
    return result;


  }

  private _unset(message:ICommandMessage): void {
    var id = Number(message.options[1]);

    if (isNaN(id) || !this._jobList[id]) {
      this._client.say("Unknown job id : " + id, this._channel);
      return;
    }

    this._jobList[id].stop();
    delete this._jobList[id];

    this._save();
    this._client.say("job id : " + id + " deleted.", this._channel);
  }

  private _save(): void {
    this._storage.save(this._list(), "job");
  }

  private _load(): void {
    try{
      var file = this._storage.load("job").split("\n");
      for (var key in file) {
        this._create(this._parseSaveMessage(file[key]));
      }
    }catch(e) {
      console.log(e);
      return;
    }
  }

  private _parseSaveMessage(message:string):ICronMessage {
    var messages = message.split(" ");
    var cronMessage:ICronMessage = {
      id: null,
      running: false,
      time: "",
      message: "",
      channel: null,
    }

    if (messages.length < 9) {
      return null;
    }

    if (messages[0] === "o") {
      cronMessage.running = true;
    }

    cronMessage.id = Number(messages[1]);
    cronMessage.time = messages.splice(3, 5).join(" ");
    cronMessage.channel = messages[3];
    cronMessage.message = messages.splice(4).join(" ");
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
    mes += 'timespeaker.start[.id]\n';
    mes += 'timespeaker.stop[.id]\n';
    mes += 'timespeaker.status\n';
    mes += 'timespeaker.set[.id] * * * * * * message\n';
    mes += 'timespeaker.list\n';
    mes += 'timespeaker.unset.id\n';

    return mes;
  }
}

export=TimeSpeaker;
