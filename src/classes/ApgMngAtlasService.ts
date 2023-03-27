/** -----------------------------------------------------------------------
 * @module [Mng]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.2 [APG 2022/10/04] Github Beta
 * ------------------------------------------------------------------------
 */

import {
  MongoClient,
  Rst
} from "../../deps.ts";

import { ApgMngService } from "./ApgMngService.ts"

export class ApgMngAtlasService extends ApgMngService {


  constructor(
    adbName: string,
    aprimaryShardHost: string,
    auserName: string,
    auserPwd: string,
  ) {
    super(adbName);

    this.#setupAtlasConnection(aprimaryShardHost, auserName, auserPwd, adbName);

  }

  override async initializeConnection() {

    return await this.#initAtlasClient();

  }

  /** Setup Connection to Mongo DB Atlas
   * 
   * @param aprimaryShardHost THIS MUST BE PRIMARY MASTER SHARD NODE!!
   * Verify Using Compass or Atlas web interface
   * @param auserName Store this on the Heroku private Env Vars
   * @param auserPwd  Store this on the Heroku private Env Vars
   * @param adbName Name of the database
   */
  #setupAtlasConnection(
    aprimaryShardHost: string,
    auserName: string,
    auserPwd: string,
    adbName: string,
  ) {

    this.findOptions = { noCursorTimeout: false }
    this.connectOptions = {
      db: adbName,
      tls: true,
      servers: [{
        // THIS MUST BE PRIMARY MASTER SHARD NODE!!!!
        host: aprimaryShardHost,
        port: 27017
      }],
      credential: {
        username: auserName,
        password: auserPwd,
        db: adbName,
        mechanism: "SCRAM-SHA-1"
      }
    }
  }

  async #initAtlasClient() {

    let r = Rst.ApgRstAssert.IsTrue(
      this.connectOptions == null,
      "Mongo DB Atlas connection options not provided",
    )
    if (!r.ok) return r;

    if (this.client == null) {
      this.client = new MongoClient();
    }
    const shardHost = this.connectOptions!.servers[0].host;

    console.log(`Using [${shardHost}] shard host`);

    let error = true;
    let message = "";
    try {
      await this.client.connect(this.connectOptions!);
      error = false;
    } catch (e) {
      message = e.message;
      // Force to close this connection
      this.client.close();
    }

    if (error) {
      return Rst.ApgRstAssert.IsTrue(
        true,
        "Mongo DB Atlas connection error: " + message
      )
    }

    this.mongoDb = this.client.database(this.dbName);
    r = Rst.ApgRstAssert.IsUndefined(
      this.mongoDb,
      `MongoDB ${this.dbName} database name is invalid for current Atlas connection.`,
    );

    return r;

  }

}

