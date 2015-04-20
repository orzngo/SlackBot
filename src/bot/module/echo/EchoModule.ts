import IModule = require("../IModule");
import SlackBot = require("../../SlackBot");

class EchoModule implements IModule {
  constructor(private _bot:SlackBot){
  }


  public exec(message:string):void {
    this._bot.say(message);
  }

  get name():string {
    return "echo";
  }
  get description():string {
    return "言われた事をそのまま発言する";
  }
  get usage():string {
    return "echo message";
  }
}

export=EchoModule;
