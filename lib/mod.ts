/** -----------------------------------------------------------------------
 * @module [apg-mng] Mongo Utilities
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.2 [APG 2022/10/04] Github Beta
 * @version 0.9.5 [APG 2023/02/14] Rst simplification
 * @version 0.9.7 [APG 2023/05/21] Separation of concerns lib/srv
 * ------------------------------------------------------------------------
 */
export type {
    IApgMngUpdateOneResult,
    IApgMngUpdateManyResult
} from './interfaces/IApgMngUpdateResult.ts';

export type {
    TApgMngInsertResult,
    TApgMngMultipleInsertResult
} from './types/TApgMngInsertResult.ts';

export { ApgMngService } from './classes/ApgMngService.ts';
export { ApgMngLocalService } from './classes/ApgMngLocalService.ts';
export { ApgMngAtlasService } from './classes/ApgMngAtlasService.ts';
export { ApgMngConnector } from './classes/ApgMngConnector.ts';

export { eApgMngMode } from './enums/eApgMngMode.ts';