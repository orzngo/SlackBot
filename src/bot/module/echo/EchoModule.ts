import IModule = require("../IModule");
import ICommandMessage = require("../../message/ICommandMessage");
import SlackBot = require("../../SlackBot");

class EchoModule implements IModule {
  constructor(private _bot:SlackBot){
  }


  public exec(message:ICommandMessage):void {
    if (!message.message || message.message.length === 0) {
      return;
    }

    var text = message.message;

    var option:string = message.options.join(".");
    if (option.length > 0) {
      text += "  option: " + option;
    }

    this._bot.say(text, message.channel);
  }

  get name():string {
    return "echo";
  }
  get description():string {
    return "言われた事をそのまま発言する";
  }
  get usage():string {
    return "@botname echo message";
  }
}

export=EchoModule;
