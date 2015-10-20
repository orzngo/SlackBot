///<reference path="../../../../typings/node/node.d.ts" />

import IModule = require("../IModule");
import fs = require("fs");

/**
 * セーブ、ロード機能を提供する
 * コイツ自身はアブストラクトな感じ。（TSのバージョンあげればいいだけなきもするが）
 */

class Storage implements IModule {

  get name(): string {
    return "Storage";
  }

  /**
   * 簡単なテキストデータの書き込み機能
   *
   * @param data {string} 書き込みたいデータ
   * @param dirname {string} 保存したいディレクトリ
   * @param filename {string} 保存したいファイル名
   *
   * @return {boolean} 書き込みに成功したかどうか
   */
  protected _save(data:string, dirname:string, filename:string = "save.txt"): boolean {
    try {
      if (!fs.existsSync("./etc/" + dirname)) {
        fs.mkdirSync("./etc/" + dirname);
      }
      fs.writeFileSync("./etc/" + dirname + "/" + filename, data);
    } catch (e) {
      return false;
    }

    return true;

  }

  /**
   * 簡単なテキストデータの読み込み機能
   *
   * @param dirname {string} 読み込むディレクトリ
   * @param filename {string} 読み込むファイル名
   *
   * @return {string} 読み込んだ文字列 
   */
  protected _load(dirname:string, filename:string = "save.txt"): string {
    if (!dirname) {
      dirname = "global";
    }
    try{
      var file = String(fs.readFileSync("./etc/" + dirname + "/" + filename));
    }catch(e) {
      return null;
    }

    return file;
  }
}

export=Storage;
