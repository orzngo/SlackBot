import IModule = require("../IModule");
import Storage = require("./Storage");
import IStorage = require("./IStorage");

/**
 * モジュール、コマンドに対してセーブロード機能を提供するクラス
 */

class ModuleStorage extends Storage implements IStorage {
  get name(): string {
    return "ModuleStorage";
  }

  constructor (private _module:IModule) {
    super();
  }

  /**
   * テキストデータの書き込み機能
   *
   * @param data {string} 書き込みたいデータ
   * @param filename {string} 保存したいファイル名
   *
   * @return {boolean} 書き込みに成功したかどうか
   */
  public save(data: string, filename: string): Boolean {
    return super._save(data, this._module.name, filename);
    
  }

  /**
   * テキストデータの読み込み機能
   *
   * @param filename {string} 読み込むファイル名
   *
   * @return {string} 読み込んだ文字列 
   */
  public load(filename: string): string {
    return super._load(this._module.name, filename);
  }
}

export=ModuleStorage;
