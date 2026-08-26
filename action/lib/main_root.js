import { a as toError, i as setFailed, r as info, t as action } from "./action-Ct3XCkQ5.js";
import { existsSync, readFileSync } from "fs";
import { EOL } from "os";
//#region src/actions/github/context.ts
var Context = class {
	/**
	* Webhook payload object that triggered the workflow
	*/
	payload;
	eventName;
	sha;
	ref;
	workflow;
	action;
	actor;
	job;
	runAttempt;
	runNumber;
	runId;
	apiUrl;
	serverUrl;
	graphqlUrl;
	/**
	* Hydrate the context from the environment
	*/
	constructor() {
		this.payload = {};
		if (process.env.GITHUB_EVENT_PATH) {
			if (existsSync(process.env.GITHUB_EVENT_PATH)) this.payload = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, { encoding: "utf8" }));
			else {
				const path = process.env.GITHUB_EVENT_PATH;
				process.stdout.write(`GITHUB_EVENT_PATH ${path} does not exist${EOL}`);
			}
		}
		this.eventName = process.env.GITHUB_EVENT_NAME;
		this.sha = process.env.GITHUB_SHA;
		this.ref = process.env.GITHUB_REF;
		this.workflow = process.env.GITHUB_WORKFLOW;
		this.action = process.env.GITHUB_ACTION;
		this.actor = process.env.GITHUB_ACTOR;
		this.job = process.env.GITHUB_JOB;
		this.runAttempt = parseInt(process.env.GITHUB_RUN_ATTEMPT, 10);
		this.runNumber = parseInt(process.env.GITHUB_RUN_NUMBER, 10);
		this.runId = parseInt(process.env.GITHUB_RUN_ID, 10);
		this.apiUrl = process.env.GITHUB_API_URL ?? `https://api.github.com`;
		this.serverUrl = process.env.GITHUB_SERVER_URL ?? `https://github.com`;
		this.graphqlUrl = process.env.GITHUB_GRAPHQL_URL ?? `https://api.github.com/graphql`;
	}
	get issue() {
		const payload = this.payload;
		return {
			...this.repo,
			number: (payload.issue || payload.pull_request || payload).number
		};
	}
	get repo() {
		if (process.env.GITHUB_REPOSITORY) {
			const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
			return {
				owner,
				repo
			};
		}
		if (this.payload.repository) return {
			owner: this.payload.repository.owner.login,
			repo: this.payload.repository.name
		};
		throw new Error("context.repo requires a GITHUB_REPOSITORY environment variable like 'owner/repo'");
	}
};
//#endregion
//#region src/main.ts
async function run() {
	try {
		info("cspell-action");
		const githubContext = new Context();
		await action(githubContext);
		info("Done.");
		return;
	} catch (error) {
		console.error(error);
		const err = toError(error);
		setFailed(err.message);
		return err;
	}
}
//#endregion
//#region src/main_root.ts
run();
//#endregion
export {};
