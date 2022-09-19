import {
    Bson, MongoClient, MongoDatabase, MongoCollection, FindOptions, CountOptions
} from "../deps.ts";

import {
    TApgMngInsertResult,
    TApgMngMultipleInsertResult,
    IApgMngUpdateManyResult,
    IApgMngUpdateOneResult,
    ApgMngService
} from "../mod.ts"
import { ApgTestsSpecable } from "../../Tests/mod.ts";

type InsertResult =
    { $oid: string } |
    Bson.ObjectId |
    undefined;

type MultipleInsertResult =
    {
        insertedIds: InsertResult[],
        insertedCount: number
    } |
    undefined;

interface ISingleUpdateResult {

    upsertedId: Bson.ObjectId | undefined;
    upsertedCount: number;
    matchedCount: number;
    modifiedCount: number;

}

interface IMultipleUpdateResult {

    upsertedIds: Bson.ObjectId[] | undefined;
    upsertedCount: number;
    matchedCount: number;
    modifiedCount: number;

}

// Defining schema interface
interface ApgUserSchema {
    _id: { $oid: string };
    username: string;
    password: string;
    group: string;
}

type ApgUsersDbCollection = MongoCollection<ApgUserSchema>;


const envVars = {
    u: "APG",
    p: "Fabi-1175"
}

// Set connection to Local Database or Atlas
const IS_MONGO_DB_ATLAS = true;

// Special find options settings if we are using Atlas
const MONGO_DB_FIND_OPTIONS: FindOptions = IS_MONGO_DB_ATLAS ? { noCursorTimeout: false } : {};


export class ApgMngDataServiceSpec extends ApgTestsSpecable {

    async testMongo() {

        const log: string[] = [];

        const dbClient = new MongoClient();

        // Connections status to the Mongo Database
        // const mongoDBConnected = await connectToDatabase(client, log);

        ApgMngService.SetupAtlasConnection(
            "apgmongodbatlas-shard-00-02.okfw3.mongodb.net",
            envVars.u,
            envVars.p,
            "ApgSisalMongoDb"
        );

        const res = await ApgMngService.InitClient(dbClient);
        let mongoDBConnected = res.ok;

        if (!mongoDBConnected) {
            log.push("Mongo DB Atlas NOT connected!!! Check atlas service")
            ApgMngService.SetupLocalConnection(
                "ApgSisalMongoDb"
            );

            const res = await ApgMngService.InitClient(dbClient);
            mongoDBConnected = res.ok;

            if (!mongoDBConnected) {

                log.push("testMongo error: Mongo DB not connected");
                return log;
            } else {

                log.push("Mongo DB Local connected")
            }
        } else {

            log.push("Mongo DB Atlas connected")
        }

        let db: MongoDatabase | undefined = undefined;
        let users: ApgUsersDbCollection | undefined = undefined;

        if (mongoDBConnected) {
            db = dbClient.database("TS2");
            users = db.collection<ApgUserSchema>("Users");
        }

        if (users == undefined) {
            log.push("testMongo error: Users collection not initialized");
            return log;
        }
        log.push("Users collection connected")

        // Clear all the data
        const _deletedDocuments = await this.deleteAllUsersTest(users, log);

        // insert
        const singleInsertResult = await this.insertUserTest(users, log);

        // insertMany
        const _inserMany = await this.insertManyUsersTest(users, log);

        // findOne by ID
        if (singleInsertResult) {
            const _userById = await this.findUserByIDTest(singleInsertResult, users, log);
        }

        // Get all users
        const _allUsers = await this.getAllUsersTest(users, log);

        // Count with filter
        const _filteredCount = await this.countFilteredUsersTest(users, log);

        // Count with options
        const _countUsersWithSkip = await this.countUsersWithOptionTest(users, log);

        // aggregation
        try {

            const _docs = await users.aggregate([
                { $match: { username: "many" } },
                { $group: { _id: "$username", total: { $sum: 1 } } }

            ]);

        } catch (e) {
            log.push("Aggregate error: " + JSON.stringify(e));
        }

        // updateOne
        const _updateSingleResult = await this.updateSingleUserTest(users, log);

        // updateMany
        const _multipleUpdateResult = await this.updateMultipleUsersTest(users, log);

        // deleteOne by Id
        if (singleInsertResult) {
            const _deleteUserResult = await this.deleteUserByIDTest(singleInsertResult, users, log);
        }

        // Delete Many by filter
        const _deleteCount2 = await users.deleteMany({ username: "test" });

        // Find with Skip and sort is useful for pagination
        const _skipTwo = await users.find(undefined, { noCursorTimeout: false }).skip(2).toArray();

        // Find with Limit and sort is useful for pagination
        const _featuredUser = await users.find(undefined, { noCursorTimeout: false }).limit(2).toArray();

        return log;
    }


    async connectToDatabase(
        aclient: MongoClient,
        alog: string[]
    ): Promise<boolean> {

        let r = false;

        if (IS_MONGO_DB_ATLAS) {
            //Connecting to an Atlas Database
            try {

                const dbName = "ApgSisalMongoDb";
                const authMechanism = "SCRAM-SHA-1";

                // Connect using Connection string: verified 20220623
                // const protocol = "mongodb+srv";
                // const altlasClusterUrl = "apgmongodbatlas.okfw3.mongodb.net";
                //const connectionString = `${protocol}://${envVars.u}:${envVars.p}@${altlasClusterUrl}/${dbName}?authMechanism=${authMechanism}`;
                // await aclient.connect(connectionString);

                // await aclient.connect("mongodb+srv://APG:Fabi-1175@apgmongodbatlas.okfw3.mongodb.net/ApgSisalMongoDb?authMechanism=SCRAM-SHA-1");

                // Connect using config object: verified 20220623
                // Verify On Atlas website and not using compass which is the primary
                const primaryShardNode = "apgmongodbatlas-shard-00-02.okfw3.mongodb.net"
                await aclient.connect({
                    db: dbName,
                    tls: true,
                    servers: [
                        {
                            // THIS MUST BE PRIMARY MASTER SHARD NODE!!!!
                            host: primaryShardNode,
                            port: 27017,
                        },
                    ],
                    credential: {
                        username: envVars.u,
                        password: envVars.p,
                        db: dbName,
                        mechanism: authMechanism
                    },
                });
                r = true;
            } catch (e) {
                alog.push("Mongo DB Atlas connection error: " + e);
            }
        }
        else {
            //Connecting to a Local Database
            try {
                /*await client.connect("mongodb://127.0.0.1:27017");*/
                await aclient.connect({
                    db: "TS2",
                    tls: false,
                    servers: [
                        {
                            host: "127.0.0.1",
                            port: 27017,
                        },
                    ],
                });
                r = true;
            } catch (e) {
                alog.push("Mongo DB Local connection error: " + e);
            }
        }
        return r;
    }


    async insertUserTest(
        ausers: ApgUsersDbCollection,
        alog: string[]
    ): Promise<TApgMngInsertResult> {

        let r: TApgMngInsertResult;

        try {
            r = await ausers.insertOne({
                username: "user1",
                password: "pass1",
                group: "group1"
            });
            alog.push("Insert one result: " + JSON.stringify(r));
        }
        catch (e) {
            alog.push("Insert one error: " + JSON.stringify(e));
        }

        return r;
    }

    async insertManyUsersTest(
        ausers: ApgUsersDbCollection,
        alog: string[]
    ): Promise<TApgMngMultipleInsertResult> {

        let r: TApgMngMultipleInsertResult;
        try {

            r = await ausers.insertMany([
                {
                    username: "user2",
                    password: "pass2",
                    group: "group1"
                },
                {
                    username: "user3",
                    password: "pass3",
                    group: "group2"
                },
                {
                    username: "user4",
                    password: "pass4",
                    group: "group2"
                },
            ]);
            alog.push("Insert many result: " + JSON.stringify(r.insertedCount));
        }
        catch (e) {
            alog.push("Insert many error: " + JSON.stringify(e));
        }

        return r;
    }

    async findUserByIDTest(
        userId: { $oid: string; } | Bson.ObjectId,
        ausers: ApgUsersDbCollection,
        alog: string[]
    ): Promise<ApgUserSchema | undefined> {

        let r: ApgUserSchema | undefined;
        try {

            r = await ausers
                .findOne({ _id: userId }, MONGO_DB_FIND_OPTIONS);
            if (r) {
                alog.push("Find one by ID result: " + r.username);
            }
            else {
                alog.push("Find one by ID result: User not found");
            }
        }
        catch (e) {
            alog.push("Find one by ID error: " + JSON.stringify(e));
        }

        return r;
    }

    async deleteUserByIDTest(
        auserID: { $oid: string; } | Bson.ObjectId,
        ausers: ApgUsersDbCollection,
        alog: string[]
    ): Promise<number> {

        let r = 0;

        try {
            r = await ausers.deleteOne({ _id: auserID });
            if (r !== 0) {
                alog.push("Delete One result: " + auserID);
            }
            else {
                alog.push("Delete One result: User not found");
            }
        } catch (e) {
            alog.push("Delete one error: " + JSON.stringify(e));
        }

        return r;
    }

    async countUsersWithOptionTest(
        ausers: ApgUsersDbCollection,
        alog: string[]
    ): Promise<number> {

        const COUNT_OPTIONS: CountOptions = { skip: 1 };
        let r = 0;

        try {
            r = await ausers.count({}, COUNT_OPTIONS);
            alog.push("Count filtered result: " + r);
        } catch (e) {
            alog.push("Count with options error: " + JSON.stringify(e));
        }

        return r;
    }

    async countFilteredUsersTest(
        ausers: ApgUsersDbCollection,
        alog: string[]
    ): Promise<number> {

        let r = 0;

        try {
            r = await ausers.countDocuments({ group: "group2" });
            alog.push("Count filtered result: " + r);
        } catch (e) {
            alog.push("Count filtered error: " + JSON.stringify(e));
        }

        return r;
    }

    async deleteAllUsersTest(
        ausers: ApgUsersDbCollection,
        alog: string[]
    ): Promise<number> {

        let r = 0;
        try {
            r = await ausers.deleteMany({});
            alog.push("Delete all result: " + r);
        }
        catch (e) {
            alog.push("Delete all error: " + JSON.stringify(e));
        }

        return r;
    }

    async updateSingleUserTest(
        ausers: ApgUsersDbCollection,
        alog: string[]
    ): Promise<IApgMngUpdateOneResult | undefined> {

        let r: IApgMngUpdateOneResult | undefined;

        try {
            r = await ausers.updateOne(
                { username: "user1" },
                { $set: { username: "USERNAME1" } }
            );
            alog.push("Update One result: " + JSON.stringify(r.modifiedCount));
        } catch (e) {
            alog.push("Update One error: " + JSON.stringify(e));
        }

        return r;
    }

    async updateMultipleUsersTest(
        ausers: ApgUsersDbCollection,
        alog: string[]
    ): Promise<IApgMngUpdateManyResult | undefined> {

        let r: IApgMngUpdateManyResult | undefined;

        try {
            r = await ausers.updateMany(
                { group: "grpup1" },
                { $set: { group: "GROUP1" } }
            );
            alog.push("Update many result: " + JSON.stringify(r.modifiedCount));
        } catch (e) {
            alog.push("Update many error: " + JSON.stringify(e));
        }

        return r;
    }

    async getAllUsersTest(
        ausers: ApgUsersDbCollection,
        alog: string[]
    ): Promise<ApgUserSchema[] | undefined> {

        let r: ApgUserSchema[] | undefined;

        try {
            r = await ausers
                .find({}, MONGO_DB_FIND_OPTIONS)
                .toArray();
            alog.push("Find all result: " + r!.length);
        } catch (e) {
            alog.push("Find all error: " + JSON.stringify(e));
        }

        return r;
    }

}