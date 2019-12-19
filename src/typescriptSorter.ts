import * as vscode from 'vscode';

import { EXPRESSION_TO_DETERMINE_ROOT_OF_IMPORT_LINE, EMPTY_LINE_SORT_INFO, EXPRESSION_TO_DETERMINE_ROOT_OF_REQUIRE_LINE } from './constants';
import Map, { SortInfo } from './dataStructures/map';
import { getSettings } from './config';

export interface LineWithSortInfo {
	content: string;
	rootFolder: string;
	weights: SortInfo;
}

const _determineRootFolderOfImport = (line: string) => {
	const importResult = EXPRESSION_TO_DETERMINE_ROOT_OF_IMPORT_LINE.exec(line);
	const importRootFolder = importResult && importResult[1]; // importRootFolder will always be on result[1] if it gets captured

	const requireResult = EXPRESSION_TO_DETERMINE_ROOT_OF_REQUIRE_LINE.exec(line);
	const requireRootFolder = requireResult && requireResult[1]; // requireRootFolder will always be on result[1] if it gets captured

	return importRootFolder || requireRootFolder;
}

const _sortLines = (firstLine: LineWithSortInfo, secondLine: LineWithSortInfo) => {
	const { weights: { groupWeight: firstGroupWeight, elementWeight: firstElementWeight }, rootFolder: firstRootFolder } = firstLine;
	const { weights: { groupWeight: secondGroupWeight, elementWeight: secondElementWeight }, rootFolder: secondRootFolder } = secondLine;

	if (firstGroupWeight !== secondGroupWeight) {
		return firstGroupWeight - secondGroupWeight;
	}

	if (firstElementWeight !== secondElementWeight) {
		return firstElementWeight - secondElementWeight;
	}

	return firstRootFolder.localeCompare(secondRootFolder);
}

const _getSeparatedLines = (lines: LineWithSortInfo[]): (LineWithSortInfo)[] => {
	if (!lines || lines.length === 0) {
		return [];
	}

	const newLines: LineWithSortInfo[] = [lines[0]];

	for (let i = 1; i < lines.length; i++) {
		const { weights: { groupWeight: prevLineGroupWeight } } = lines[i - 1];
		const { weights: { groupWeight: currentLineGroupWeight } } = lines[i];

		if (prevLineGroupWeight !== currentLineGroupWeight) {
			newLines.push(EMPTY_LINE_SORT_INFO);
		}

		newLines.push(lines[i]);
	}

	return newLines;
}

export const _getExtensionFromFilename = (fileName: string) => {
	return fileName.substr(fileName.lastIndexOf('.') + 1);
}

export const sortImports = async (): Promise<boolean> => {
	const { activeTextEditor } = vscode.window;
	const { orderOfImports } = getSettings();
	const rootFolderWeightMap = Map.buildFromArray(orderOfImports);

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
		const sortWeights: SortInfo = (
			rootFolderWeightMap.getValue(importRootFolder)
			|| rootFolderWeightMap.getValue('other')
			|| { groupWeight: 1000, elementWeight: 1000 }
		);

		if (importRootFolder) {
			lastImportLine = i;
			lastImportLineLength = line.length;

			linesWithInfoForSort.push({
				content: line,
				rootFolder: importRootFolder,
				weights: sortWeights
			});
		}
	}

	if (lastImportLine === -1) {
		return true; // No imports to sort.
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