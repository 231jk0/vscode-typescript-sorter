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

	static buildFromArray(array: string[] | string[][]) {
		const map = new Map();
		let groupWeight = 0;

		for (let element of array) {
			++groupWeight;

			if (isString(element)) {
				map.add(
					element,
					{
						groupWeight,
						elementWeight: 0
					}
				);
			} else {
				element.forEach((key, index) => {
					map.add(
						key,
						{
							groupWeight,
							elementWeight: index
						}
					);
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