# typescript-sorter README

This library is used to sort imports on the top of .ts, .tsx files.

## Extension Settings
This extension contributes the following settings:

* `typescriptSorter.orderOfImports`: List that specifies the order of imports.
	e.g. (['a', 'b', 'c'], ['d', 'e', 'f'], ['other']) will sort imports into three groups, first group will be ordered like this 'a', 'b', 'c', second group will be ordered like this: 'd', 'e', 'f', and there will be third group that will contain all imports that weren't specified ('other' is necessary).
* `typescriptSorter.sortOnFileOpen`: Set to `true` to sort on file open

## Release Notes

### 1.0.0

Initial release of Typescript Sorter.

-----------------------------------------------------------------------------------------------------------