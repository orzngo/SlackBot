///<reference path="../../../../typings/node/node.d.ts" />

import SlackBot = require("../../SlackBot");
import BaseJob = require("./BaseJob");

class SpeakJob extends BaseJob {

  constructor(crontime:string, private _bot:SlackBot, private _channel:string, private _message:string) {
    super(crontime);
  }

  get message(): string {
    return this._message;
  }

  get channel(): string {
    return this._channel;
  }

  public exec(): void {
    this._bot.say(this.message, this.channel);
  }

  public set(crontime:string, message:string): void {
    super._set(crontime);
    this._message = message;
  }

  get text(): string {
    return this._message;
  }
}

export=SpeakJob;
