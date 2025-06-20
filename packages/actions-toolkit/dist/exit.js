/**
 * The code to exit an action with a "success" state
 */
export const SuccessCode = 0;
/**
 * The code to exit an action with a "failure" state
 */
export const FailureCode = 1;
/**
 * The code to exit an action with a "neutral" state
 */
export const NeutralCode = 78;
export class Exit {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    /**
     * Stop the action with a "success" status
     */
    success(message) {
        if (message)
            this.logger.success(message);
        process.exit(SuccessCode);
    }
    /**
     * Stop the action with a "neutral" status
     */
    neutral(message) {
        if (message)
            this.logger.info(message);
        process.exit(NeutralCode);
    }
    /**
     * Stop the action with a "failed" status
     */
    failure(message) {
        if (message)
            this.logger.fatal(message);
        process.exit(FailureCode);
    }
}
//# sourceMappingURL=exit.js.map