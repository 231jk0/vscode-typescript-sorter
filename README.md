# typescript-sorter README

This library is used to sort imports on the top of .ts, .tsx files.

## Extension Settings
This extension contributes the following settings:

* `typescriptSorter.orderOfImports`: List that specifies the order of imports.
e.g. (['module-imports'], ['a', 'b', 'c'], ['d', 'e', 'f'], ['default']) will sort imports into four groups.
	```
	// module imports
	import 'reflect-metadata';
	import './global';
	require('./test');

	import { sample1 } from 'a/sample1';
	import { sample2 } from 'b/sample2';
	import { sample3 } from 'c/sample3';

	import { sample4 } from 'd/sample4';
	import { sample5 } from 'e/sample5';
	import { sample6 } from 'f/sample6';

	import { sample7 } from 'notSpecified/sample7';
	import { sample8 } from 'alsoNotSpecified/sample8';
	```

* `typescriptSorter.sortOnFileOpen`: Set to `true` to sort on file open

## Release Notes

### 1.0.0

Initial release of Typescript Sorter.

-----------------------------------------------------------------------------------------------------------