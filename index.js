const core = require("@actions/core");
const github = require("@actions/github");
const { exec } = require("@actions/exec");
const fs = require("fs");

const githubToken = core.getInput("github-token");
const octokit = new github.GitHub(githubToken);

const getVersion = () => {
  const file = fs.readFileAsync("package.json");
  const { version } = JSON.parse(file.toString());
  return version;
};

const createTag = async version => {
  const ref = process.env.GITHUB_HEAD;
  const { sha } = github.context;

  console.log({ ref, sha })
  const { data: commit } = await octokit.getCommit({
    ...github.context.repo,
    ref,
    sha
  });
  console.log(commit)

  await octokit.createTag({
    ...github.context.repo,
    tag: version,
    message: `Release version: ${version}`,
    object: commit,
    type: "commit"
  });
};

const run = async () => {
  try {
    const version = getVersion();
    await createTag(version);
  } catch (e) {
    core.setFailed(e);
  }
};

run();
