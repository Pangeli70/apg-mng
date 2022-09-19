/** -----------------------------------------------------------------------
 * @module [Mng]
 * @author [APG] ANGELI Paolo Giusto
 * ------------------------------------------------------------------------
 */

// https://deno.land/std
export * as StdFs from "https://deno.land/std@0.153.0/fs/mod.ts";
export * as StdPath from "https://deno.land/std@0.153.0/path/mod.ts";

// https://deno.land/x/mongo
export {
    Bson,
    MongoClient,
    Database as MongoDatabase,
    Collection as MongoCollection
} from "https://deno.land/x/mongo@v0.29.3/mod.ts";

export type {
    FindOptions,
    CountOptions,
    ConnectOptions
} from "https://deno.land/x/mongo@v0.29.3/mod.ts";

//deno.land/x/web_bson
export {
    ObjectId as BsonObjectID
} from 'https://deno.land/x/web_bson@v0.1.10/src/bson.ts';

// https://github
export * as Uts from "https://raw.githubusercontent.com/Pangeli70/apg-uts/master/mod.ts";
export * as Rst from "https://raw.githubusercontent.com/Pangeli70/apg-rst/master/mod.ts";