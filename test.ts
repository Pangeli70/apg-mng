import { eApgMngMode } from "./mod.ts";
import * as Tester from "./test/ApgMngTester.ts"

const tester = new Tester.ApgMngTester();


const logLocal = await tester.run(eApgMngMode.local);
logLocal.forEach(e => {
    console.log(e);
});

const logAtlas = await tester.run(eApgMngMode.atlas);
logAtlas.forEach(e => {
    console.log(e);
});