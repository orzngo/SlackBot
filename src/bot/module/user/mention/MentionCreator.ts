///<reference path="../../../../../typings/node/node.d.ts" />

import ISlackUser = require("../../../user/ISlackUser");

/**
 * ユーザーインスタンスを受け取ると、メンションを作成したりメンション回避文字列を作ったりします
 * メンション回避文字列というのは、orzngoというユーザー名に対してのo.rzngoというような文字列のことです
 * メンションを送るユーザーのプレビューに使います
 */

class MentionCreator {

  public createMention(user:ISlackUser) : string {
    return "@" + user.name;
  }

  public createEscapedMention(user:ISlackUser) : string {
    if (user.name.length <= 1)
      return user.name;

    // 一番頭の文字
    var head = user.name.substr(0,1);
    // 一番頭以外の文字
    var body = user.name.substr(1);

    return head + "." + body;

  }
}

export=MentionCreator;

