module.exports = {
  branches: [
    "main",
    { name: "next", prerelease: true }
  ],
  plugins: [
    "@semantic-release/changelog",
    [
      "@semantic-release/git",
      {
        assets: [
          "CHANGELOG.md",
          "package.json"
        ],
        message: "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
      }
    ]
  ]
}