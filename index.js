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

const createTag = async (version = '', prefix) =>
  exec("git tag", ["-a", `${prefix}${version}`, "-m", `'Release version ${version}'`]);

const configGit = async () => {
  await exec(`git config --local user.email "action@github.com"`);
  await exec(`git config --local user.name "Push Package Version Tag Action"`);
};

const pushTag = async () => {
  const actor = process.env.GITHUB_ACTOR
  const repository = process.env.GITHUB_REPOSITORY

  const remote = `https://${actor}:${githubToken}@github.com/${repository}.git`;
  await exec(`git push "${remote}" --tags`);
}

const run = async () => {
  try {
    const prefix = core.getInput("prefix") || ''
    await configGit();
    console.log('> git configured')
    const version = getVersion();
    await createTag(version);
    console.log(`> tag ${prefix}${version} created!`)
    await pushTag()
    console.log(`> tag ${prefix}${version} pushed!`)
  } catch (e) {
    core.setFailed(e);
  }
};

run();
