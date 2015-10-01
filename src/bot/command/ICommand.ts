import ICommandMessage = require("../message/ICommandMessage");

// ユーザーからの呼び出しによって、何らかの動作を行うもの
interface ICommand {
  name:string;
  description:string;
  usage:string;

  exec(message:ICommandMessage): void;
}

export=ICommand;
