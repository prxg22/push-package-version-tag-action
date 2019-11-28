# push-package-version-tag-action
Github action to create and push `package.json` tag

## Inputs

### github-token:
*required*

github token with access to merge in head-branch

### tag-prefix

tag prefix


## Outputs

### created-tag
*boolean*

if a new tag was created or not

## Example usage
```yml
uses: prxg22/push-package-version-tag-action@master
with:
  tag-prefix: v
  github-token: ${{secrets.GITHUB_TOKEN}}
```
