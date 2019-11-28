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

const createTag = async (version, prefix = "") => {
  const tag = `${prefix}${version}`;
  exec("git tag", ["-a", `${tag}`, "-m", `'Release version ${tag}'`]);
  return tag;
};

const configGit = async () => {
  await exec(`git config --local user.email "action@github.com"`);
  await exec(`git config --local user.name "Push Package Version Tag Action"`);
};

const pushTag = async tag => {
  const actor = process.env.GITHUB_ACTOR;
  const repository = process.env.GITHUB_REPOSITORY;

  const { data: tags } = octokit.git.listMatchingRefs({
    ...github.context.repo,
    ref: `tag/${tag}`
  });

  console.log(tags)
  if (tags && tags.length > 0) return false

  const remote = `https://${actor}:${githubToken}@github.com/${repository}.git`;
  await exec(`git push "${remote}" --tags`);
  return true
};

const run = async () => {
  try {
    const prefix = core.getInput("tag-prefix") || "";
    await configGit();
    console.log("> git configured");
    const version = getVersion();
    const tag = await createTag(version, prefix);
    console.log(`> tag ${tag} created!`);
    const pushed = await pushTag(tag);
    if (pushed) console.log(`> tag ${tag} pushed!`);
    else console.log(`> tag ${tag} already exist`);
  } catch (e) {
    core.setFailed(e);
  }
};

run();
