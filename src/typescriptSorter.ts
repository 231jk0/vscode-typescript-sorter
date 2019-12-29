import * as vscode from 'vscode';

import { EMPTY_LINE_SORT_INFO, EXPRESSION_TO_DETERMINE_ROOT_OF_IMPORT_LINE, EXPRESSION_TO_DETERMINE_ROOT_OF_REQUIRE_LINE, EXPRESSION_TO_DETERMINE_ROOT_OF_MODULE_IMPORT_LINE, EXPRESSION_TO_DETERMINE_ROOT_OF_MODULE_REQUIRE_LINE, MODULE_IMPORTS, DEFAULT, EXPRESSION_TO_DETERMINE_EMPTY_LINE } from './constants';
import Map, { SortInfo } from './dataStructures/map';
import { getSettings } from './config';

export interface LineWithSortInfo {
	content: string;
	rootFolder: string;
	weights: SortInfo;
}

const _addWeightsIfMissing = (map: Map<SortInfo>) => {
	if (!map.getValue(MODULE_IMPORTS)) {
		map.add(MODULE_IMPORTS, { groupWeight: -1000, elementWeight: -1000 });
	}

	if (!map.getValue(DEFAULT)) {
		map.add(DEFAULT, { groupWeight: 1000, elementWeight: 1000 });
	}
}

const _determineRootFolderOfImport = (line: string) => {
	const importResult = EXPRESSION_TO_DETERMINE_ROOT_OF_IMPORT_LINE.exec(line);
	const importRootFolder = importResult && importResult[1]; // importRootFolder will always be on result[1] if it gets captured

	const requireResult = EXPRESSION_TO_DETERMINE_ROOT_OF_REQUIRE_LINE.exec(line);
	const requireRootFolder = requireResult && requireResult[1]; // requireRootFolder will always be on result[1] if it gets captured

	if (importRootFolder || requireRootFolder) {
		return importRootFolder || requireRootFolder;
	}

	const importModuleResult = EXPRESSION_TO_DETERMINE_ROOT_OF_MODULE_IMPORT_LINE.test(line);
	const requireModuleResult = EXPRESSION_TO_DETERMINE_ROOT_OF_MODULE_REQUIRE_LINE.test(line);

	if (importModuleResult || requireModuleResult) {
		return MODULE_IMPORTS;
	}
}

const _isEmptyLine = (line: string) => {
	return EXPRESSION_TO_DETERMINE_EMPTY_LINE.test(line);
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

	_addWeightsIfMissing(rootFolderWeightMap);

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
		const sortWeights: SortInfo = rootFolderWeightMap.getValue(importRootFolder) || rootFolderWeightMap.getValue(DEFAULT);

		if (importRootFolder) {
			lastImportLine = i;
			lastImportLineLength = line.length;

			linesWithInfoForSort.push({
				content: line,
				rootFolder: importRootFolder,
				weights: sortWeights
			});
		} else if (_isEmptyLine(line)) {
			continue;
		} else {
			break;
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