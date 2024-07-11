/**
 * Notes: 场馆后台管理模块业务逻辑
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2020-11-14 07:48:00 
 */

const BaseBiz = require('../../../comm/biz/base_biz.js');
const projectSetting = require('../public/project_setting.js');

class AdminUnitBiz extends BaseBiz {

	static async getAllUnitOptions() {
		return [{
			label: 'one',
			level: 1,
			parentId: '',
			type: 'unitId',
			val: 'one',
			value: 'one'
		}];
	}

	static getUnitTitle(allUnitOptions, unitId) {
		for (let k = 0; k < allUnitOptions.length; k++) {
			if (allUnitOptions[k].val == unitId) return allUnitOptions[k].label;
		}
		return '';
	}   

} 


module.exports = AdminUnitBiz;