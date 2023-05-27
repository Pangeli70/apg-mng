/** -----------------------------------------------------------------------
 * @module [apg-mng]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.2 [APG 2022/10/04] Github Beta
 * @version 0.9.7 [APG 2023/05/21] Separation of concerns lib/srv
 * -----------------------------------------------------------------------
 */

import { Mongo, Spc, Rst, Mng, Uts } from "../deps.ts";



// Defining schema interface
interface ApgUserSchema {
    _id: { $oid: string };
    username: string;
    password: string;
    group: string;
}

type ApgUsersDbCollection = Mongo.Collection<ApgUserSchema>;

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

export class ApgMngSpec extends Spc.ApgSpcSpec {

    // Special find options settings if we are using Atlas
    private _findOptions: Mongo.FindOptions = {};
    private _dbMode: Mng.eApgMngMode;
    private _connector = new Mng.ApgMngConnector();
    private _users: Mongo.Collection<ApgUserSchema> | null = null;

    private _singleInsertResult: Mng.TApgMngInsertResult;

    constructor(amode: Mng.eApgMngMode) {
        super(import.meta.url);
        this._dbMode = amode;

        // WARNING the following specs must run all in sequence because
        // every spec alters the dataset so every specification's correctness 
        // might depend on the previouses.
        this.flags = {
            [this.S01a_DeleteAll.name]: Spc.eApgSpcRun.yes,

            [this.S02a_InsertOne.name]: Spc.eApgSpcRun.yes,
            [this.S02b_Count.name]: Spc.eApgSpcRun.yes,
            [this.S02c_InsertMany.name]: Spc.eApgSpcRun.yes,

            [this.S03a_FindOneByID.name]: Spc.eApgSpcRun.yes,
            [this.S03b_FindOneByFilter.name]: Spc.eApgSpcRun.yes,
            [this.S03c_FindAllDescSorted.name]: Spc.eApgSpcRun.yes,
            [this.S03d_FindAllAndSkipSome.name]: Spc.eApgSpcRun.yes,
            [this.S03e_FindAllAndLimitToFirstN.name]: Spc.eApgSpcRun.yes,

            [this.S04a_CountWithFilter.name]: Spc.eApgSpcRun.yes,
            [this.S04b_CountByAggregateWithSkipOption.name]: Spc.eApgSpcRun.yes,

            [this.S05a_UpdateSingle.name]: Spc.eApgSpcRun.yes,
            [this.S05b_UpdateMany.name]: Spc.eApgSpcRun.yes,

            [this.S06a_DeleteSingleById.name]: Spc.eApgSpcRun.yes,
            [this.S06b_DeleteManyByFilter.name]: Spc.eApgSpcRun.yes,
        }

        this.specifier.Mode = Uts.eApgUtsLogMode.silent;
    }


    override async execute() {

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

    override async mockInit() {

        let r = await super.mockInit();

        this._connector = new Mng.ApgMngConnector();

        const options =
        {
            mongoHost: Deno.env.get("mongoHost") || "",
            user: Deno.env.get("user") || "",
            password: Deno.env.get("password") || "",
        }

        const rst = await this._connector.connect(this._dbMode, DB_NAME, options);

        if (!rst.ok) {
            r.message = "Impossibile to connect to database: " + rst.message;
        } else {
            r = Rst.ApgRst.CheckPayload(rst, Mng.ApgMngConnector.DENO_RES_SIGNATURE);

            this._users = this._connector.getCollection<ApgUserSchema>(COLLECTION_NAME);
            if (!this._users) {
                r.ok = false;
                r.payload = undefined;
                r.message = "Users collection not connected";
            }
        }

        return r;
    }

    override async mockEnd() {

        let r = await super.mockEnd();
        const rst = this._connector.disconnect();
        r = Rst.ApgRst.CheckPayload(rst, Mng.ApgMngConnector.DENO_RES_SIGNATURE);
        r.message = "Mongo Db disconnection completed";
        return r;

    }

    async S01a_DeleteAll() {

        const spec = this.specifier;

        let r = spec.Init(this.S01a_DeleteAll.name, this.flags);
        if (!r) return;

        spec.When(`we want to delete all the users from the test collection`);
        spec.WeExpect(`to get more than one deletion`);

        const tr = await this.#deleteAll(this._users!);
        const n = tr.ok ? tr.ir! : 0;
        r = n > 0;

        spec.WeGot(`[${n}] deletions`, r);
        spec.Resume();

    }

    async S02a_InsertOne() {

        const spec = this.specifier;

        let r = spec.Init(this.S02a_InsertOne.name, this.flags);
        if (!r) return;

        spec.When(`we want to insert one user into the test collection`);
        spec.WeExpect(`to get a positive result`);

        const tr = await this.#insertOne(this._users!);
        r = tr.ir != undefined;
        this._singleInsertResult = tr.ir!;

        spec.WeGot(`One insertion`, r);
        spec.Resume();
    }

    async S02b_Count() {

        const spec = this.specifier;
        let r = spec.Init(this.S02b_Count.name, this.flags);
        if (!r) return;

        spec.When(`we want to count items in the collection after a single insertion`);
        spec.WeExpect(`to get 1 as result`);

        const tr = await this.#countUnfiltered(this._users!);
        const n = tr.ok ? tr.ir : 0;
        r = n === 1;

        spec.WeGot(`[${n}]`, r);
        spec.Resume();

    }

    async S02c_InsertMany() {

        const spec = this.specifier;
        let r = spec.Init(this.S02c_InsertMany.name, this.flags);
        if (!r) return;

        spec.When(`we want to insert many users into the test collection`);
        spec.WeExpect(`to get [${MOCK_USERS.many.length}] insertions`);

        const tr = await this.#insertMany(this._users!);
        const n = tr.ok ? tr.ir!.insertedCount : 0;
        r = n > 0;

        spec.WeGot(`[${n}] insertions`, r);

        spec.WeExpect(`to get [${MOCK_USERS.many.length + 1}] total items`);
        const tr2 = await this.#countUnfiltered(this._users!);
        const n2 = tr2.ok ? tr.ir : 0;

        spec.WeGot(`[${n2}]`, r);
        spec.Resume();

    }

    async S03a_FindOneByID() {
        const spec = this.specifier;
        let r = spec.Init(this.S03a_FindOneByID.name, this.flags);
        if (!r) return;

        r = this._singleInsertResult !== undefined;
        if (!r) {
            spec.Skip(
                `We need the result of ${this.S02a_InsertOne.name} to run this spec.`
            );
            return
        }

        spec.When(`we want to find one user into the test collection by object ID`);
        spec.WeExpect(`to get a the user with name [${MOCK_USERS.single.username}]`);

        const tr = await this.#findByID(this._users!, this._singleInsertResult!);
        const userName = tr.ir ? tr.ir.username : "undefined";
        r = userName == MOCK_USERS.single.username;

        spec.WeGot(`the user with username [${userName}]`, r);
        spec.Resume();
    }

    async S03b_FindOneByFilter() {
        const spec = this.specifier;
        const USER_NAME = MOCK_USERS.many[1].username;
        const PASSWORD = MOCK_USERS.many[1].password;

        let r = spec.Init(this.S03b_FindOneByFilter.name, this.flags);
        if (!r) return;

        spec.When(`we want to find one user with a specific password [${PASSWORD}]`);
        spec.WeExpect(`to get a the user with name [${USER_NAME}]`);

        const tr = await this.#findByFilter(this._users!, { password: PASSWORD });
        const userName = tr.ok ? tr.ir!.username : "undefined";
        r = userName == USER_NAME;

        spec.WeGot(`A user whose name is [${userName}]`, r);

        spec.Resume();
    }

    async S03c_FindAllDescSorted() {
        const spec = this.specifier;
        const COUNT = MOCK_USERS.many.length + 1;

        let r = spec.Init(this.S03c_FindAllDescSorted.name, this.flags);
        if (!r) return;

        spec.When(`we want retrieve all the users from the collection`);
        spec.WeExpect(`to get [${COUNT}] items`);

        const tr = await this.#getAllDescSortedByUserName(this._users!);
        const n = tr.ir ? tr.ir!.length : 0;
        r = n == COUNT;
        spec.WeGot(`[${n}] users`, r);

        spec.WeExpect(`that users[0] is greater than users[1]`);
        r = tr.ir![0].username > tr.ir![1].username;

        spec.WeGot(`[${tr.ir![0].username}] > [${tr.ir![1].username}]`, r);
        spec.Resume();

    }

    async S03d_FindAllAndSkipSome() {
        const spec = this.specifier;
        const SKIP_NUM = 2;
        const TOTAL_NUM = MOCK_USERS.many.length + 1;
        const RES_NUM = TOTAL_NUM - SKIP_NUM;

        let r = spec.Init(this.S03d_FindAllAndSkipSome.name, this.flags);
        if (!r) return;

        spec.When(`we want to find some users skipping the first [${SKIP_NUM}]`);
        spec.WeExpect(`to get an array of users with length [${RES_NUM}]`);

        const tr = await this._users!.find(undefined, { noCursorTimeout: false }).skip(SKIP_NUM).toArray();
        const n = (tr) ? tr!.length : 0;
        r = n == RES_NUM;

        spec.WeGot(`[${n}] items`, r);
        spec.Resume();
    }

    async S03e_FindAllAndLimitToFirstN() {
        const spec = this.specifier;
        const LIMIT_NUM = 3;

        let r = spec.Init(this.S03e_FindAllAndLimitToFirstN.name, this.flags);
        if (!r) return;

        spec.When(`we want to find some users limiting the result to the first [${LIMIT_NUM}]`);
        spec.WeExpect(`to get an array of users with length [${LIMIT_NUM}]`);

        const tr = await this._users!.find(undefined, { noCursorTimeout: false }).limit(LIMIT_NUM).toArray();
        const n = (tr) ? tr!.length : 0;
        r = n == LIMIT_NUM;

        spec.WeGot(`[${n}] items`, r);
        spec.Resume();
    }

    async S04a_CountWithFilter() {
        const spec = this.specifier;
        const GROUP_NAME = MOCK_USERS.many[2].group;
        const EXPECT_NUM = 2;

        let r = spec.Init(this.S04a_CountWithFilter.name, this.flags);
        if (!r) return;

        spec.When(`we want to count all the items in the collection of the group [${GROUP_NAME}]`);
        spec.WeExpect(`to get [${EXPECT_NUM}] items`);

        const tr = await this.#countFiltered(this._users!, { group: GROUP_NAME });
        const n = (tr.ok) ? tr.ir! : 0;
        r = n == EXPECT_NUM

        spec.WeGot(`[${n}]`, r);
        spec.Resume();
    }

    async S04b_CountByAggregateWithSkipOption() {
        const spec = this.specifier;
        const SKIP_NUM = 3;
        const EXPECT_NUM = MOCK_USERS.many.length + 1 - SKIP_NUM

        let r = spec.Init(this.S04b_CountByAggregateWithSkipOption.name, this.flags);
        if (!r) return;

        spec.When(`we want count the items in the collection skipping [${SKIP_NUM}] of them`);
        spec.WeExpect(`to get [${EXPECT_NUM}]`);

        const tr = await this.#countWithSkipOption(this._users!, SKIP_NUM);
        const n = (tr.ok) ? tr.ir : 0;
        r = n == EXPECT_NUM

        spec.WeGot(`[${n}]`, r);
        spec.Resume();

    }

    async S05a_UpdateSingle() {
        const spec = this.specifier;
        const NEW_PWD = "newPassword";

        let r = spec.Init(this.S05a_UpdateSingle.name, this.flags);
        if (!r) return;

        spec.When(`we want to update the password of the user named ${MOCK_USERS.single.username}`);
        spec.WeExpect(`to get the old [${MOCK_USERS.single.password}] and the new value [${NEW_PWD}]`);

        const tr = await this.#updateOne(this._users!, { username: MOCK_USERS.single.username });
        const n = tr.ok ? tr.ir!.modifiedCount : 0;
        r = n == 1;

        spec.WeGot(`[${n}] items modified.`, r);
        spec.Resume();
    }

    async S05b_UpdateMany() {
        const spec = this.specifier;
        const NEW_GROUP = "newGroup";
        const OLD_GROUP = MOCK_USERS.many[2].group;
        const UPDATED_NUM = 2;

        let r = spec.Init(this.S05b_UpdateMany.name, this.flags);
        if (!r) return;

        spec.When(`we want to update the group of the users in ${OLD_GROUP}`);
        spec.WeExpect(`to get [${UPDATED_NUM}] records updated with the new value [${NEW_GROUP}]`);

        const tr = await this.#updateMany(this._users!, { group: OLD_GROUP });
        const n = tr.ok ? tr.ir!.modifiedCount : 0;
        r = n == UPDATED_NUM;

        spec.WeGot(`[${n}] items modified.`, r);
        spec.Resume();
    }

    async S06a_DeleteSingleById() {
        const spec = this.specifier;
        let r = spec.Init(this.S06a_DeleteSingleById.name, this.flags);
        if (!r) return;

        r = this._singleInsertResult !== undefined;
        if (!r) {
            spec.Skip(
                `We need the result of ${this.S02a_InsertOne.name} to run this spec.`
            );
            return
        }

        spec.When(`we want to delete one user into the test collection by object ID`);
        spec.WeExpect(`to get the get [1] in the delete count result`);

        const tr = await this.#deleteByID(this._users!, this._singleInsertResult!);
        const n = tr.ok ? tr.ir : 0;
        r = n == 1;

        spec.WeGot(`[${n}] deletion`, r);
        spec.Resume();

    }

    async S06b_DeleteManyByFilter() {
        const spec = this.specifier;
        const EXPECT_NUM = 2;
        const GROUP = MOCK_USERS.many[2].group;
        const FILTER = { group: "group3" };

        let r = spec.Init(this.S06b_DeleteManyByFilter.name, this.flags);
        if (!r) return;

        spec.When(`we want to delete the users that are in the group [${GROUP}]`);
        spec.WeExpect(`to get the get [${EXPECT_NUM}] in the delete count result`);

        const tr = await this.#deleteByFilter(this._users!, FILTER);
        const n = tr.ok ? tr.ir : 0;
        r = n == EXPECT_NUM;

        spec.WeGot(`[${n}] deletion`, r);
        spec.Resume();
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

        const r: { ir?: Mng.TApgMngInsertResult, im?: string, ok: boolean } = { ok: true };
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

        const r: { ir?: Mng.TApgMngMultipleInsertResult, im?: string, ok: boolean } = { ok: true };
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
        auserId: { $oid: string; } | Mongo.Bson.ObjectId,
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
        afilter: Mongo.Filter<ApgUserSchema>
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
        auserID: { $oid: string; } | Mongo.Bson.ObjectId
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
        afilter: Mongo.Filter<ApgUserSchema>
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
        afilter: Mongo.Filter<ApgUserSchema>
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
        afilter: Mongo.Filter<ApgUserSchema>
    ) {
        const r: { ir?: Mng.IApgMngUpdateOneResult, im?: string, ok: boolean } = { ok: true };
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
        afilter: Mongo.Filter<ApgUserSchema>
    ) {
        const r: { ir?: Mng.IApgMngUpdateManyResult, im?: string, ok: boolean } = { ok: true };
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