import { LineWithSortInfo } from "../sorter"

export const regularExpressionToDetermineRootOfImportLine = /import.*from [\'\"](.*?)[\/\'].*/ // Regex: import.*from ['"](.*?)[/'].*

export const emptyLineSortInfo: LineWithSortInfo = {
	content: '',
	rootFolder: '',
	weights: {
		groupWeight: 0,
		elementWeight: 0
	}
}