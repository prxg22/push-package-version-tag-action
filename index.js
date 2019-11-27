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
  await exec("git tag", ["-a", version, "-m", `'Release version ${version}'`]);
  // await exec("git push --tags");
};

const configGit = async () => {
  await exec(`git config --local user.email "action@github.com"`);
  await exec(`git config --local user.name "Push Package Version Tag Action"`);
};

const run = async () => {
  try {
    await configGit()
    const version = getVersion();
    await createTag(version);
  } catch (e) {
    core.setFailed(e);
  }
};

run();
