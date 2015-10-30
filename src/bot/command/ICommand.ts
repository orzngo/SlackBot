import IModule = require("../module/IModule");
import ICommandMessage = require("../message/ICommandMessage");

// botが利用する機能のうち、他から利用されるのではなく、ユーザーからの入力によって動作を行うもの
// 内部では他のモジュールを利用する事もある。他のコマンドの機能は原則利用してはいけない

interface ICommand extends IModule {
  description:string;
  usage:string;

  exec(message:ICommandMessage): void;
}

export=ICommand;
