import * as vscode from 'vscode';

import * as Sorter from './sorter';

export function activate(context: vscode.ExtensionContext) {
	const commands = [
		vscode.commands.registerCommand('extension.helloWorld', async () => {
			const successInfo = await Sorter.helloWorld();

			if (successInfo) {
				vscode.window.showInformationMessage('Successfully sorted lines!');
			} else {
				vscode.window.showWarningMessage('Something Went Wrong!');
			}
		})
	];

	commands.forEach((_command) => {
		context.subscriptions.push(_command);
	});

	vscode.workspace.onDidOpenTextDocument(() => {
		const { sortOnFileOpen } = Sorter.getSettings();

		if (sortOnFileOpen) {
			Sorter.helloWorld();
		}
	});
}
export function deactivate() {}
