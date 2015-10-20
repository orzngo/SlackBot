import ICommand = require("../ICommand");
import ICommandMessage = require("../../message/ICommandMessage");
import IBotSayClient = require("../../client/say/IBotSayClient");

class Echo implements ICommand {
  constructor(private _client:IBotSayClient){
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
    console.log(this._client);

    this._client.say(text, message.channel);
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

export=Echo;
