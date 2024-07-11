/**
 * Notes: 登记模块后台管理模块业务逻辑
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2022-06-24 07:48:00 
 */

const BaseBiz = require('../../../comm/biz/base_biz.js');
const EnrollBiz = require('./enroll_biz.js');
const projectSetting = require('../public/project_setting.js');
const formSetHelper = require('../../../cmpts/public/form/form_set_helper.js');
const dataHelper = require('../../../helper/data_helper.js');




class AdminEnrollBiz extends BaseBiz {

	static getDaysTimeOptions() {
		let HourArr = [];
		let k = 0;

		for (k = 0; k <= 47; k++) {
			let node = {};

			if (k % 2 == 0)
				node.label = Math.trunc(k / 2) + '点00分';
			else
				node.label = Math.trunc(k / 2) + '点30分';

			node.val = Number(k);
			HourArr.push(node);
		}

		return HourArr;
	}

	static getDaysTimeEndOptions() {
		let HourArr = [];
		let k = 0;

		for (k = 0; k <= 47; k++) {
			let node = {};

			if (k % 2 == 0)
				node.label = Math.floor(k / 2) + '点29分';
			else
				node.label = Math.floor(k / 2) + '点59分';

			node.val = Number(k);
			HourArr.push(node);
		}

		return HourArr;
	}

	// 单个节点
	static getNewTimeNode(day) {
		let node = dataHelper.deepClone(projectSetting.ENROLL_TIME_NODE);
		day = day.replace(/-/g, '');
		node.mark = 'T' + day + 'AAA' + dataHelper.genRandomAlpha(10).toUpperCase();
		return node;
	}

	// 单日节点
	static getNewDayNode(day) {
		let node = [];
		node = dataHelper.deepClone(projectSetting.ENROLL_DAY_NODE);

		day = day.replace(/-/g, '');

		for (let k = 0; k < node.length; k++) {
			node[k].mark = 'T' + day + 'AAA' + dataHelper.genRandomAlpha(10).toUpperCase();
		}

		return node;
	}


	static initFormData(id = '') {
		let cateIdOptions = EnrollBiz.getCateList();

		return {
			id,

			cateIdOptions,
			fields: projectSetting.ENROLL_FIELDS,

			formTitle: '', 
			formCateId: (cateIdOptions.length == 1) ? cateIdOptions[0].val : '',
			formOrder: 9999,

			formCancelSet: 1,
			formEditSet: 1,

			formForms: [],

			formJoinForms: formSetHelper.initFields(projectSetting.ENROLL_JOIN_FIELDS)
		}

	}
}

AdminEnrollBiz.CHECK_FORM = {
	title: 'formTitle|must|string|min:2|max:50|name=场地名称',
 
	cateId: 'formCateId|must|id|name=场地分类',

	order: 'formOrder|must|int|min:0|max:9999|name=排序号',
	cancelSet: 'formCancelSet|must|int|name=取消设置',
	editSet: 'formEditSet|must|int|name=修改设置',
	forms: 'formForms|array',
	joinForms: 'formJoinForms|must|array|name=用户填写资料设置',
};

module.exports = AdminEnrollBiz;