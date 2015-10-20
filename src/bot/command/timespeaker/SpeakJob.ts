///<reference path="../../../../typings/node/node.d.ts" />

import BaseJob = require("../../common/job/BaseJob");
import IBotSayClient = require("../../client/say/IBotSayClient");

class SpeakJob {
  private _job:BaseJob;

  constructor(private _crontime:string, private _client:IBotSayClient, private _channel:string, private _message:string) {
    this._job = new BaseJob();
    this.set(_crontime, _message);
  }

  get message(): string {
    return this._message;
  }

  get channel(): string {
    return this._channel;
  }

  public exec(): void {
    this._client.say(this.message, this.channel);
  }

  public set(crontime:string, message:string): void {
    this._job.set(crontime, () => {
      this.exec();
    });
  }

  public start(): void {
    this._job.start();
  }

  public stop(): void {
    this._job.stop();
  }

  public get running(): boolean {
    return this._job.running;
  }

  public get time(): string {
    return this._job.time;
  }

  get text(): string {
    return this._message;
  }
}

export=SpeakJob;
