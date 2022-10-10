/** -----------------------------------------------------------------------
 * @module [Mng]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.2 [APG 2022/10/04] Github Beta
 * ------------------------------------------------------------------------
 */

import {
  MongoClient,
  MongoDatabase,
  MongoConnOpts,
  MongoFindOpts,
  Rst
} from "../../deps.ts";


export abstract class ApgMngService {

  protected connectOptions: MongoConnOpts | null = null;

  protected client: MongoClient | null = null;

  protected dbName: string;

  /** Special find options settings for queries timeout if we are using Atlas */
  protected findOptions: MongoFindOpts = {};

  protected mongoDb: MongoDatabase | null = null;

  get FindOptions() {
    return this.findOptions;
  }

  get Status() {
    return this.client !== null && this.mongoDb !== null;
  }

  get DbName() {
    return this.dbName;
  }

  get Database() {
    return this.mongoDb;
  }

  get Client() {
    return this.client;
  }

  constructor(
    adbName: string
  ) {
    this.dbName = adbName;
  }

  initializeConnection(): Promise<Rst.ApgRst> {
    return new Promise<Rst.ApgRst>(() => {
      throw new Error(`If you want to call [${this.initializeConnection.name}] method you must override the implementation.`)
    })
  }

  closeConnection() {
    if (this.client != null) {
      this.client.close();
      this.client = null;
    }
  }

}

