/** -----------------------------------------------------------------------
 * @module [Mng]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.2 [APG 2022/10/04] Github Beta
 * -----------------------------------------------------------------------
*/
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

console.log("Test terminated");