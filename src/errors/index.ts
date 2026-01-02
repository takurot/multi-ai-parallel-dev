export enum ErrorCode {
  // E1xxx: Task related
  TASK_NOT_FOUND = "E1001",
  TASK_DUPLICATE_ID = "E1002",
  TASK_DEPENDENCY_NOT_FOUND = "E1003",
  TASK_TIMEOUT = "E1004",
  TASK_MAX_RETRIES_EXCEEDED = "E1005",

  // E2xxx: DAG related
  DAG_CYCLE_DETECTED = "E2001",
  DAG_BUILD_FAILED = "E2002",

  // E3xxx: Git related
  GIT_BRANCH_CREATE_FAILED = "E3001",
  GIT_WORKTREE_CREATE_FAILED = "E3002",
  GIT_CONFLICT_DETECTED = "E3003",
  GIT_REBASE_FAILED = "E3004",
  GIT_PR_CREATE_FAILED = "E3005",

  // E4xxx: LLM related
  LLM_API_KEY_INVALID = "E4001",
  LLM_RATE_LIMIT_EXCEEDED = "E4002",
  LLM_RESPONSE_PARSE_FAILED = "E4003",
  LLM_MODEL_UNAVAILABLE = "E4004",

  // E5xxx: Budget related
  BUDGET_MONTHLY_EXCEEDED = "E5001",
  BUDGET_DAILY_TOKEN_EXCEEDED = "E5002",
  BUDGET_TASK_COST_EXCEEDED = "E5003",

  // E6xxx: Validation related
  VALIDATION_TEST_FAILED = "E6001",
  VALIDATION_LINT_FAILED = "E6002",
  VALIDATION_TYPE_CHECK_FAILED = "E6003",

  // E9xxx: System related
  SYS_CONFIG_LOAD_FAILED = "E9001",
  SYS_DB_CONNECTION_FAILED = "E9002",
  SYS_INTERNAL_ERROR = "E9003",
}

export class OrchestratorError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: unknown,
  ) {
    super(`[${code}] ${message}`);
    this.name = "OrchestratorError";
  }
}
