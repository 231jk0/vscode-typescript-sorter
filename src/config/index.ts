import * as vscode from 'vscode';

export interface Settings {
	orderOfImports: (string | string[])[];
	sortOnFileOpen: boolean;
}

export const getSettings = (): Settings => {
	const orderOfImports = vscode.workspace.getConfiguration('typescriptSorter').get('orderOfImports') as string[];
	const sortOnFileOpen = vscode.workspace.getConfiguration('typescriptSorter').get('sortOnFileOpen') as boolean;

	return {
		orderOfImports,
		sortOnFileOpen
	}
}
