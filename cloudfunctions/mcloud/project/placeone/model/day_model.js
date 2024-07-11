/**
 * Notes: 预订日期设置实体
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2021-01-25 19:20:00 
 */


const BaseProjectModel = require('./base_project_model.js');

class DayModel extends BaseProjectModel {

}

// 集合名
DayModel.CL = BaseProjectModel.C('day');

DayModel.DB_STRUCTURE = {
	_pid: 'string|true',

	DAY_ID: 'string|true',
	DAY_ENROLL_ID: 'string|true', 
	DAY_CATE_ID: 'string|false|default=0|comment=分类',


	day: 'string|true|comment=日期 yyyy-mm-dd',
	dayDesc: 'string|true|comment=描述',
	times: 'array|true|comment=具体时间段',
	/*
		{
			1. mark=唯一性标识,
			2. start=开始时间点hh:mm ～,  
			3. end=结束时间点hh:mm, 
			4. price=价格,   
			5. cnt=成功与否 
		}', 
	*/

	DAY_ADD_TIME: 'int|true',
	DAY_EDIT_TIME: 'int|true',
	DAY_ADD_IP: 'string|false',
	DAY_EDIT_IP: 'string|false',
};

// 字段前缀
DayModel.FIELD_PREFIX = "DAY_";



module.exports = DayModel;