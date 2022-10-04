/** -----------------------------------------------------------------------
 * @module [Mng]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.2 [APG 2022/10/04] Github Beta
 * -----------------------------------------------------------------------
 */

import {
    Bson, MongoCollection, FindOptions, CountOptions
} from "../deps.ts";

import {
    TApgMngInsertResult,
    TApgMngMultipleInsertResult,
    IApgMngUpdateManyResult,
    IApgMngUpdateOneResult,
    eApgMngMode
} from "../mod.ts"
import { ApgMngConnector } from "../src/classes/ApgMngConnector.ts";



// Defining schema interface
interface ApgUserSchema {
    _id: { $oid: string };
    username: string;
    password: string;
    group: string;
}

type ApgUsersDbCollection = MongoCollection<ApgUserSchema>;

const DB_NAME = "ApgTest";
const COLLECTION = "Users";

export class ApgMngTester {

    // Special find options settings if we are using Atlas
    private _findOptions: FindOptions = {};

    async run(amode: eApgMngMode) {

        const log: string[] = [];

        const connector = new ApgMngConnector();

        await connector.connect(amode, DB_NAME);
        const users = connector.getCollection<ApgUserSchema>(COLLECTION);
        if (!users) {
            log.push("Users collection not connected")
            return log;
        }
        // Clear all the data
        const _deletedDocuments = await this.deleteAllUsers(users, log);

        // insert
        const singleInsertResult = await this.insertUser(users, log);

        // insertMany
        const _inserMany = await this.insertManyUsers(users, log);

        // findOne by ID
        if (singleInsertResult) {
            const _userById = await this.findUserByID(singleInsertResult, users, log);
        }

        // Get all users
        const _allUsers = await this.getAllUsers(users, log);

        // Count with filter
        const _filteredCount = await this.countFilteredUsers(users, log);

        // Count with options
        const _countUsersWithSkip = await this.countUsersWithOption(users, log);

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
        const _updateSingleResult = await this.updateSingleUser(users, log);

        // updateMany
        const _multipleUpdateResult = await this.updateMultipleUsers(users, log);

        // deleteOne by Id
        if (singleInsertResult) {
            const _deleteUserResult = await this.deleteUserByID(singleInsertResult, users, log);
        }

        // Delete Many by filter
        const _deleteCount2 = await users.deleteMany({ username: "test" });

        // Find with Skip and sort is useful for pagination
        const _skipTwo = await users.find(undefined, { noCursorTimeout: false }).skip(2).toArray();

        // Find with Limit and sort is useful for pagination
        const _featuredUser = await users.find(undefined, { noCursorTimeout: false }).limit(2).toArray();

        connector.disconenct();
        return log;
        
    }

    async insertUser(
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

    async insertManyUsers(
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

    async findUserByID(
        userId: { $oid: string; } | Bson.ObjectId,
        ausers: ApgUsersDbCollection,
        alog: string[]
    ): Promise<ApgUserSchema | undefined> {

        let r: ApgUserSchema | undefined;
        try {

            r = await ausers
                .findOne({ _id: userId }, this._findOptions);
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

    async deleteUserByID(
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

    async countUsersWithOption(
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

    async countFilteredUsers(
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

    async deleteAllUsers(
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

    async updateSingleUser(
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

    async updateMultipleUsers(
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

    async getAllUsers(
        ausers: ApgUsersDbCollection,
        alog: string[]
    ): Promise<ApgUserSchema[] | undefined> {

        let r: ApgUserSchema[] | undefined;

        try {
            r = await ausers
                .find({}, this._findOptions)
                .toArray();
            alog.push("Find all result: " + r!.length);
        } catch (e) {
            alog.push("Find all error: " + JSON.stringify(e));
        }

        return r;
    }

}