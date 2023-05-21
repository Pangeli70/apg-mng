/** -----------------------------------------------------------------------
 * @module [apg-mng]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.2 [APG 2022/10/04] Github Beta
 * @version 0.9.7 [APG 2023/05/21] Separation of concerns lib/srv
 * -----------------------------------------------------------------------
 */

import { Mongo } from '../deps.ts';


export interface IApgMngUpdateOneResult {
    matchedCount: number;
    modifiedCount: number;
    upsertedCount: number;
    upsertedId?: Mongo.Bson.ObjectId;
}


export interface IApgMngUpdateManyResult {
    matchedCount: number;
    modifiedCount: number;
    upsertedCount: number;
    upsertedIds?: Mongo.Bson.ObjectId[];
}