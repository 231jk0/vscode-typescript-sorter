type MapData = { [key: string]: any };

export default class Map {
	_data: MapData;

	constructor() {
		this._data = {};
	}

	static buildFromArray(array: string[]) {
		const map = new Map();

		array.forEach((key, index) => {
			const value = index + 1;

			map.add(key, value);
		});

		return map;
	}

	add(key: string, value: any) {
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