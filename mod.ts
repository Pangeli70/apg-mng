/** -----------------------------------------------------------------------
 * @module [Mng] Mongo Utilities
 * @author [APG] ANGELI Paolo Giusto
 * ------------------------------------------------------------------------
 */
export type {
    IApgMngUpdateOneResult,
    IApgMngUpdateManyResult
} from './src/interfaces/IApgMngUpdateResult.ts';

export type {
    TApgMngInsertResult,
    TApgMngMultipleInsertResult
} from './src/types/TApgMngInsertResult.ts';

export { ApgMngService } from './src/classes/ApgMngService.ts';
export { ApgMngLocalService } from './src/classes/ApgMngLocalService.ts';
export { ApgMngAtlasService } from './src/classes/ApgMngAtlasService.ts';

export { eApgMngCodedErrors } from './src/enums/eApgMngCodedErrors.ts';