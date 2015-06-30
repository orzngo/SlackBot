import IModule = require("../IModule");
import ICommandMessage = require("../../message/ICommandMessage");
import SlackBot = require("../../SlackBot");
import BaseJob = require("../../common/job/BaseJob");

class OtenkiModule implements IModule {
  private _apiURL:string = "http://api.openweathermap.org/data/2.5/weather?q=Tokyo,jp";
  private _job:BaseJob;

  constructor(private _bot:SlackBot){
    var status:string = _bot.load(this.name, "status");
    this._job = new BaseJob("*/15 * * * 1-5");
    if (status && status === "x") {
    } else {
    }
  }

  public exec(message:ICommandMessage):void {
    if (!message.message || message.message.length === 0) {
      return;
    }
  }

  get name():string {
    return "otenki";
  }
  get description():string {
    return "東京に雨か雪が降り始めたらお知らせします。土日は休みです";
  }
  get usage():string {
    return "@botname otenki.start   お天気監視を始めます\n"
         + "@botname otenki.stop    お天気監視をやめます\n"
         + "@botname otenki.status  現在の天気情報と、監視状態を出力します";
  }
}

export=OtenkiModule;
