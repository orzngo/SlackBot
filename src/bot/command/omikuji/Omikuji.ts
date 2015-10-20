import ICommand = require("../ICommand");
import ICommandMessage = require("../../message/ICommandMessage");
import IBotSayClient = require("../../client/say/IBotSayClient");

class Omikuji implements ICommand {
  constructor(private _client:IBotSayClient){
  }


  public exec(message:ICommandMessage):void {
    if (!message.message) {
      return;
    }

    var text = message.message;
    var words = text.split(",");

    if (words.length <= 0) {
      this._client.say("抽選対象を入力してください", message.channel);
      return;
    }

    var words = this._shuffle(words);

    var num = 1;

    if (message.options[0] === "a") {
      num = words.length;
    } else if (Number(message.options[0]) > 0) {
      num = Number(message.options[0]);
    }

    if (num > words.length) {
      num = words.length;
    }

    var result = "";

    for (var i = 0; i < num; i++ ) {
      result += " " + words.pop() + "";
    }

    this._client.say(result, message.channel);
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
          + "omikuji.n hoge,hoo,bar -> hoge,hoo,barのうちn個をランダムに出力\n"
          + "omikuji.a hoge,hoo,bar -> hoge,hoo,barの全てをランダムな順序で出力";
  }
}

export=Omikuji;
