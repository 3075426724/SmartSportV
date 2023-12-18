/**
 * Notes: 支付流水实体
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2023-02-26 19:20:00 
 */

const BaseProjectModel = require('./base_project_model.js');

class PayModel extends BaseProjectModel {

}

// 集合名
PayModel.CL = BaseProjectModel.C('pay');

PayModel.DB_STRUCTURE = {
	_pid: 'string|true',
	PAY_ID: 'string|true',

	PAY_TYPE: 'string|true|comment=业务类型',
	PAY_USER_ID: 'string|true',

	// 支付相关 to腾讯
	PAY_TRADE_NO: 'string|false|comment=商家订单号 32位',
	PAY_NONCESTR: 'string|false|comment=认证串',
	PAY_TIMESTAMP: 'int|true|comment=认证时间戳',
	PAY_PREPAY_ID: 'string|false|comment=微信预支付ID',
	PAY_TOTAL_FEE: 'int|true|default=0|comment=金额(分)',
	PAY_BODY: 'string|false|comment=简要描述',
	PAY_ATTACH: 'string|false|comment=商家附加识别码',

	// 退费相关 from腾讯
	PAY_OUT_REFUND_NO: 'string|false|comment=商家退款单号 64位',
	PAY_REFUND_TIME: 'int|default=0|false|comment=退款时间',
	PAY_REFUND_ID: 'string|false|comment=微信退款单号',
	PAY_REFUND_DESC: 'string|false|comment=退款原因',

	PAY_TRANSACTION_ID: 'string|false|comment=微信支付回调返回的支付单号',

	PAY_STATUS: 'int|true|default=0|comment=支付状态 0=待支付 1=已支付 8=已退款 9=支付失败 10=已关闭 99=无需支付',
	PAY_STATUS_DESC: 'string|false|default=0|comment=支付状态描述',

	PAY_DETAIL: 'string|false|comment=内容详细描述，无需传给微信',  

	PAY_END_TIME: 'string|false|default=0|comment=支付时间',

	PAY_ADD_TIME: 'int|true',
	PAY_EDIT_TIME: 'int|true',
	PAY_ADD_IP: 'string|false',
	PAY_EDIT_IP: 'string|false',

}
PayModel.STATUS = {
	//订单 0=待支付 1=已支付 8=已退款 9=失败 10=已关闭 99=无需支付
	NOTPAY: 0,
	SUCCESS: 1,
	REFUND: 8,
	FAIL: 9,
	CLOSED: 10,
	UNPAY: 99
};

PayModel.STATUS_DESC = {
	//订单 0=待支付 1=已支付 8=已退款 9=失败 10=已关闭 99=无需支付
	NOTPAY: 'NOTPAY',
	SUCCESS: 'SUCCESS',
	REFUND: 'REFUND',
	FAIL: 'FAIL',
	CLOSED: 'CLOSED',
	UNPAY: '无需支付'
};

// 字段前缀
PayModel.FIELD_PREFIX = "PAY_";

module.exports = PayModel;