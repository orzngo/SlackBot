///<reference path = "../../../../typings/node/node.d.ts" />
import http = require("http");

import IModule = require("../IModule");
import ICommandMessage = require("../../message/ICommandMessage");
import SlackBot = require("../../SlackBot");
import BaseJob = require("../../common/job/BaseJob");

interface WeatherStatus {
  date: Date;
  status: string;
  description: string;
  maxTemp: number;
}

var WeatherString:{[x:string]: string} = {
  "Snow": ":snowman:",
  "Rain": ":umbrella:",
  "Clear": ":sunny:",
  "Clouds": ":cloud:"
}

class OtenkiModule implements IModule {
  private _apiURL: string = "http://api.openweathermap.org/data/2.5/forecast?q=Tokyo,JP";
  private _webIURL: string = "http://openweathermap.org/city/1850147";
  private _job: BaseJob;

  constructor(private _bot:SlackBot){
    var status:string = _bot.load(this.name, "status");
    this._job = new BaseJob();
    this._job.set("0 12 * * 1-5", () => {this.check()});
    this._job.stop();
  }

  public exec(message:ICommandMessage):void {
    switch (message.options[0]) {
      case undefined:
        this._bot.say("お天気情報を取得します。時間がかかる事があるので、黙ってお待ちください。", message.channel);
        this.check(message.channel);
        break;
      case "web":
        this._bot.say(this._webIURL, message.channel);
        break;
      case "d":
        break;
      default :
        this._bot.say("Unknown Option " + message.options[0], message.channel);
        break;
    }
  }

  /**
   * お天気のチェックを行います
   *
   * @param channel:string 発言するチャンネルです。通常はcronで実行されるため、デフォルトチャンネルに発言します
   */
  public check(channel:string = undefined): void {
    http.get(this._apiURL, (res:http.IncomingMessage) => {
      var result:string = "";
      res.on("data", (data:string) => {
        result += data;
      }).on("end", () => {
        var weathers = this._parse(result);
        if (!weathers || weathers.length !== 4) {
          this._bot.say("お天気情報の取得に失敗しました。", channel);
          return;
        }

        var text = "";
        var rainFlag = false;//連続して雨と表示しない為のフラグ。
        for (var key in weathers) {
          var weather = weathers[key];
          var status = weather.status;
          var hour = weather.date.getHours();
          var maxTemp = weather.maxTemp.toFixed(0);
          text += "| " + hour + "-" + (hour+3) + "時：" + WeatherString[status] + "("+ maxTemp +"℃) ";
        }
        this._bot.say(text, channel);
      });
    }).on("error", (e:any) => {
      this._bot.say("お天気情報の取得に失敗しました。", channel);
      console.log(e);
    });
  }

  /**
   * apiのパース部分
   */
  private _parse(data:string): Array<WeatherStatus> {
    var result:WeatherStatus[] = [];
    try {
      var json:any = JSON.parse(data);
      var list:any = json.list;
      for (var i=0; i < 4 ; i++) {
        var date = new Date(list[i].dt * 1000);
        var weather:WeatherStatus = {
          date: date,
          status: list[i].weather[0].main,
          description: list[i].weather[0].description,
          maxTemp: list[i].main.temp_max - 273
        }
        result.push(weather);
      }
    } catch(e) {
      console.log("parse error");
      return null;
    }
    return result;
  }


  get name():string {
    return "otenki";
  }
  get description():string {
    return "直近半日くらいの天気を表示します";
  }
  get usage():string {
    return "@botname otenki         直近半日くらいの天気を表示します\n"
         + "@botname otenki.web       お天気サイトのURLを表示します\n";
         /*
         + "@botname otenki.stop    お天気監視をやめます\n"
         + "@botname otenki.status  監視状態を出力します";
         */
  }
}

export=OtenkiModule;
