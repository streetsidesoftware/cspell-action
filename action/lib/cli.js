import { a as toError, i as setFailed, n as actionFromCli, r as info } from "./action-Ct3XCkQ5.js";
//#region src/cli.ts
async function run() {
	try {
		info("cspell-action-cli");
		await actionFromCli({
			files: "**",
			verbose: "true"
		});
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
export { run };
