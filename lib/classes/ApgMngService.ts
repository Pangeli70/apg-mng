/** -----------------------------------------------------------------------
 * @module [apg-mng]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.2 [APG 2022/10/04] Github Beta
 * @version 0.9.5 [APG 2023/02/14] Rst simplification
 * @version 0.9.7 [APG 2023/05/21] Separation of concerns lib/srv
 * ------------------------------------------------------------------------
 */

import { Mongo, Rst } from "../deps.ts";


export abstract class ApgMngService {

  protected connectOptions: Mongo.ConnectOptions | null = null;

  protected client: Mongo.MongoClient | null = null;

  protected dbName: string;

  /** Special find options settings for queries timeout if we are using Atlas */
  protected findOptions: Mongo.FindOptions = {};

  protected mongoDb: Mongo.Database | null = null;

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

  initializeConnection() {
    return new Promise<Rst.IApgRst>(() => {
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

