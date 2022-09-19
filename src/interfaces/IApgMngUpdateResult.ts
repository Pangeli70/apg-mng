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