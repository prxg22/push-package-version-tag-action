const core = require("@actions/core");
const github = require("@actions/github");
const { exec } = require("@actions/exec");
const fs = require("fs");

const githubToken = core.getInput("github-token");
const octokit = new github.GitHub(githubToken);

const getVersion = () => {
  const file = fs.readFileSync("package.json");
  const { version } = JSON.parse(file.toString());
  return version;
};

const createTag = async version => {
  await exec(`git tag`, [`-a ${version}`, `-m 'Release version ${version}'`]);
  await exec("git push --tags");
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
