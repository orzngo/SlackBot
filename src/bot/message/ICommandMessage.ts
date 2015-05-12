interface ICommandMessage {
  command:string;
  options:string[];
  message:string;
  user:string;
  channel:string;
}

export=ICommandMessage;

