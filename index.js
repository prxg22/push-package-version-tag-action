const core = require("@actions/core");
const { exec } = require("@actions/exec");
const fs = require("fs");

const githubToken = core.getInput("github-token");

const getVersion = () => {
  const file = fs.readFileSync("package.json");
  const { version } = JSON.parse(file.toString());
  return version;
};

const createTag = async (version, prefix = "") => {
  const tag = `${prefix}${version}`;
  try {
    await exec("git tag", ["-a", `${tag}`, "-m", `'Release version ${tag}'`]);
    return tag;
  } catch (e) {
    return;
  }
};

const configGit = async () => {
  await exec(`git config --local user.email "action@github.com"`);
  await exec(`git config --local user.name "Push Package Version Tag Action"`);
};

const pushTag = async () => {
  const actor = process.env.GITHUB_ACTOR;
  const repository = process.env.GITHUB_REPOSITORY;
  const remote = `https://${actor}:${githubToken}@github.com/${repository}.git`;
  await exec(`git push "${remote}" --tags`);
  return true;
};

const run = async () => {
  try {
    const prefix = core.getInput("tag-prefix") || "";
    await configGit();
    console.log("> git configured");
    const version = getVersion();
    const tag = await createTag(version, prefix);
    if (!tag) {
      console.log(`> tag already created!`);
      core.setOutput("created-tag", false);
      return;
    }
    console.log(`> tag ${tag} created!`);
    await pushTag();
    console.log(`> tag ${tag} already exist`);
    core.setOutput("created-tag", true);
  } catch (e) {
    core.setOutput("created-tag", false);
    core.setFailed(e);
  }
};

run();
