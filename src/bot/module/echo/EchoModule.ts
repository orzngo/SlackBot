import IModule = require("../IModule");
import ICommandMessage = require("../../message/ICommandMessage");
import SlackBot = require("../../SlackBot");

class EchoModule implements IModule {
  constructor(private _bot:SlackBot){
  }


  public exec(message:ICommandMessage):void {
    var option:string = message.options.join(".");
    this._bot.say(message.message + "with option:" + option);
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
