/** -----------------------------------------------------------------------
 * @module [apg-mng]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.2 [APG 2022/10/04] Github Beta
 * @version 0.9.7 [APG 2023/05/21] Separation of concerns lib/srv
 * -----------------------------------------------------------------------
*/
import { Spc } from "./test/deps.ts";
import { eApgMngMode } from "./mod.ts";
import { ApgMngSpec } from "./test/specs/ApgMngSpec.ts"


// https://deno.land/std/dotenv/load
import "https://deno.land/std@0.188.0/dotenv/load.ts";


async function ApgMngTests(arun: Spc.eApgSpcRun) {

    if (arun != Spc.eApgSpcRun.yes) return;

    const URI = "https://apg-tst.deno.dev/store";

    const localDbSpec = new ApgMngSpec(eApgMngMode.local);
    if (await localDbSpec.Run(Spc.eApgSpcRun.yes)) {
        const _r1 = await localDbSpec.SendEventsToTestService(URI, "Uts", localDbSpec.CLASS_NAME);
    }

    const atlasDbSpec = new ApgMngSpec(eApgMngMode.atlas);
    if (await atlasDbSpec.Run(Spc.eApgSpcRun.yes)) {
        const _r2 = await atlasDbSpec.SendEventsToTestService(URI, "Uts", atlasDbSpec.CLASS_NAME);
    }

    console.log("+----------------------------- Deno Resources ----------------------------------");
    console.dir(Deno.resources());
    console.log("+-------------------------------------------------------------------------------");
    console.log("|                 >>>>>        Test terminated      <<<<<");
    console.log("+-------------------------------------------------------------------------------");

    Spc.ApgSpcSpecifier.FinalReport();
}

await ApgMngTests(Spc.eApgSpcRun.yes);