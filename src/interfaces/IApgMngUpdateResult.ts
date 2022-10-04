/** -----------------------------------------------------------------------
 * @module [Mng]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.2 [APG 2022/10/04] Github Beta
 * -----------------------------------------------------------------------
 */

import { BsonObjectID } from '../../deps.ts';


export interface IApgMngUpdateOneResult {
    matchedCount: number;
    modifiedCount: number;
    upsertedCount: number;
    upsertedId: BsonObjectID;
}

export interface IApgMngUpdateManyResult {
    matchedCount: number;
    modifiedCount: number;
    upsertedCount: number;
    upsertedIds?: BsonObjectID[];
}