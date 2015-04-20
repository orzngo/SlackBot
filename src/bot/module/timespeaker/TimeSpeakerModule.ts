import IModule = require("../IModule");
import SlackBot = require("../../SlackBot");

class TimeSpeakerModule implements IModule {
  constructor(private _bot:SlackBot){
  }


  public exec(message:string):void {
    this._bot.say(message);
  }

  get name():string {
    return "timespeaker";
  }
  get description():string {
    return "cron的に発言する";
  }
  get usage():string {
    return "echo message";
  }
}

export=TimeSpeakerModule;
