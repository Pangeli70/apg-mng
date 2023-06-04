/** -----------------------------------------------------------------------
 * @module [apg-mng]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.2 [APG 2022/10/04] Github Beta
 * @version 0.9.5 [APG 2023/02/14] Rst simplification
 * @version 0.9.7 [APG 2023/05/21] Separation of concerns lib/srv
 * -----------------------------------------------------------------------
 */

import { Mongo, Uts, Rst } from "../deps.ts";
import { ApgMngService } from "./ApgMngService.ts";
import { ApgMngLocalService } from "./ApgMngLocalService.ts";
import { ApgMngAtlasService } from "./ApgMngAtlasService.ts";
import { eApgMngMode } from "../enums/eApgMngMode.ts";


export class ApgMngConnector extends Uts.ApgUtsBaseService {

    static readonly DENO_RESOURCES_SIGNATURE = "{id:string, res:string}"

    private static _connectionsNum = 0;

    private _mongoService: ApgMngService | null = null;
    private _logMode: Uts.eApgUtsLogMode;

    private _denoResources: any[] = [];



    constructor(alogMode = Uts.eApgUtsLogMode.verbose) {
        super(import.meta.url)
        this._logMode = alogMode;
    }

    #log(amessage: string) {
        if (this._logMode == Uts.eApgUtsLogMode.verbose) {
            console.log(this.CLASS_NAME + ": " + amessage)
        }
    }

    /**
     * @signature "{id:string, res:string}"
     */
    async connect(
        amode: eApgMngMode,
        adbName: string,
        aatlasOptions?: {
            mongoHost: string,
            user: string,
            password: string
        }) {

        const p: { id: string; res: string }[] = [];

        this._denoResources.push(Deno.resources());

        if (ApgMngConnector._connectionsNum > 0) {
            throw new Error("Mongo connection not closed")
        }

        if (amode == eApgMngMode.local) {
            this._mongoService = new ApgMngLocalService(adbName)
            this.#log("MongoDB Local connecting");
        }
        else {
            
            this._mongoService = new ApgMngAtlasService(
                adbName,
                aatlasOptions?.mongoHost || "",
                aatlasOptions?.user || "",
                aatlasOptions?.password || ""
            )
            this.#log("MongoDB Atlas connecting")
        }

        const r = await this._mongoService.initializeConnection();

        if (r.ok) {
            this.#log("MongoDB connected");
            ApgMngConnector._connectionsNum++;
            this._denoResources.push(Deno.resources());

            for (const key in this._denoResources[1]) {
                if (!this._denoResources[0][key]) {
                    p.push({ id: key, res: this._denoResources[1][key] })
                }
            }
            r.payload = {
                signature: ApgMngConnector.DENO_RESOURCES_SIGNATURE,
                data: p
            };
        }

        return r;
    }

    disconnect() {
        const r: Rst.IApgRst = { ok: true };
        const p = [];
        if (this._mongoService) {
            ApgMngConnector._connectionsNum--;
            this._mongoService.closeConnection();
            this._denoResources.push(Deno.resources());

            for (const key in this._denoResources[1]) {
                if (!this._denoResources[2][key]) {
                    p.push({ id: key, res: this._denoResources[1][key] })
                }
            }
            r.payload = {
                signature: ApgMngConnector.DENO_RESOURCES_SIGNATURE,
                data: p
            };
        }

        return r;
    }

    getCollection<T extends Mongo.Document>(acollectionName: string) {

        let r: Mongo.Collection<T> | null = null;

        if (!this._mongoService) return r;

        if (!this._mongoService.Status) return r;

        r = this._mongoService.Database!.collection<T>(acollectionName);

        if (r == undefined) {
            this.#log(this.CLASS_NAME + " Error: " + acollectionName + " collection not initialized");
            return null;
        }
        this.#log(acollectionName + " collection connected")

        return r;
    }

}