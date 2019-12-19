type MapData<T> = { [key: string]: T };

function isString(element: string | string[]): element is string {
	return typeof element === 'string';
}

export interface SortInfo {
	groupWeight: number;
	elementWeight: number;
}

export default class Map<T = SortInfo> {
	_data: MapData<T>;

	constructor() {
		this._data = {};
	}

	static buildFromArray(array: (string | string[])[]) {
		const map = new Map();
		let groupWeight = 0;

		for (let element of array) {
			++groupWeight;

			if (isString(element)) {
				const value = { groupWeight, elementWeight: 0 };
				map.add(element, value);
			} else {
				element.forEach((key, index) => {
					const value = { groupWeight, elementWeight: index };
					map.add(key, value);
				});
			}
		}

		return map;
	}

	add(key: string, value: T) {
		this._data[key] = value;
	}

	getValue(key: string) {
		if (!key) {
			return undefined;
		}

		const value = this._data[key];
		return value;
	}
}