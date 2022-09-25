import * as Tester from "./test/ApgMngServiceTester.ts"

const tester = new Tester.ApgMngServiceTester();
const local = true;
const atlas = false;

const logLocal = await tester.run(local);
logLocal.forEach(e => {
    console.log(e);
});

const logAtlas = await tester.run(atlas);
logAtlas.forEach(e => {
    console.log(e);
});