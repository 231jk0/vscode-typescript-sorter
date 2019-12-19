import * as vscode from 'vscode';

import { regularExpressionToDetermineRootOfImportLine } from './constants';

import Map from './dataStructures/map';

interface LineWithSortInfo {
	content: string;
	rootFolder: string;
	weight: number;
}

const _determineRootFolderOfImport = (line: string) => {
	const result = regularExpressionToDetermineRootOfImportLine.exec(line);

	const importRootFolder = result && result[1]; // importRootFolder will always be on result[1] if it gets captured

	return importRootFolder;
}

const _sortLines = (firstLine: LineWithSortInfo, secondLine: LineWithSortInfo) => {
	if (firstLine.weight !== secondLine.weight) {
		return firstLine.weight - secondLine.weight;
	}

	return firstLine.rootFolder.localeCompare(secondLine.rootFolder);
}

const _getSeparatedLines = (lines: LineWithSortInfo[]): (LineWithSortInfo)[] => {
	if (!lines || lines.length === 0) {
		return [];
	}

	const newLines: LineWithSortInfo[] = [lines[0]];

	for (let i = 1; i < lines.length; i++) {
		if (lines[i - 1].weight !== lines[i].weight) {
			newLines.push({ content: '', rootFolder: '', weight: 0 });
		}

		newLines.push(lines[i]);
	}

	return newLines;
}

export const _getExtensionFromFilename = (fileName: string) => {
	return fileName.substr(fileName.lastIndexOf('.') + 1);
}

export const getSettings = () => {
	const orderOfImports = vscode.workspace.getConfiguration('sorter').get('orderOfImports') as string[];
	const sortOnFileOpen = vscode.workspace.getConfiguration('sorter').get('sortOnFileOpen') as string[];

	return {
		orderOfImports,
		sortOnFileOpen
	}
}

export const helloWorld = async (): Promise<boolean> => {
	const { activeTextEditor } = vscode.window;
	const { orderOfImports } = getSettings();
	const rootFolderWeight = Map.buildFromArray(orderOfImports);

	let lastImportLine = -1;
	let lastImportLineLength = -1;

	if (!activeTextEditor) {
		return false;
	}

	const { document: { fileName } } = activeTextEditor;
	const extension = _getExtensionFromFilename(fileName);

	if (extension !== 'ts' && extension !== 'tsx') {
		return false;
	}

	const { lineCount } = activeTextEditor.document;

	const linesWithInfoForSort: LineWithSortInfo[] = [];

	for (let i = 0; i < lineCount; i++) {
		const line = activeTextEditor.document.lineAt(i).text;
		const importRootFolder = _determineRootFolderOfImport(line);
		const value = rootFolderWeight.getValue(importRootFolder) || rootFolderWeight.getValue('other');

		if (importRootFolder) {
			lastImportLine = i;
			lastImportLineLength = line.length;

			linesWithInfoForSort.push({
				content: line,
				rootFolder: importRootFolder,
				weight: value
			});
		}
	}

	const sortedLinesWithInfoForSort = linesWithInfoForSort.sort(_sortLines);
	const separatedSortedLinesWithInfoForSort = _getSeparatedLines(sortedLinesWithInfoForSort);

	const separatedSortedLines = separatedSortedLinesWithInfoForSort.map((_line) => _line.content);

	const successInfo = await activeTextEditor.edit(editBuilder => {
		const range = new vscode.Range(0, 0, lastImportLine, lastImportLineLength);

		editBuilder.replace(range, separatedSortedLines.join('\n'));
	});

	return successInfo;
};