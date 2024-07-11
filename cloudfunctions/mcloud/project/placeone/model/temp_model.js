/**
 * Notes: 预订日期设置实体
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2021-01-25 19:20:00 
 */


const BaseProjectModel = require('./base_project_model.js');

class TempModel extends BaseProjectModel {

}

// 集合名
TempModel.CL = BaseProjectModel.C('temp');

TempModel.DB_STRUCTURE = {
	_pid: 'string|true',

	TEMP_ID: 'string|true',
	TEMP_NAME: 'string|true|comment=名字', 

	TEMP_TIMES: 'array|true|comment=时间段',

	TEMP_ADD_TIME: 'int|true',
	TEMP_EDIT_TIME: 'int|true',
	TEMP_ADD_IP: 'string|false',
	TEMP_EDIT_IP: 'string|false',
};

// 字段前缀
TempModel.FIELD_PREFIX = "TEMP_";



module.exports = TempModel;