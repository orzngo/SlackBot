import IModule = require("../module/IModule");
import ICommandMessage = require("../message/ICommandMessage");

// ユーザーからの呼び出しによって、何らかの動作を行うもの
interface ICommand extends IModule {
  description:string;
  usage:string;

  exec(message:ICommandMessage): void;
}

export=ICommand;
