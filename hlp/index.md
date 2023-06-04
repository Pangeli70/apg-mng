# Apg-Mng Help

Ver. 0.9.7 - 2023/05/28
<br>

### Import the library in `deps.ts` of your project

Using:

```Typescript
export * as Mng from "https://raw.githubusercontent.com/Pangeli70/apg-mng/master/mod.ts";
```

Import in your file using:

```Typescript
import { Mng, ... } from "[...PATH...]/deps.ts";
```

Connect to a mongo database using a connector

```Typescript

    const connector = new Mng.ApgMngConnector();

    // here we are using an .env file to store sensitive data for MongoDB Atlas
    // data was loaded previously using dotenv module

    const options =
    {
        mongoHost: Deno.env.get("mongoHost") || "",
        user: Deno.env.get("user") || "",
        password: Deno.env.get("password") || "",
    }

    let r: Rst.IApgRst = await connector.connect(Mng.eApgMngMode.atlas, MY_DB_NAME, options);

    if (!r.ok) {

        r.message = "Impossibile to connect to database: " + rst.message;

    } else {

        const collection = connector.getCollection<myType>(MY_COLLECTION_NAME);
        if (!collection) {
            r.ok = false;
            r.payload = undefined;
            r.message = MY_COLLECTION_NAME + " collection not connected";
        }

    }

```

To insert a record in the collection use something like

```Typescript
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
```

See the test example for more details