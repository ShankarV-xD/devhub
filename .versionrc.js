// DO3: Changelog automation config for standard-version
// Sections map commit types → readable changelog headings
// "hidden: true" types are tracked but not shown in the changelog

/** @type {import('standard-version').Configuration} */
module.exports = {
  types: [
    { type: "feat", section: "✨ Features" },
    { type: "fix", section: "🐛 Bug Fixes" },
    { type: "perf", section: "⚡ Performance" },
    { type: "refactor", section: "♻️ Refactoring" },
    { type: "docs", section: "📚 Documentation" },
    { type: "test", section: "🧪 Tests" },
    { type: "chore", hidden: true },
    { type: "style", hidden: true },
    { type: "ci", hidden: true },
  ],
  // Commit message template for version bumps
  releaseCommitMessageFormat: "chore(release): v{{currentTag}}",
};
