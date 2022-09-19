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