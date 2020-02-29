import * as core from '@actions/core'
import {wait} from './wait'

// Deliberate spelling errors
async function run(): Promise<void> {
  try {
    const ms: string = core.getInput('milliseconds')
    core.info(`Waiting ${ms} milliseconds ...`)

    core.debug(new Date().toTimeString())
    await wait(parseInt(ms, 10))
    core.debug(new Date().toTimeString())

    core.setOutput('time', new Date().toTimeString())
    core.info('Done.')
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
