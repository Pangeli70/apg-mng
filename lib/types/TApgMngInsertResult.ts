/** -----------------------------------------------------------------------
 * @module [apg-mng]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.2 [APG 2022/10/04] Github Beta
 * @version 0.9.7 [APG 2023/05/21] Separation of concerns lib/srv
 * -----------------------------------------------------------------------
*/
import { Mongo } from '../deps.ts';

export type TApgMngInsertResult =
    { $oid: string } |
    Mongo.Bson.ObjectId |
    undefined;

export type TApgMngMultipleInsertResult =
    {
        insertedIds: TApgMngInsertResult[],
        insertedCount: number
    } |
    undefined;