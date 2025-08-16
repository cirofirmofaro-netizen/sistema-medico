module.exports = {
  branches: ["main", "develop"],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    [
      "@semantic-release/git",
      {
        assets: ["package.json", "CHANGELOG.md"],
        message:
          "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
      },
    ],
  ],
  preset: "angular",
  releaseRules: [
    { type: "feat", release: "minor" },
    { type: "fix", release: "patch" },
    { type: "docs", release: "patch" },
    { type: "style", release: "patch" },
    { type: "refactor", release: "patch" },
    { type: "perf", release: "patch" },
    { type: "test", release: "patch" },
    { type: "build", release: "patch" },
    { type: "ci", release: "patch" },
    { type: "chore", release: "patch" },
    { type: "revert", release: "patch" },
    { breaking: true, release: "major" },
  ],
  parserOpts: {
    noteKeywords: ["BREAKING CHANGE", "BREAKING CHANGES"],
  },
  writerOpts: {
    transform: (commit, context) => {
      const issues = [];

      if (commit.type === "feat") {
        commit.type = "✨ Features";
      } else if (commit.type === "fix") {
        commit.type = "🐛 Bug Fixes";
      } else if (commit.type === "docs") {
        commit.type = "📚 Documentation";
      } else if (commit.type === "style") {
        commit.type = "💄 Styles";
      } else if (commit.type === "refactor") {
        commit.type = "♻️ Code Refactoring";
      } else if (commit.type === "perf") {
        commit.type = "⚡ Performance Improvements";
      } else if (commit.type === "test") {
        commit.type = "🚨 Tests";
      } else if (commit.type === "build") {
        commit.type = "📦 Builds";
      } else if (commit.type === "ci") {
        commit.type = "👷 Continuous Integration";
      } else if (commit.type === "chore") {
        commit.type = "🔧 Chores";
      }

      if (typeof commit.hash === "string") {
        commit.shortHash = commit.hash.substring(0, 7);
      }

      if (commit.subject) {
        let url = context.repository
          ? `${context.host}/${context.owner}/${context.repository}`
          : context.repoUrl;
        if (url) {
          url = `${url}/issues/`;
          // Issue URLs.
          commit.subject = commit.subject.replace(/#([0-9]+)/g, (_, issue) => {
            issues.push(issue);
            return `[#${issue}](${url}${issue})`;
          });
        }
        if (context.host) {
          // User URLs.
          commit.subject = commit.subject.replace(
            /\B@([a-z0-9](?:-?[a-z0-9/]){0,38})/g,
            (_, username) => {
              if (username.includes("/")) {
                return `@${username}`;
              }

              return `[@${username}](${context.host}/${username})`;
            },
          );
        }
      }

      // remove references that already appear in the subject
      commit.references = commit.references.filter(
        (reference) => !issues.includes(reference.issue),
      );

      return commit;
    },
    groupBy: "type",
    commitGroupsSort: "title",
    commitsSort: ["subject", "scope"],
  },
};
