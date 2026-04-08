// DO2: Commitlint config — enforces Conventional Commits format
// Valid: feat: add csv export | fix: keyboard trap | docs: update readme
// Invalid: "fixed stuff" | "WIP" | "asdf"

/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",     // New feature
        "fix",      // Bug fix
        "docs",     // Documentation
        "style",    // Formatting (no logic change)
        "refactor", // Code restructure (no feature/fix)
        "perf",     // Performance improvement
        "test",     // Add or fix tests
        "chore",    // Build process / dependency updates
        "ci",       // CI/CD changes
        "revert",   // Revert a commit
      ],
    ],
    "subject-case": [2, "never", ["sentence-case", "start-case", "pascal-case", "upper-case"]],
    "subject-max-length": [2, "always", 100],
    "body-max-line-length": [2, "always", 200],
  },
};
