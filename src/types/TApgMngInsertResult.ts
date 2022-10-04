/** -----------------------------------------------------------------------
 * @module [Mng]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.2 [APG 2022/10/04] Github Beta
 * -----------------------------------------------------------------------
*/
import { Bson } from '../../deps.ts';

export type TApgMngInsertResult =
    { $oid: string } |
    Bson.ObjectId |
    undefined;

export type TApgMngMultipleInsertResult =
    {
        insertedIds: TApgMngInsertResult[],
        insertedCount: number
    } |
    undefined;