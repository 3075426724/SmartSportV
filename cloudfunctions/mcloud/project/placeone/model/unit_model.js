/**
 * Notes: 球场实体
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY www.code942.com
 * Date: 2020-10-23 19:20:00 
 */


const BaseProjectModel = require('./base_project_model.js');

class UnitModel extends BaseProjectModel {

}

// 集合名
UnitModel.CL = BaseProjectModel.C('unit');

UnitModel.DB_STRUCTURE = {
	_id: 'string|true',
	_pid: 'string|true',

	UNIT_ID: 'string|true',

	UNIT_TITLE: 'string|true|comment=标题',
	UNIT_ORDER: 'int|true|default=9999',


	UNIT_STATUS: 'int|true|default=1|comment=状态 0=停用 1=正常',

	UNIT_VOUCH: 'int|true|default=0',

	UNIT_ADDRESS_DETAIL: 'string|false|comment=详细地址',
	UNIT_ADDRESS: 'object|false|comment=详细地址坐标参数',

	UNIT_FORMS: 'array|true|default=[]',
	UNIT_OBJ: 'object|true|default={}', 

	UNIT_LOCATION: 'object|true|default={}|comment=详细地址坐标',

	UNIT_QR: 'string|false',
	UNIT_VIEW_CNT: 'int|true|default=0|comment=访问次数', 

	UNIT_ADD_TIME: 'int|true',
	UNIT_EDIT_TIME: 'int|true',
	UNIT_ADD_IP: 'string|false',
	UNIT_EDIT_IP: 'string|false',
};

// 字段前缀
UnitModel.FIELD_PREFIX = "UNIT_";

UnitModel.STATUS = {
	UNUSE: 0,
	COMM: 1
};

module.exports = UnitModel;