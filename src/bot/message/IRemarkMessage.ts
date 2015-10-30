import IRTMMessage = require("./IRTMMessage");


interface IRemarkMessage extends IRTMMessage {
  channel:string;
  user:string;
  text:string;
  ts:string;
}


export=IRemarkMessage;
