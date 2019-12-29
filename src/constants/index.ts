import { LineWithSortInfo } from "../typescriptSorter"

export const MODULE_IMPORTS = 'module-imports';
export const DEFAULT = 'default';

export const EXPRESSION_TO_DETERMINE_ROOT_OF_IMPORT_LINE = /import.*from [\'\"](.*?)[\/\'].*/ // Regex: import.*from ['"](.*?)[/'].*
export const EXPRESSION_TO_DETERMINE_ROOT_OF_MODULE_IMPORT_LINE = /import\s*[\'\"](.*?)[\/\'].*/ // Regex: import\s*['"](.*?)[/'].*

export const EXPRESSION_TO_DETERMINE_ROOT_OF_REQUIRE_LINE = /.*=.*require\([\'\"](.*?)[\/\']\).*/ // Regex: .*=.*require\(['"](.*?)[/']\).*
export const EXPRESSION_TO_DETERMINE_ROOT_OF_MODULE_REQUIRE_LINE = /require\([\'\"](.*?)[\/\']\).*/ // Regex: require\(['"](.*?)[/']\).*

export const EXPRESSION_TO_DETERMINE_EMPTY_LINE = /^\s*$/ // Regex: ^\s*$

export const EMPTY_LINE_SORT_INFO: LineWithSortInfo = {
	content: '',
	rootFolder: '',
	weights: {
		groupWeight: 0,
		elementWeight: 0
	}
}