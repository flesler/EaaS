const SEPARATOR = ',';
const QUOTE = '"';

exports.from = function(rows) {
	var cols = getCols(rows);

	rows = rows.map(function(row) {
		return extractValues(row, cols);
	});

	rows.unshift(cols);

	return rows.map(valuesToCSV).join('\n');
};

function getCols(rows) {
	var cols = {};
	rows.forEach(function(row) {
		Object.keys(row).forEach(function(key) {
			cols[key] = true;
		});
	});
	return Object.keys(cols);
}

function valuesToCSV(vals) {
	return vals.map(function(val) {
		if (val == null) return '';
		val = val + '';
		if (~val.indexOf(SEPARATOR)) {
			val = QUOTE+val+QUOTE;
		}
		return val;
	}).join(SEPARATOR);
}

function extractValues(row, cols) {
	return cols.map(function(col) {
		return row[col];
	});
}