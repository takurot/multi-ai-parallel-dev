export var ErrorCode;
(function (ErrorCode) {
    // E1xxx: Task related
    ErrorCode["TASK_NOT_FOUND"] = "E1001";
    ErrorCode["TASK_DUPLICATE_ID"] = "E1002";
    ErrorCode["TASK_DEPENDENCY_NOT_FOUND"] = "E1003";
    ErrorCode["TASK_TIMEOUT"] = "E1004";
    ErrorCode["TASK_MAX_RETRIES_EXCEEDED"] = "E1005";
    // E2xxx: DAG related
    ErrorCode["DAG_CYCLE_DETECTED"] = "E2001";
    ErrorCode["DAG_BUILD_FAILED"] = "E2002";
    // E3xxx: Git related
    ErrorCode["GIT_BRANCH_CREATE_FAILED"] = "E3001";
    ErrorCode["GIT_WORKTREE_CREATE_FAILED"] = "E3002";
    ErrorCode["GIT_CONFLICT_DETECTED"] = "E3003";
    ErrorCode["GIT_REBASE_FAILED"] = "E3004";
    ErrorCode["GIT_PR_CREATE_FAILED"] = "E3005";
    // E4xxx: LLM related
    ErrorCode["LLM_API_KEY_INVALID"] = "E4001";
    ErrorCode["LLM_RATE_LIMIT_EXCEEDED"] = "E4002";
    ErrorCode["LLM_RESPONSE_PARSE_FAILED"] = "E4003";
    ErrorCode["LLM_MODEL_UNAVAILABLE"] = "E4004";
    // E5xxx: Budget related
    ErrorCode["BUDGET_MONTHLY_EXCEEDED"] = "E5001";
    ErrorCode["BUDGET_DAILY_TOKEN_EXCEEDED"] = "E5002";
    ErrorCode["BUDGET_TASK_COST_EXCEEDED"] = "E5003";
    // E6xxx: Validation related
    ErrorCode["VALIDATION_TEST_FAILED"] = "E6001";
    ErrorCode["VALIDATION_LINT_FAILED"] = "E6002";
    ErrorCode["VALIDATION_TYPE_CHECK_FAILED"] = "E6003";
    // E9xxx: System related
    ErrorCode["SYS_CONFIG_LOAD_FAILED"] = "E9001";
    ErrorCode["SYS_DB_CONNECTION_FAILED"] = "E9002";
    ErrorCode["SYS_INTERNAL_ERROR"] = "E9003";
})(ErrorCode || (ErrorCode = {}));
export class OrchestratorError extends Error {
    code;
    details;
    constructor(code, message, details) {
        super(`[${code}] ${message}`);
        this.code = code;
        this.details = details;
        this.name = 'OrchestratorError';
    }
}
