import { columnFactory } from "./column.factory";

export function flatten(columns, createView) {
	const root = {
		children: columns
	};

	const rowsToUse = rowsToUseFactory();

	const result = [];
	function markup(column, rowIndex, columnIndex, rowsLeft) {
		const rowspan = rowsLeft - rowsToUse(column);
		const view = createView(column.type || 'text', column);
		view.rowspan = rowspan;
		view.rowIndex = rowIndex;
		view.columnIndex = columnIndex;

		result.push(view);

		const { children } = view.model;
		if (children.length) {
			let width = 0;
			for (let child of children) {
				const childView = markup(child, rowIndex + rowspan, columnIndex, rowsLeft - rowspan);
				const { colspan } = childView;
				width += colspan;
				columnIndex += colspan;
			}

			view.colspan = width;
		}

		return view;
	}

	markup(root, 0, 0, rowsToUse(root));
	result.splice(0, 1);
	return layout(result);
}

function layout(columns) {
	const matrix = [];

	columns.sort((x, y) => {
		const xc = x.rowIndex - y.rowIndex;
		if (xc === 0) {
			return x.columnIndex - y.columnIndex;
		}

		return xc;
	});

	for (let column of columns) {
		if (!matrix[column.rowIndex]) {
			matrix[column.rowIndex] = [];
		}
		matrix[column.rowIndex].push(column);
	}

	return matrix;
}

function rowsToUseFactory() {
	const cache = new Map();
	return function rowsToUse(column, depth = 0) {
		if (cache.has(column.key)) {
			return cache.get(column.key);
		}

		const { children } = column;
		let count = children.length == 0 ? 0 : 1;
		for (let child of children) {
			count = Math.max(count, rowsToUse(child, depth + 1));
		}

		const result = 1 + count;
		cache.set(column.key, result);
		return result;
	}
}


export function expand(rows) {
	const mx = [];
	const offsets = [];
	for (let y = 0, height = rows.length; y < height; y++) {
		const columns = rows[y];
		for (let x = 0, width = columns.length; x < width; x++) {
			const column = columns[x];
			const { rowspan, colspan } = column;
			for (let i = 0; i < rowspan; i++) {
				const yi = y + i;
				const row = mx.length > yi ? mx[yi] : mx[yi] = [];
				const gaps = offsets.length > yi ? offsets[yi] : offsets[yi] = [0];
				const offset = gaps.shift();
				for (let j = 0; j < colspan; j++) {
					const xj = offset + j;
					row[xj] = column;
				}

				const last = offset + colspan;
				if (!row[last]) {
					gaps.push(last);
				}
			}
		}
	}

	return mx;
}

export function collapse(matrix) {
	const line = [];
	const height = matrix.length;
	if (height) {
		const set = new Set();
		const lastRow = matrix[height - 1];
		const width = lastRow.length;
		for (let i = 0; i < width; i++) {
			const column = lastRow[i];
			if (set.has(column)) {
				continue;
			}

			line.push(column);
			set.add(column);
		}
	}

	return line;
}