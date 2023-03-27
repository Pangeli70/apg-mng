/** -----------------------------------------------------------------------
 * @module [Mng]
 * @author [APG] ANGELI Paolo Giusto
 * ------------------------------------------------------------------------
 */

// https://deno.land/std
export * as StdFs from "https://deno.land/std@0.180.0/fs/mod.ts";
export * as StdPath from "https://deno.land/std@0.180.0/path/mod.ts";


// TODO @1 remove this and upgrade to https://deno.land/std@0.180.0/dotenv/mod.ts -- APG 20230318
// https://deno.land/x/dotenv
export * as DotEnv from "https://deno.land/x/dotenv@v3.2.0/mod.ts";

// https://deno.land/x/mongo
export {
    Bson,
    MongoClient,
    Database as MongoDatabase,
    Collection as MongoCollection
} from "https://deno.land/x/mongo@v0.31.1/mod.ts";

export type {
    FindOptions as MongoFindOpts,
    CountOptions as MongoCountOpts,
    ConnectOptions as MongoConnOpts,
    Filter as MongoFilter,
} from "https://deno.land/x/mongo@v0.31.1/mod.ts";

//deno.land/x/web_bson
export {
    ObjectId as BsonObjectID
} from 'https://deno.land/x/web_bson@v0.1.10/src/bson.ts';

// https://github

export * as Uts from "https://raw.githubusercontent.com/Pangeli70/apg-uts/master/mod.ts";
export * as Rst from "https://raw.githubusercontent.com/Pangeli70/apg-rst/master/mod.ts";

// export * as Uts from "../apg-uts/mod.ts";
// export * as Rst from "../apg-rst/mod.ts";