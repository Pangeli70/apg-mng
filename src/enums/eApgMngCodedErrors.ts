/** -----------------------------------------------------------------------
 * @module [Mng]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.7.1 [APG 2019/08/15]
 * @version 0.8.0 [APG 2022/03/12] Porting to Deno
 * -----------------------------------------------------------------------
 */

/**
 * Mongo service coded Errors
 */
export enum eApgMngCodedErrors {
  /** No error*/
  No_Error = 'NO_ERROR',
  
  /** The current connection to the expected mongo DB is invalid */
  NotAValidDb = '[MONGO] NOT_A_VALID_DB',

}
