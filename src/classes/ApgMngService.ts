/** -----------------------------------------------------------------------
 * @module [Mng]
 * @author [APG] ANGELI Paolo Giusto
 * ------------------------------------------------------------------------
 */

import {
  MongoDatabase,
  ConnectOptions,
  FindOptions,
  Rst
} from "../../deps.ts";


export abstract class ApgMngService {

  protected status = new Rst.ApgRst();

  protected connectOptions: ConnectOptions | null = null;

  protected dbName: string;

  /** Special find options settings for queries timeout if we are using Atlas */
  protected mongoDbFindOptions: FindOptions = {};

  protected mongoDb: MongoDatabase | null = null;

  get FindOptions() {
    return this.mongoDbFindOptions;
  }

  get DbName() {
    return this.dbName;
  }

  get Database() {
    return this.mongoDb;
  }

  constructor(
    adbName: string
  ) {
    this.dbName = adbName;
  }

  abstract initializeConnection(): Promise<void>;


}

