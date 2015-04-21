import IModule = require("../IModule");
import SlackBot = require("../../SlackBot");
import ICommandMessage = require("../../message/ICommandMessage");

class TimeSpeakerModule implements IModule {
  constructor(private _bot:SlackBot){
  }


  public exec(message:ICommandMessage):void {
  }

  get name():string {
    return "timespeaker";
  }
  get description():string {
    return "cron的に発言する";
  }
  get usage():string {
    var mes ="";
    mes += 'timespeaker.start\n';
    mes += 'timespeaker.stop\n';
    mes += 'timespeaker.status\n';
    mes += 'timespeaker.set * * * * * * message\n';
    mes += 'timespeaker.set.id * * * * * * message\n';
    mes += 'timespeaker.list\n';
    mes += 'timespeaker.unset.id\n';

    return mes
  }
}

export=TimeSpeakerModule;
