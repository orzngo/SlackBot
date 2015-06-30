///<reference path="../../../../typings/node/node.d.ts" />

import SlackBot = require("../../SlackBot");

var Cron = require("cron");

// node-cronのインスタンスのラッパ
class BaseJob {
  private _running:boolean = false;
  private _cronjob:any;
  private _crontime:string;

  constructor() {
  }

  get time(): string {
    return this._crontime;
  }

  public set(crontime:string, exec:Function = function(){}): void {
    if (this._cronjob) {
      this.stop();
    }
    this._crontime = crontime;

    this._cronjob = new Cron.CronJob(this.time, () => {
      if (this._running) {
        exec();
      }
    });
    if (this._running) {
      this._cronjob.start();;
    }
  }

  public start():void {
    if (!this._cronjob) {
      throw new Error("Job not initialized.");
      return;
    }
    this._running = true;
    this._cronjob.start();
  }

  public stop():void {
    if (!this._cronjob) {
      throw new Error("Job not initialized.");
      return;
    }
    this._running = false;
    this._cronjob.stop();
  }

  get running(): boolean {
    return this._running;
  }
}

export=BaseJob;
