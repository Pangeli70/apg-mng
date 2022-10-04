/** -----------------------------------------------------------------------
 * @module [Mng]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.2 [APG 2022/10/04] Github Beta
 * ------------------------------------------------------------------------
 */

import {
  MongoClient,
  MongoDatabase,
  ConnectOptions,
  FindOptions,
  Rst
} from "../../deps.ts";


export abstract class ApgMngService {

  protected status = new Rst.ApgRst();

  protected connectOptions: ConnectOptions | null = null;

  protected client: MongoClient | null = null;

  protected dbName: string;

  /** Special find options settings for queries timeout if we are using Atlas */
  protected mongoDbFindOptions: FindOptions = {};

  protected mongoDb: MongoDatabase | null = null;

  get FindOptions() {
    return this.mongoDbFindOptions;
  }

  get Status() {
    return this.status;
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

  abstract initializeConnection(): Promise<void>;

  closeConnection() { 
    if (this.client != null) { 
      this.client.close();
      this.client = null;
    }
  }

}

