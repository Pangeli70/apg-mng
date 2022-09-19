/** -----------------------------------------------------------------------
 * @module [Mng]
 * @author [APG] ANGELI Paolo Giusto
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

  async initializeConnection() {

      await this.#initAtlasClient();

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

    this.mongoDbFindOptions = { noCursorTimeout: false }
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

    this.status = Rst.ApgRstAssert.IsTrue(
      this.connectOptions == null,
      "Mongo DB Atlas connection options not provided"
    )
    if (!this.status.Ok) return this.status;

    const mongoDBClient = new MongoClient();
    const shardTemplateHost = this.connectOptions!.servers[0].host;
    // Prepares shard names using template
    const shardHosts = [
      shardTemplateHost.replace("@@", "00"),
      shardTemplateHost.replace("@@", "01"),
      shardTemplateHost.replace("@@", "02")
    ]
    //Connecting to an Atlas Database trying all the shards
    this.connectOptions!.servers[0].host = shardHosts[0];
    try {
      await mongoDBClient.connect(this.connectOptions!);
    } catch (_e) {
      this.connectOptions!.servers[0].host = shardHosts[1];
      try {
        await mongoDBClient.connect(this.connectOptions!);
      } catch (_e) {
        this.connectOptions!.servers[0].host = shardHosts[2];
        try {
          await mongoDBClient.connect(this.connectOptions!);
        } catch (e) {
          this.status = Rst.ApgRstAssert.IsTrue(
            true,
            "Mongo DB Atlas connection error: " + e.message
          )
        }
      }
    }
    if (!this.status.Ok) return this.status;

    this.mongoDb = mongoDBClient.database(this.dbName);
    this.status = Rst.ApgRstAssert.IsUndefined(
      this.mongoDb,
      `MongoDB ${this.dbName} database name is invalid for current Atlas connection.`,
    );
    if (!this.status.Ok) return this.status;

  }

}

