/** -----------------------------------------------------------------------
 * @module [Mng]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.2 [APG 2022/10/04] Github Beta
 * -----------------------------------------------------------------------
*/
import { Uts } from "./deps.ts";
import { eApgMngMode } from "./mod.ts";
import { ApgMngSpec } from "./test/ApgMngTester.ts"

const localDbSpec = new ApgMngSpec(eApgMngMode.local);
await localDbSpec.specRun(Uts.eApgUtsSpecRun.yes);

const atlasDbSpec = new ApgMngSpec(eApgMngMode.atlas);
await atlasDbSpec.specRun(Uts.eApgUtsSpecRun.yes);

console.log("Test terminated");