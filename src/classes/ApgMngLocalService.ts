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

import { ApgMngService } from "./ApgMngService.ts";

export class ApgMngLocalService extends ApgMngService {

  constructor(
    adbName: string
  ) {

    super(adbName);

    this.#setupLocalConnection(adbName);

  }

  override async initializeConnection() {

    return await this.#initLocalClient();

  }

  #setupLocalConnection(
    adbName: string
  ) {

    this.connectOptions = {
      db: adbName,
      tls: false,
      servers: [{
        host: "127.0.0.1",
        port: 27017
      }]
    }

  }

  async #initLocalClient() {

    let r = Rst.ApgRstAssert.IsTrue(
      this.connectOptions == null,
      "Local connection options not provided"
    )
    if (!r.Ok) { 
      return r;
    }

    if (this.client == null) { 
      this.client = new MongoClient();
    }

    try {
      await this.client.connect(this.connectOptions!);
    } catch (e) {
      r = Rst.ApgRstAssert.IsTrue(
        true,
        "Mongo DB Local connection error:" + e.message
      );
    }

    if (!r.Ok) {
      return r;
    }

    this.mongoDb = this.client.database(this.dbName);
    r = Rst.ApgRstAssert.IsUndefined(
      this.mongoDb,
      `MongoDB ${this.dbName} database name is invalid for current Local connection.`,
    );
    
    return r;

  }

}

