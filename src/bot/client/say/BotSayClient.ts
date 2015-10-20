import IBotSayClient = require("./IBotSayClient");
import SlackBot = require("../../SlackBot");

class BotSayClient implements IBotSayClient {
  private _say:(message:string, channel:string) => void;
  private _debug:(message:string) => void;

  constructor(bot:SlackBot) {
    this._say = (message:string, channel:string) => {
      bot.say(message, channel);
    }
    this._debug = (message:string) => {
      bot.debug(message);
    }
  }

  public say(message:string, channel:string): void {
    this._say(message, channel);
  }

  public debug(message:string): void {
    this._debug(message);
  }

}

export=BotSayClient;
