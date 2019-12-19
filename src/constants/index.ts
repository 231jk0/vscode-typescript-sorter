import { LineWithSortInfo } from "../typescriptSorter"

export const EXPRESSION_TO_DETERMINE_ROOT_OF_IMPORT_LINE = /import.*from [\'\"](.*?)[\/\'].*/ // Regex: import.*from ['"](.*?)[/'].*
export const EXPRESSION_TO_DETERMINE_ROOT_OF_REQUIRE_LINE = /.*=.*require\([\'\"](.*?)[\/\']\).*/ // Regex: .*=.*require\(['"](.*?)[/']\).*

export const EMPTY_LINE_SORT_INFO: LineWithSortInfo = {
	content: '',
	rootFolder: '',
	weights: {
		groupWeight: 0,
		elementWeight: 0
	}
}