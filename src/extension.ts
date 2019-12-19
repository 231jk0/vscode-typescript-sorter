import * as vscode from 'vscode';

import * as TypescriptSorter from './typescriptSorter';
import { getSettings } from './config';

export function activate(context: vscode.ExtensionContext) {
	const commands = [
		vscode.commands.registerCommand('typescriptSorter.sortImports', async () => {
			const successInfo = await TypescriptSorter.sortImports();

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

	vscode.window.onDidChangeVisibleTextEditors(async () => {
		const { sortOnFileOpen } = getSettings();

		if (sortOnFileOpen) {
			try {
				await TypescriptSorter.sortImports();
			} catch (error) {
			}
		}
	});
}

export function deactivate() {}
