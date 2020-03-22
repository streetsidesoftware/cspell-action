import * as core from '@actions/core'
import * as gitHubApi from '@actions/github'
import {wait} from './wait'

async function experiment() {
  const ms: string = core.getInput('milliseconds')
  core.info(`Waiting ${ms} milliseconds ...`)

  core.debug(new Date().toTimeString())
  await wait(parseInt(ms, 10))
  core.debug(new Date().toTimeString())

  core.setOutput('time', new Date().toTimeString())
}

type Context = typeof gitHubApi.context;

function pullRequest(context: Context, github: gitHubApi.GitHub) {
  core.info(`Pull Request: ${context.eventName}`)
  if (github) {
    core.info('github')
  }
}

async function push(context: Context, github: gitHubApi.GitHub) {
  core.info(`Push: ${context.eventName}`)
  context.sha
  // eslint-disable-next-line @typescript-eslint/camelcase
  const result = await github.git.getCommit({ commit_sha: context.sha, ...context.repo })
  core.info(`result: ${JSON.stringify(result, null, 2)}`);
}

async function action() {
  const context = gitHubApi.context;
  const github = new gitHubApi.GitHub(core.getInput('repo-token', { required: true }))
  core.info(`context: ${JSON.stringify(context, null, 2)}`);

  switch(context.eventName) {
    case 'push': return push(context, github);
    case 'pull_request': return pullRequest(context, github)
    default:
      core.info(`Unknown event: '${context.eventName}'`)
  }
}

async function run(): Promise<void> {
  try {
    core.info('cspell-action')
    action()
    experiment()
    core.info('Done.')
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
