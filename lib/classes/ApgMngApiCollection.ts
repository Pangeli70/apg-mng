/** -----------------------------------------------------------------------
 * @module [apg-mng]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.4 [APG 2023/02/06]
 * @version 0.9.7 [APG 2023/05/21] Separation of concerns lib/srv
 * ------------------------------------------------------------------------
 */

/** 
 * Mongo DB Atlas API WIP
 */
export class ApgMngApiCollection {

    private _url: string;
    private _apiKey: string;
    private _databaseName: string;
    private _collectionName: string;
    private _dataSource: string;
    private _appId: string;

    constructor(
        aappId: string,
        aapiKey: string,
        adatabaseName: string,
        acollectionName: string,
        adataSource = 'Cluster0',
    ) {
        this._appId = aappId;
        this._apiKey = aapiKey;
        this._databaseName = adatabaseName;
        this._collectionName = acollectionName;
        this._dataSource = adataSource;
        this._url = `https://data.mongodb-api.com/app/${this._appId}/endpoint/data/v1`
    }

    async all() {
        const r = await this.#simpleFilterOp("find", {});
        return r;
    }

    async findOne(afilter: any) {
        const r = await this.#simpleFilterOp("findOne", afilter);
        return r;
    }

    async findMany(afilter: any, asort: any, alimit: number = 1000, askip: number = 0) {
        const r = await this.#simpleFilterOp("find", afilter);
        return r;
    }

    async insertMany(adocuments: any[]) {
        const requestPayload = this.#requestPayload();
        requestPayload.documents = adocuments;
        const url = this._url + "/action/insertMany";
        const r = await this.#httpMongoDbAtlasOperation(url, requestPayload);
        return r;
    }

    async insertOne(adocument: any) {
        const r = await this.insertMany([adocument]);
        return r;
    }

    async updateMany(
        afilter: any,
        aupdate: any,
        aupsert = false,
    ) {
        const r = await this.#updateOp("updateMany", afilter, aupdate, aupsert);
        return r;
    }

    async updateOne(
        afilter: any,
        aupdate: any,
        aupsert = false,
    ) {
        const r = await this.#updateOp("updateOne", afilter, aupdate, aupsert);
        return r;
    }

    async #updateOp(
        acommand: string,
        afilter: any,
        aupdate: any,
        aupsert = false,
    ) {
        const requestPayload = this.#requestPayload();
        requestPayload.filter = afilter;
        requestPayload.update = aupdate;
        requestPayload.upsert = aupsert;
        const url = this._url + "/action/" + acommand;
        const r = await this.#httpMongoDbAtlasOperation(url, requestPayload);
        return r;
    }

    async deleteMany(afilter: any) {
        const r = await this.#simpleFilterOp("deleteMany", afilter);
        return r;
    }

    async deleteOne(afilter: any) {
        const r = await this.#simpleFilterOp("deleteOne", afilter);
        return r;
    }

    async #simpleFilterOp(acommand: string, afilter: any) {
        const requestPayload = this.#requestPayload();
        requestPayload.filter = afilter;
        const url = this._url + "/action/" + acommand;
        const r = await this.#httpMongoDbAtlasOperation(url, requestPayload);
        return r;
    }

    #requestPayload() {
        const r: any = {
            database: this._databaseName,
            collection: this._collectionName,
            dataSource: this._dataSource,
        };
        return r;
    }

    async #httpMongoDbAtlasOperation(url: string, arequestPayload: any) {

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Request-Headers': '*',
                    'api-key': this._apiKey,
                },
                body: JSON.stringify(arequestPayload),
            });
            const responseBody = await response.json();

            if (responseBody.error) {
                return { error: responseBody.error, isSuccess: false };
            }

            return { ...responseBody, error: null, isSuccess: true };

        } catch (error) {

            return { error, isSuccess: false };

        }
    }

}
