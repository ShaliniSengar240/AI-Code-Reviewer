// Mock data shaped EXACTLY like the real backend responses defined in API_Contract.md
// Swap the functions in api.js from mock -> real fetch calls once the backend is ready.
// The rest of the app never needs to change, because the shapes match.

export const mockUser = {
  user_id: "u_1",
  name: "Priya Sharma",
  email: "priya@example.com",
  created_at: "2026-06-01T10:00:00Z",
};

export const mockReviewResponse = {
  review_id: "r_101",
  overall_score: 78,
  category_scores: {
    maintainability: 80,
    error_handling: 60,
    performance: 75,
    security: 90,
    readability: 85,
  },
  critical_issues_count: 1,
  issues: [
    {
      line: 12,
      type: "security",
      severity: "high",
      message: "User input is passed directly into a database query.",
      suggestion: "Use parameterized queries instead of string concatenation.",
    },
    {
      line: 27,
      type: "unused_variable",
      severity: "low",
      message: "Variable 'tempResult' is declared but never used.",
      suggestion: "Remove the unused variable to keep the code clean.",
    },
    {
      line: 34,
      type: "bug",
      severity: "medium",
      message: "Possible off-by-one error in the loop condition.",
      suggestion: "Change '<=' to '<' to avoid reading past the array bounds.",
    },
    {
      line: 41,
      type: "style",
      severity: "low",
      message: "Function name uses snake_case instead of camelCase.",
      suggestion: "Rename to match the rest of the file's naming convention.",
    },
  ],
  explanation:
    "This code defines a function that fetches a user record from the database using an ID provided by the caller, then formats a subset of the fields for display.",
  summary:
    "Solid structure overall, but the direct query construction is a real security risk. Fixing that and tightening error handling would meaningfully raise the score.",
  created_at: "2026-08-10T14:23:00Z",
};

export const mockHistory = [
  { review_id: "r_105", date: "2026-08-20T09:15:00Z", language: "python", overall_score: 82 },
  { review_id: "r_104", date: "2026-08-19T16:40:00Z", language: "typescript", overall_score: 91 },
  { review_id: "r_103", date: "2026-08-17T11:05:00Z", language: "javascript", overall_score: 58 },
  { review_id: "r_102", date: "2026-08-14T13:30:00Z", language: "python", overall_score: 73 },
  { review_id: "r_101", date: "2026-08-10T14:23:00Z", language: "python", overall_score: 78 },
  { review_id: "r_100", date: "2026-08-08T09:10:00Z", language: "javascript", overall_score: 64 },
  { review_id: "r_099", date: "2026-08-05T18:45:00Z", language: "python", overall_score: 88 },
  { review_id: "r_098", date: "2026-08-01T11:02:00Z", language: "java", overall_score: 71 },
];

export const mockAnalytics = {
  average_score_trend: [
    { date: "2026-08-01", score: 71 },
    { date: "2026-08-05", score: 88 },
    { date: "2026-08-08", score: 64 },
    { date: "2026-08-10", score: 78 },
  ],
  most_common_issue_type: "style",
  reviews_by_language: { python: 2, javascript: 1, java: 1 },
  total_reviews: 4,
};
// ---------------------------------------------------------------
// Focus-specific sample reviews. All three review the same Python
// sample ("Load sample"), so the line numbers match the editor.
// ---------------------------------------------------------------
const sampleExplanation =
  "This module fetches a user record from a SQLite database by name and calculates simple statistics from a JSON file of scores: it loads the scores, returns the top n scores and computes an average.";

export const mockReviewsByFocus = {
  general: {
    review_id: "r_301",
    focus: "general",
    overall_score: 74,
    category_scores: { maintainability: 80, error_handling: 55, performance: 76, security: 60, readability: 85 },
    critical_issues_count: 1,
    issues: [
      { line: 12, type: "security", severity: "high",
        message: "The SQL query is built by joining strings with user input.",
        suggestion: "Use a parameterised query: cursor.execute('SELECT ... WHERE name = ?', (username,))." },
      { line: 22, type: "bug", severity: "medium",
        message: "The file is opened and parsed with no error handling. A missing file, invalid JSON or a missing 'scores' key will crash the function.",
        suggestion: "Wrap the block in try/except and return a clear error or an empty result." },
      { line: 31, type: "bug", severity: "medium",
        message: "Division by zero when the scores list is empty.",
        suggestion: "Return 0 (or raise a clear error) when count is 0." },
      { line: 36, type: "bug", severity: "medium",
        message: "range(0, n + 1) reads one element too many and can raise IndexError.",
        suggestion: "Use range(n) or slice the list with scores[:n]." },
      { line: 27, type: "unused_variable", severity: "low",
        message: "Variable 'temp_result' is created but never used.",
        suggestion: "Remove it." },
      { line: 11, type: "style", severity: "low",
        message: "Functions have no docstrings or type hints.",
        suggestion: "Add short docstrings and type hints to describe inputs and outputs." },
    ],
    explanation: sampleExplanation,
    summary:
      "Balanced review. The code is readable and split into small functions, but it needs safer database access, input checks and error handling. Fix the SQL query first, then guard the division and the loop bound.",
    created_at: "2026-10-17T10:15:00Z",
  },

  security: {
    review_id: "r_302",
    focus: "security",
    overall_score: 41,
    category_scores: { maintainability: 78, error_handling: 60, performance: 80, security: 22, readability: 84 },
    critical_issues_count: 2,
    issues: [
      { line: 12, type: "security", severity: "high",
        message: "User input is joined into the SQL string, which allows SQL injection (for example a name such as ' OR '1'='1).",
        suggestion: "Use a parameterised query and never build SQL with string concatenation." },
      { line: 22, type: "security", severity: "high",
        message: "The file path comes straight from the caller, so a path such as ../../secret.json can read files outside the intended folder (path traversal).",
        suggestion: "Resolve the path and allow only files inside one approved base folder." },
      { line: 18, type: "security", severity: "medium",
        message: "SELECT * returns every column, which may include password hashes or other sensitive fields.",
        suggestion: "Select only the columns that are needed and return only those." },
      { line: 23, type: "security", severity: "medium",
        message: "The parsed JSON is trusted without validation. Unexpected types or very large input can break or abuse the function.",
        suggestion: "Validate the structure and types of the data and limit the file size." },
      { line: 13, type: "security", severity: "low",
        message: "The connection is not closed if an error happens before close() is reached.",
        suggestion: "Use a context manager (with ...) so the connection is always closed." },
      { line: 4, type: "security", severity: "low",
        message: "The database path is hard-coded in the source file.",
        suggestion: "Read it from an environment variable or a configuration file." },
    ],
    explanation: sampleExplanation,
    summary:
      "Two critical vulnerabilities were found: SQL injection in find_user and an unvalidated file path in load_scores. Use parameterised queries, restrict file paths, return only the columns you need and validate parsed data before using it.",
    created_at: "2026-10-17T10:20:00Z",
  },

  performance: {
    review_id: "r_303",
    focus: "performance",
    overall_score: 62,
    category_scores: { maintainability: 80, error_handling: 72, performance: 48, security: 62, readability: 86 },
    critical_issues_count: 0,
    issues: [
      { line: 13, type: "performance", severity: "medium",
        message: "A new database connection is opened and closed on every call.",
        suggestion: "Reuse one connection or use a connection pool." },
      { line: 28, type: "performance", severity: "medium",
        message: "The total and the count are accumulated in a manual Python loop.",
        suggestion: "Use sum(scores) and len(scores), which run in optimised built-in code." },
      { line: 36, type: "performance", severity: "medium",
        message: "The result is built with a loop and append, and range(0, n + 1) also reads one element too many.",
        suggestion: "Use scores[:n]. It is shorter, faster and avoids the IndexError." },
      { line: 12, type: "performance", severity: "low",
        message: "SELECT * fetches every column although only some are used.",
        suggestion: "Select only the needed columns and add an index on the name column." },
      { line: 23, type: "performance", severity: "low",
        message: "The whole file is read into memory at once.",
        suggestion: "For large files, process the data in chunks or stream it." },
      { line: 27, type: "unused_variable", severity: "low",
        message: "'temp_result' allocates a list that is never used.",
        suggestion: "Remove it." },
    ],
    explanation: sampleExplanation,
    summary:
      "Focus: performance. The main costs are repeated database connections and manual loops that built-in functions do faster. Security was not the focus of this review, so the SQL building issue is not listed here.",
    created_at: "2026-10-17T10:25:00Z",
  },
};