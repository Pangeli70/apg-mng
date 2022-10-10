/** -----------------------------------------------------------------------
 * @module [Mng]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.2 [APG 2022/10/04] Github Beta
 * -----------------------------------------------------------------------
 */

import {
    Bson, MongoCollection, MongoFilter, MongoFindOpts, Rst, Uts
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
const COLLECTION_NAME = "Users";


const MOCK_USERS = {
    single:
    {
        username: "user1",
        password: "pass1",
        group: "group1"
    },
    many: [
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
        {
            username: "user5",
            password: "pass5",
            group: "group3"
        },
        {
            username: "user6",
            password: "pass6",
            group: "group3"
        },

    ]
}

export class ApgMngSpec extends Uts.ApgUtsSpecable {

    // Special find options settings if we are using Atlas
    private _findOptions: MongoFindOpts = {};
    private _dbMode: eApgMngMode;
    private _connector = new ApgMngConnector();
    private _users: MongoCollection<ApgUserSchema> | null = null;
    //private _log: string[] = [];

    private _singleInsertResult: TApgMngInsertResult;

    constructor(amode: eApgMngMode) {
        super(import.meta.url);
        this._dbMode = amode;

        // WARNING the following specs must run all in sequence because
        // every spec alters the dataset so every specification's correctness 
        // might depend on the previouses.
        this.flags = {
            [this.S01a_DeleteAll.name]: Uts.eApgUtsSpecRun.yes,

            [this.S02a_InsertOne.name]: Uts.eApgUtsSpecRun.yes,
            [this.S02b_Count.name]: Uts.eApgUtsSpecRun.yes,
            [this.S02c_InsertMany.name]: Uts.eApgUtsSpecRun.yes,

            [this.S03a_FindOneByID.name]: Uts.eApgUtsSpecRun.yes,
            [this.S03b_FindOneByFilter.name]: Uts.eApgUtsSpecRun.yes,
            [this.S03c_FindAllDescSorted.name]: Uts.eApgUtsSpecRun.yes,
            [this.S03d_FindAllAndSkipSome.name]: Uts.eApgUtsSpecRun.yes,
            [this.S03e_FindAllAndLimitToFirstN.name]: Uts.eApgUtsSpecRun.yes,

            [this.S04a_CountWithFilter.name]: Uts.eApgUtsSpecRun.yes,
            [this.S04b_CountByAggregateWithSkipOption.name]: Uts.eApgUtsSpecRun.yes,

            [this.S05a_UpdateSingle.name]: Uts.eApgUtsSpecRun.yes,
            [this.S05b_UpdateMany.name]: Uts.eApgUtsSpecRun.yes,

            [this.S06a_DeleteSingleById.name]: Uts.eApgUtsSpecRun.yes,
            [this.S06b_DeleteManyByFilter.name]: Uts.eApgUtsSpecRun.yes,
        }
    }


    override async specExecute() {
        // Clear database
        await this.S01a_DeleteAll();
        // Pupulate
        await this.S02a_InsertOne();
        await this.S02b_Count();
        await this.S02c_InsertMany();
        // Search
        await this.S03a_FindOneByID();
        await this.S03b_FindOneByFilter();
        await this.S03c_FindAllDescSorted();
        await this.S03d_FindAllAndSkipSome();
        await this.S03e_FindAllAndLimitToFirstN();
        // Aggregate
        await this.S04a_CountWithFilter();
        await this.S04b_CountByAggregateWithSkipOption();
        // Update
        await this.S05a_UpdateSingle();
        await this.S05b_UpdateMany();
        // Delete specific
        await this.S06a_DeleteSingleById();
        await this.S06b_DeleteManyByFilter();
    }

    override async specMockInit() {

        const r = await super.specMockInit();

        this._connector = new ApgMngConnector();

        const rst = await this._connector.connect(this._dbMode, DB_NAME);

        if (!rst.Ok) {
            r.message = "Impossibile to connect to database: " + rst.AsImmutableIApgRst.error;
        } else {
            r.payload = rst.getPayload(ApgMngConnector.DENO_RES_SIGNATURE);

            this._users = this._connector.getCollection<ApgUserSchema>(COLLECTION_NAME);
            if (!this._users) {
                r.message = "Users collection not connected";
            }
        }

        return r;
    }

    override async specMockEnd() {
        const r = await super.specMockEnd();
        const rst = this._connector.disconnect();
        r.payload = rst.getPayload(ApgMngConnector.DENO_RES_SIGNATURE);
        r.message = "Mongo Db disconnection completed";
        return r;
    }

    async S01a_DeleteAll() {

        let r = this.specInit(this.S01a_DeleteAll.name);
        if (!r) return;

        this.specWhen(`we want to delete all the users from the test collection`);
        this.specWeExpect(`to get more than one deletion`);

        const tr = await this.#deleteAll(this._users!);
        const n = tr.ok ? tr.ir! : 0;
        r = n > 0;

        this.specWeGot(`[${n}] deletions`, r);
        this.specResume();

    }

    async S02a_InsertOne() {

        let r = this.specInit(this.S02a_InsertOne.name);
        if (!r) return;

        this.specWhen(`we want to insert one user into the test collection`);
        this.specWeExpect(`to get a positive result`);

        const tr = await this.#insertOne(this._users!);
        r = tr.ir != undefined;
        this._singleInsertResult = tr.ir!;

        this.specWeGot(`One insertion`, r);
        this.specResume();
    }

    async S02b_Count() {

        let r = this.specInit(this.S02b_Count.name);
        if (!r) return;

        this.specWhen(`we want to count items in the collection after a single insertion`);
        this.specWeExpect(`to get 1 as result`);

        const tr = await this.#countUnfiltered(this._users!);
        const n = tr.ok ? tr.ir : 0;
        r = n === 1;

        this.specWeGot(`[${n}]`, r);
        this.specResume();

    }

    async S02c_InsertMany() {

        let r = this.specInit(this.S02c_InsertMany.name);
        if (!r) return;

        this.specWhen(`we want to insert many users into the test collection`);
        this.specWeExpect(`to get [${MOCK_USERS.many.length}] insertions`);

        const tr = await this.#insertMany(this._users!);
        const n = tr.ok ? tr.ir!.insertedCount : 0;
        r = n > 0;

        this.specWeGot(`[${n}] insertions`, r);

        this.specWeExpect(`to get [${MOCK_USERS.many.length + 1}] total items`);
        const tr2 = await this.#countUnfiltered(this._users!);
        const n2 = tr2.ok ? tr.ir : 0;

        this.specWeGot(`[${n2}]`, r);
        this.specResume();

    }

    async S03a_FindOneByID() {
        let r = this.specInit(this.S03a_FindOneByID.name);
        if (!r) return;

        r = this._singleInsertResult !== undefined;
        if (!r) {
            this.specSkip(
                Uts.eApgUtsSpecRun.no,
                `We need the result of ${this.S02a_InsertOne.name} to run this spec.`
            );
            return
        }

        this.specWhen(`we want to find one user into the test collection by object ID`);
        this.specWeExpect(`to get a the user with name [${MOCK_USERS.single.username}]`);

        const tr = await this.#findByID(this._users!, this._singleInsertResult!);
        const userName = tr.ir ? tr.ir.username : "undefined";
        r = userName == MOCK_USERS.single.username;

        this.specWeGot(`the user with username [${userName}]`, r);
        this.specResume();
    }

    async S03b_FindOneByFilter() {

        const USER_NAME = MOCK_USERS.many[1].username;
        const PASSWORD = MOCK_USERS.many[1].password;

        let r = this.specInit(this.S03b_FindOneByFilter.name);
        if (!r) return;

        this.specWhen(`we want to find one user with a specific password [${PASSWORD}]`);
        this.specWeExpect(`to get a the user with name [${USER_NAME}]`);

        const tr = await this.#findByFilter(this._users!, { password: PASSWORD });
        const userName = tr.ok ? tr.ir!.username : "undefined";
        r = userName == USER_NAME;

        this.specWeGot(`A user whose name is [${userName}]`, r);

        this.specResume();
    }

    async S03c_FindAllDescSorted() {
        const COUNT = MOCK_USERS.many.length + 1;

        let r = this.specInit(this.S03c_FindAllDescSorted.name);
        if (!r) return;

        this.specWhen(`we want retrieve all the users from the collection`);
        this.specWeExpect(`to get [${COUNT}] items`);

        const tr = await this.#getAllDescSortedByUserName(this._users!);
        const n = tr.ir ? tr.ir!.length : 0;
        r = n == COUNT;
        this.specWeGot(`[${n}] users`, r);

        this.specWeExpect(`that users[0] is greater than users[1]`);
        r = tr.ir![0].username > tr.ir![1].username;

        this.specWeGot(`[${tr.ir![0].username}] > [${tr.ir![1].username}]`, r);
        this.specResume();

    }

    async S03d_FindAllAndSkipSome() {
        const SKIP_NUM = 2;
        const TOTAL_NUM = MOCK_USERS.many.length + 1;
        const RES_NUM = TOTAL_NUM - SKIP_NUM;

        let r = this.specInit(this.S03d_FindAllAndSkipSome.name);
        if (!r) return;

        this.specWhen(`we want to find some users skipping the first [${SKIP_NUM}]`);
        this.specWeExpect(`to get an array of users with length [${RES_NUM}]`);

        const tr = await this._users!.find(undefined, { noCursorTimeout: false }).skip(SKIP_NUM).toArray();
        const n = (tr) ? tr!.length : 0;
        r = n == RES_NUM;

        this.specWeGot(`[${n}] items`, r);
        this.specResume();
    }

    async S03e_FindAllAndLimitToFirstN() {
        const LIMIT_NUM = 3;

        let r = this.specInit(this.S03e_FindAllAndLimitToFirstN.name);
        if (!r) return;

        this.specWhen(`we want to find some users limiting the result to the first [${LIMIT_NUM}]`);
        this.specWeExpect(`to get an array of users with length [${LIMIT_NUM}]`);

        const tr = await this._users!.find(undefined, { noCursorTimeout: false }).limit(LIMIT_NUM).toArray();
        const n = (tr) ? tr!.length : 0;
        r = n == LIMIT_NUM;

        this.specWeGot(`[${n}] items`, r);
        this.specResume();
    }

    async S04a_CountWithFilter() {
        const GROUP_NAME = MOCK_USERS.many[2].group;
        const EXPECT_NUM = 2;

        let r = this.specInit(this.S04a_CountWithFilter.name);
        if (!r) return;

        this.specWhen(`we want to count all the items in the collection of the group [${GROUP_NAME}]`);
        this.specWeExpect(`to get [${EXPECT_NUM}] items`);

        const tr = await this.#countFiltered(this._users!, { group: GROUP_NAME });
        const n = (tr.ok) ? tr.ir! : 0;
        r = n == EXPECT_NUM

        this.specWeGot(`[${n}]`, r);
        this.specResume();
    }

    async S04b_CountByAggregateWithSkipOption() {
        const SKIP_NUM = 3;
        const EXPECT_NUM = MOCK_USERS.many.length + 1 - SKIP_NUM

        let r = this.specInit(this.S04b_CountByAggregateWithSkipOption.name);
        if (!r) return;

        this.specWhen(`we want count the items in the collection skipping [${SKIP_NUM}] of them`);
        this.specWeExpect(`to get [${EXPECT_NUM}]`);

        const tr = await this.#countWithSkipOption(this._users!, SKIP_NUM);
        const n = (tr.ok) ? tr.ir : 0;
        r = n == EXPECT_NUM

        this.specWeGot(`[${n}]`, r);
        this.specResume();

    }

    async S05a_UpdateSingle() {
        const NEW_PWD = "newPassword";

        let r = this.specInit(this.S05a_UpdateSingle.name);
        if (!r) return;

        this.specWhen(`we want to update the password of the user named ${MOCK_USERS.single.username}`);
        this.specWeExpect(`to get the old [${MOCK_USERS.single.password}] and the new value [${NEW_PWD}]`);

        const tr = await this.#updateOne(this._users!, { username: MOCK_USERS.single.username });
        const n = tr.ok ? tr.ir!.modifiedCount : 0;
        r = n == 1;

        this.specWeGot(`[${n}] items modified.`, r);
        this.specResume();
    }

    async S05b_UpdateMany() {
        const NEW_GROUP = "newGroup";
        const OLD_GROUP = MOCK_USERS.many[2].group;
        const UPDATED_NUM = 2;

        let r = this.specInit(this.S05b_UpdateMany.name);
        if (!r) return;

        this.specWhen(`we want to update the group of the users in ${OLD_GROUP}`);
        this.specWeExpect(`to get [${UPDATED_NUM}] records updated with the new value [${NEW_GROUP}]`);

        const tr = await this.#updateMany(this._users!, { group: OLD_GROUP });
        const n = tr.ok ? tr.ir!.modifiedCount : 0;
        r = n == UPDATED_NUM;

        this.specWeGot(`[${n}] items modified.`, r);
        this.specResume();
    }

    async S06a_DeleteSingleById() {

        let r = this.specInit(this.S06a_DeleteSingleById.name);
        if (!r) return;

        r = this._singleInsertResult !== undefined;
        if (!r) {
            this.specSkip(
                Uts.eApgUtsSpecRun.no,
                `We need the result of ${this.S02a_InsertOne.name} to run this spec.`
            );
            return
        }

        this.specWhen(`we want to delete one user into the test collection by object ID`);
        this.specWeExpect(`to get the get [1] in the delete count result`);

        const tr = await this.#deleteByID(this._users!, this._singleInsertResult!);
        const n = tr.ok ? tr.ir : 0;
        r = n == 1;

        this.specWeGot(`[${n}] deletion`, r);
        this.specResume();

    }

    async S06b_DeleteManyByFilter() {
        const EXPECT_NUM = 2;
        const GROUP = MOCK_USERS.many[2].group;
        const FILTER = { group: "group3" };

        let r = this.specInit(this.S06b_DeleteManyByFilter.name);
        if (!r) return;

        this.specWhen(`we want to delete the users that are in the group [${GROUP}]`);
        this.specWeExpect(`to get the get [${EXPECT_NUM}] in the delete count result`);

        const tr = await this.#deleteByFilter(this._users!, FILTER);
        const n = tr.ok ? tr.ir : 0;
        r = n == EXPECT_NUM;

        this.specWeGot(`[${n}] deletion`, r);
        this.specResume();
    }


    /**
 // aggregation
        try {

            const _docs = await this._users!.aggregate([
                { $match: { username: "many" } },
                { $group: { _id: "$username", total: { $sum: 1 } } }

            ]);

        } catch (e) {

        }
     */

    async #insertOne(ausers: ApgUsersDbCollection) {
        const r: { ir?: TApgMngInsertResult, im?: string, ok: boolean } = { ok: true };
        try {
            r.ir = await ausers.insertOne(MOCK_USERS.single);
        }
        catch (e) {
            r.im = e.message;
            r.ok = false;
        }
        return r;
    }

    async #insertMany(ausers: ApgUsersDbCollection) {
        const r: { ir?: TApgMngMultipleInsertResult, im?: string, ok: boolean } = { ok: true };
        try {
            r.ir = await ausers.insertMany(MOCK_USERS.many);
        }
        catch (e) {
            r.im = e.message;
            r.ok = false;
        }
        return r;
    }

    async #findByID(
        ausers: ApgUsersDbCollection,
        auserId: { $oid: string; } | Bson.ObjectId,
    ) {
        const filter = { _id: auserId };
        const r: { ir?: ApgUserSchema, im?: string, ok: boolean } = { ok: true };
        try {
            r.ir = await ausers.findOne(filter, this._findOptions);
            if (!r.ir) {
                r.im = "User not found";
            }
        }
        catch (e) {
            r.im = e.message;
            r.ok = false
        }
        return r;
    }

    async #findByFilter(
        ausers: ApgUsersDbCollection,
        afilter: MongoFilter<ApgUserSchema>
    ) {
        const r: { ir?: ApgUserSchema, im?: string, ok: boolean } = { ok: true };
        try {
            r.ir = await ausers.findOne(afilter, this._findOptions);
            if (!r.ir) {
                r.im = "User not found";
            }
        }
        catch (e) {
            r.im = e.message;
            r.ok = false
        }
        return r;
    }

    async #deleteByID(
        ausers: ApgUsersDbCollection,
        auserID: { $oid: string; } | Bson.ObjectId
    ) {
        const filter = { _id: auserID }
        const r: { ir?: number, im?: string, ok: boolean } = { ok: true };
        try {
            r.ir = await ausers.deleteOne(filter);
            if (r.ir === 0) {
                r.im = "User not found";
            }
        } catch (e) {
            r.im = e.message;
            r.ok = false;
        }
        return r;
    }

    async #deleteByFilter(
        ausers: ApgUsersDbCollection,
        afilter: MongoFilter<ApgUserSchema>
    ) {
        const r: { ir?: number, im?: string, ok: boolean } = { ok: true };
        try {
            r.ir = await ausers.deleteMany(afilter);
            if (r.ir === 0) {
                r.im = "Users not found";
            }
        } catch (e) {
            r.im = e.message;
            r.ok = false;
        }
        return r;
    }

    async #countWithSkipOption(ausers: ApgUsersDbCollection, askipNum: number) {

        const r: { ir?: number, im?: string, ok: boolean } = { ok: true };
        try {
            const cursor = ausers.aggregate([
                { $skip: askipNum },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 }
                    }
                }
            ]);
            const tr = <any>await cursor.toArray()
            r.ir = tr[0].total;
        } catch (e) {
            r.im = e.message;
            r.ok = false;
        }
        return r;
    }

    async #countFiltered(
        ausers: ApgUsersDbCollection,
        afilter: MongoFilter<ApgUserSchema>
    ) {
        const r: { ir?: number, im?: string, ok: boolean } = { ok: true };
        try {
            r.ir = await ausers.countDocuments(afilter);
        } catch (e) {
            r.im = e.message;
            r.ok = false;
        }
        return r;
    }

    async #countUnfiltered(
        ausers: ApgUsersDbCollection
    ) {
        const r: { ir?: number, im?: string, ok: boolean } = { ok: true };
        try {
            r.ir = await ausers.countDocuments();
        } catch (e) {
            r.im = e.message;
            r.ok = false;
        }
        return r;
    }

    async #deleteAll(
        ausers: ApgUsersDbCollection
    ) {
        const r: { ir?: number, im?: string, ok: boolean } = { ok: true };
        try {
            r.ir = await ausers.deleteMany({});
        }
        catch (e) {
            r.im = e.message;
            r.ok = false;
        }
        return r;
    }

    async #updateOne(
        ausers: ApgUsersDbCollection,
        afilter: MongoFilter<ApgUserSchema>
    ) {
        const r: { ir?: IApgMngUpdateOneResult, im?: string, ok: boolean } = { ok: true };
        const newVal = { $set: { username: "USERNAME1" } }
        try {
            r.ir = await ausers.updateOne(afilter, newVal);
            if (r.ir.matchedCount == 0) {
                r.im = "User not found"
            }
        } catch (e) {
            r.im = e.message;
            r.ok = false;
        }
        return r;
    }

    async #updateMany(
        ausers: ApgUsersDbCollection,
        afilter: MongoFilter<ApgUserSchema>
    ) {
        const r: { ir?: IApgMngUpdateManyResult, im?: string, ok: boolean } = { ok: true };
        const newVal = { $set: { group: "GROUP2A" } };
        try {
            r.ir = await ausers.updateMany(afilter, newVal);
        } catch (e) {
            r.im = e.message;
            r.ok = false;
        }
        return r;
    }

    async #getAllDescSortedByUserName(
        ausers: ApgUsersDbCollection
    ) {
        const r: { ir?: ApgUserSchema[], im?: string, ok: boolean } = { ok: true };
        try {
            r.ir = await ausers
                .find({}, this._findOptions)
                .toArray();
            r.ir.sort((a, b) => {
                return (a.username < b.username) ? 1 : (a.username > b.username) ? -1 : 0;
            });
        } catch (e) {
            r.im = e.message;
            r.ok = false;
        }
        return r;
    }

}