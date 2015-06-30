///<reference path="../../../../typings/node/node.d.ts" />

import SlackBot = require("../../SlackBot");

var Cron = require("cron");

// node-cronのインスタンスのラッパ
class BaseJob {
  private _running:boolean = false;
  private _cronjob:any;

  constructor(private _crontime:string) {
    this._set(this._crontime);
  }

  get time(): string {
    return this._crontime;
  }

  public exec(): void {
  }

  protected _set(crontime:string): void {
    if (this._cronjob) {
      this.stop();
    }
    this._crontime = crontime;

    this._cronjob = new Cron.CronJob(this.time, () => {
      if (this._running) {
        this.exec();
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

  get running(): boolean {
    return this._running;
  }
}

export=BaseJob;
