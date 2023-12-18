
const helper = require('../../../helper/helper.js');
const dataHelper = require('../../../helper/data_helper.js');

const BASE_ROW = { mark: '', title: '', val: '', pic: '', detail: [], edit: true };

function fmtRows(rows) {
	for (let k = 0; k < rows.length; k++) {
		let node = rows[k];

		// 补充编号
		if (!node['mark']) node['mark'] = mark();

		if (!helper.isDefined(node['title'])) node['title'] = '';
		if (!helper.isDefined(node['val'])) node['val'] = '';
		if (!helper.isDefined(node['pic'])) node['pic'] = '';

		if (!helper.isDefined(node['detail'])) node['detail'] = [];
		if (!Array.isArray(node['detail'])) node['detail'] = [];

		if (!helper.isDefined(node['edit'])) node['edit'] = true;
	}
 
	return rows;
}

function mark() {
	return dataHelper.genRandomAlpha(10).toUpperCase();
};

module.exports = {
	BASE_ROW,
	fmtRows,
	mark
}