///<reference path="../../typings/node/node.d.ts" />

import IConfig = require('../config/IConfig');
var Slack = require('slack-node');



class SlackBot {
  private _slackAPI:any;

  constructor(private _config:IConfig) {
    this._slackAPI = new Slack(this._config.apiToken);

    this._slackAPI.api('chat.postMessage', {text:'Bot Ready.', channel:this._config.home});
  }
}

export=SlackBot;
