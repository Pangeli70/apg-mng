/** -----------------------------------------------------------------------
 * @module [Mng]
 * @author [APG] ANGELI Paolo Giusto
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

  async initializeConnection() {

    await this.#initLocalClient();

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

    this.status = Rst.ApgRstAssert.IsTrue(
      this.connectOptions == null,
      "Local connection options not provided"
    )
    if (!this.status.Ok) return this.status;

    const mongoDBClient = new MongoClient();
    try {
      await mongoDBClient.connect(this.connectOptions!);
    } catch (e) {
      this.status = Rst.ApgRstAssert.IsTrue(
        true,
        "Mongo DB Local connection error:" + e.message
      );
    }
    if (!this.status.Ok) return this.status;

    this.mongoDb = mongoDBClient.database(this.dbName);
    this.status = Rst.ApgRstAssert.isUndefined(
      this.mongoDb,
      `MongoDB ${this.dbName} database name is invalid for current Local connection.`,
    );
    if (!this.status.Ok) return this.status;

  }

}

