import * as Spec from "./test/ApgMngServiceSpec.ts"

const spec = new Spec.ApgMngServiceSpec();
const local = true;
const atlas = false;

const logLocal = await spec.test(local);
logLocal.forEach(e => {
    console.log(e);
});

const logAtlas = await spec.test(atlas);
logAtlas.forEach(e => {
    console.log(e);
});