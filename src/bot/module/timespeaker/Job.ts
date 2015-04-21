///<reference path="../../../../typings/node/node.d.ts" />

import SlackBot = require("../../SlackBot");

var Cron = require("cron");

// node-cronのインスタンスのラッパ
class Job {
  private _running:boolean = false;
  private _cronjob:any;

  constructor(private _bot:SlackBot, private _crontime:string, private _message:string) {
    this.set(this._crontime, this._message);
  }

  get time(): string {
    return this._crontime;
  }

  get message(): string {
    return this._message;
  }

  public set(crontime:string, message:string) {
    if (this._cronjob) {
      this.stop();
    }
    this._crontime = crontime;
    this._message = message;

    this._cronjob = new Cron.CronJob(this.time, () => {
      if (this._running) {
        this._bot.say(this.message);
      }
    });
    if (this._running) {
      this._cronjob.start();;
    }
  }

  public start():void {
    this._running = true;
    this._cronjob.start();
  }

  public stop():void {
    this._running = false;
    this._cronjob.stop();
  }


  get text(): string {
    return this._message;
  }

  get running(): boolean {
    return this._running;
  }
}

export=Job;
