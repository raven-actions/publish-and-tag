/**
 * The code to exit an action with a "success" state
 */
export var SuccessCode = 0;
/**
 * The code to exit an action with a "failure" state
 */
export var FailureCode = 1;
/**
 * The code to exit an action with a "neutral" state
 */
export var NeutralCode = 78;
var Exit = /** @class */ (function () {
    function Exit(logger) {
        this.logger = logger;
    }
    /**
     * Stop the action with a "success" status
     */
    Exit.prototype.success = function (message) {
        if (message)
            this.logger.success(message);
        process.exit(SuccessCode);
    };
    /**
     * Stop the action with a "neutral" status
     */
    Exit.prototype.neutral = function (message) {
        if (message)
            this.logger.info(message);
        process.exit(NeutralCode);
    };
    /**
     * Stop the action with a "failed" status
     */
    Exit.prototype.failure = function (message) {
        if (message)
            this.logger.fatal(message);
        process.exit(FailureCode);
    };
    return Exit;
}());
export { Exit };
//# sourceMappingURL=exit.js.map