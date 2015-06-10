import IModule = require("../IModule");
import ICommandMessage = require("../../message/ICommandMessage");
import SlackBot = require("../../SlackBot");

class OmikujiModule implements IModule {
  constructor(private _bot:SlackBot){
  }


  public exec(message:ICommandMessage):void {
    if (!message.message) {
      return;
    }

    var text = message.message;
    var words = text.split(",");

    if (words.length <= 0) {
      this._bot.say("抽選対象を入力してください", message.channel);
      return;
    }

    var words = this._shuffle(words);

    var num = 1;
    console
    if (Number(message.options[0]) > 0) {
      num = Number(message.options[0]);
    }

    if (num > words.length) {
      num = words.length;
    }

    var result = "";

    for (var i = 0; i < num; i++ ) {
      result += " " + words.pop() + "";
    }

    this._bot.say(result, message.channel);
  }

  private _shuffle(array: string[]): string[] {
    var n = array.length;
    var t : string;
    var i : number;

    while (n) {
      i = Math.floor(Math.random() * n--);
      t = array[n];
      array[n] = array[i];
      array[i] = t;
    }

    return array;
  }

  get name():string {
    return "omikuji";
  }
  get description():string {
    return "与えられた文字列の集合から、ランダムにとりだす";
  }
  get usage():string {
    return  "omikuji hoge,hoo,bar   -> hoge,hoo,barのうち１つをランダムに出力\n"
          + "omikuji.2 hoge,hoo,bar -> hoge,hoo,barのうち２つをランダムに出力";
  }
}

export=OmikujiModule;
