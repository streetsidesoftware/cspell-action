import * as core from '@actions/core'
import * as gitHub from '@actions/github'
import {wait} from './wait'

async function experiment() {
  const ms: string = core.getInput('milliseconds')
  core.info(`Waiting ${ms} milliseconds ...`)

  core.debug(new Date().toTimeString())
  await wait(parseInt(ms, 10))
  core.debug(new Date().toTimeString())

  core.setOutput('time', new Date().toTimeString())
}

type Context = typeof gitHub.context;

function pullRequest(context: Context) {
  core.info(`Pull Request: ${context.eventName}`)
}

function push(context: Context) {
  core.info(`Pull Request: ${context.eventName}`)
}

async function action() {
  const context = gitHub.context;
  core.info(`context: ${JSON.stringify(context, null, 2)}`);

  switch(context.eventName) {
    case 'push': return push(context);
    case 'pull_request': return pullRequest(context)
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
