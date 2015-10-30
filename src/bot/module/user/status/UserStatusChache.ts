import IModule = require("../../IModule");
import ISlackUser = require("../../../user/ISlackUser");
import IRTMMessage = require("../../../message/IRTMMessage");

// ユーザーのStatusの問い合わせとそのキャッシュを行う。
// 現在はPresenceのキャッシュを目的にしている

class UserStatusChache implements IModule {
  private _userChache:{[x:string]: boolean} = {};

  get name():string {
    return "UserStatusChache";
  }

  constructor(private _webAPI:any, private _rtmAPI:any) {
    _rtmAPI.use((message:IRTMMessage, cb:Function) => {
      this._onChangePresence(message);
      cb();
    });
  }

  /**
   * ユーザーのpresenceがチェンジしたイベントのハンドラ
   */
  private _onChangePresence(message:any): void {
    if (message.type !== "presence_change") {
      return;
    }

    this._setToCache(message.user, message.presence);
  }

  private _setToCache(user:string, presence:string):boolean {
    var isActive:boolean = (presence === "active");

    this._userChache[user] = isActive;
    return isActive;
  }

}

export=UserStatusChache;
