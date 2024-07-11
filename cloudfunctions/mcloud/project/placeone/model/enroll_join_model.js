/**
 * Notes: 登记表格报名实体
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2022-07-04 19:20:00 
 */


const BaseProjectModel = require('./base_project_model.js');

class EnrollJoinModel extends BaseProjectModel {

}

// 集合名
EnrollJoinModel.CL = BaseProjectModel.C('enroll_join');

EnrollJoinModel.DB_STRUCTURE = {
	_pid: 'string|true',
	ENROLL_JOIN_ID: 'string|true',

	ENROLL_JOIN_IS_ADMIN: 'int|true|default=0|comment=是否管理员添加 0/1', 

	ENROLL_JOIN_ENROLL_ID: 'string|true|comment=报名PK',
	ENROLL_JOIN_ENROLL_TITLE: 'string|false',
	ENROLL_JOIN_CATE_ID: 'string|false|default=0|comment=分类',
	ENROLL_JOIN_CATE_NAME: 'string|false|comment=分类冗余',


	ENROLL_JOIN_CODE: 'string|true|comment=核验码15位',
	ENROLL_JOIN_IS_CHECKIN: 'int|true|default=0|comment=是否核销 0/1 ',
	ENROLL_JOIN_CHECKIN_TIME: 'int|true|default=0',

	ENROLL_JOIN_DAY: 'string|false|comment=日期',
	ENROLL_JOIN_START: 'string|false|comment=开始时间',
	ENROLL_JOIN_END: 'string|false|comment=结束时间',
	ENROLL_JOIN_END_POINT: 'string|false|comment=结束时间末尾',

	ENROLL_JOIN_END_FULL: 'string|false|comment=完整的结束时间 YYYY-MM-DD hh:mm',
	ENROLL_JOIN_START_FULL: 'string|false|comment=完整的开始时间 YYYY-MM-DD hh:mm',

	ENROLL_JOIN_USER_ID: 'string|true|comment=用户ID',
	ENROLL_JOIN_FORMS: 'array|true|default=[]|comment=表单',
	ENROLL_JOIN_OBJ: 'object|true|default={}',

	ENROLL_JOIN_STATUS: 'int|true|default=1|comment=状态 1=成功, 9=用户取消, 99=系统取消',

	ENROLL_JOIN_LAST_TIME: 'int|true|default=0',
	ENROLL_JOIN_CANCEL_TIME: 'int|true|default=0',


	ENROLL_JOIN_FEE: 'int|true|default=0|comment=需支付费用 分',

	ENROLL_JOIN_PAY_TRADE_NO: 'string|false|comment=商家订单号 32位',
	ENROLL_JOIN_PAY_STATUS: 'int|true|default=0|comment=支付状态 0=未支付 1=已支付 8=已退款 99=无需支付',
	ENROLL_JOIN_PAY_FEE: 'int|true|default=0|comment=已支付费用 分',
	ENROLL_JOIN_PAY_TIME: 'int|true|default=0|comment=支付时间',


	ENROLL_JOIN_ADD_TIME: 'int|true',
	ENROLL_JOIN_EDIT_TIME: 'int|true',
	ENROLL_JOIN_ADD_IP: 'string|false',
	ENROLL_JOIN_EDIT_IP: 'string|false',
};

// 字段前缀
EnrollJoinModel.FIELD_PREFIX = "ENROLL_JOIN_";

/**
 * 状态  1=成功,9=用户取消, 99=审核未过 
 */
EnrollJoinModel.STATUS = {
	SUCC: 1,
	CANCEL: 9,
	ADMIN_CANCEL: 99
};

EnrollJoinModel.STATUS_DESC = {
	SUCC: '成功',
	CANCEL: '用户取消',
	ADMIN_CANCEL: '系统取消'
};

module.exports = EnrollJoinModel;