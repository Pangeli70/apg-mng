/** -----------------------------------------------------------------------
 * @module [Mng]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.2 [APG 2022/10/04] Github Beta
 * -----------------------------------------------------------------------
 */

import {
    MongoCollection,
    DotEnv,
    Uts,
} from "../../deps.ts";
import { ApgMngService } from "./ApgMngService.ts";
import { ApgMngLocalService } from "./ApgMngLocalService.ts";
import { ApgMngAtlasService } from "./ApgMngAtlasService.ts";
import { eApgMngMode } from "../enums/eApgMngMode.ts";


export class ApgMngConnector extends Uts.ApgUtsMeta {

    private _mongoService: ApgMngService | null = null;
    private _logMode: Uts.eApgUtsLogMode

    constructor(alogMode = Uts.eApgUtsLogMode.verbose) {
        super(import.meta.url)
        this._logMode = alogMode;
    }

    #log(amessage: string) { 
        if (this._logMode == Uts.eApgUtsLogMode.verbose) {
            console.log(amessage)
        }
    }

    async connect(amode: eApgMngMode, adbName: string) {

        const env = DotEnv.config()

        if (amode == eApgMngMode.local) {
            this._mongoService = new ApgMngLocalService(adbName)
            this.#log("MongoDB Local connecting");
        }
        else {
            this._mongoService = new ApgMngAtlasService(
                adbName,
                env.atlasShard,
                env.user,
                env.password,
            )
            this.#log("MongoDB Atlas connecting")
        }
        if (this._mongoService != null) {

            await this._mongoService.initializeConnection();

            if (!this._mongoService.Status.Ok) {
                this.#log(this.CLASS_NAME + " Error: MongoDB not connected");
                return;
            } else {
                this.#log("MongoDB connected")
            }
        }
        else {
            this.#log("MongoDB connection FAILURE")
        }

    }

    disconenct() { 
        if (this._mongoService) { 
            this._mongoService.closeConnection();
        }
    }

    getCollection<T>(acollectionName: string) {

        let r: MongoCollection<T> | null = null;

        if (!this._mongoService) return r;
        
        if (!this._mongoService.Status.Ok) return r;

        r = this._mongoService.Database!.collection<T>(acollectionName);

        if (r == undefined) {
            this.#log(this.CLASS_NAME + " Error: " + acollectionName + " collection not initialized");
            return null;
        }
        this.#log( acollectionName + " collection connected")

        return r;
    }

}