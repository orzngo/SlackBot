///<reference path="../../../../typings/node/node.d.ts" />

import SlackBot = require("../../SlackBot");

var Cron = require("cron");

// node-cronのインスタンスのラッパ
class Job {
  private _running:boolean = false;
  private _cronjob:any;

  constructor(private _bot:SlackBot, private _crontime:string, private _message:string) {
    this.time = this._crontime;
  }

  get time(): string {
    return this._crontime;
  }

  set time(val:string) {
    if (this._cronjob) {
      this.stop();
    }

    this._cronjob = new Cron.CronJob(val, () => {
      if (this._running) {
        this._bot.say(this._message);
      }
    });
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
