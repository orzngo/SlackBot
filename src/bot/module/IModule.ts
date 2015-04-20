import ICommandMessage = require("../message/ICommandMessage");

interface IModule {
  name:string;
  description:string;
  usage:string;

  exec(message:ICommandMessage): void;
}

export=IModule;
