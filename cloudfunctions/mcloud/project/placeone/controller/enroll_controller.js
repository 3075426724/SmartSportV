/**
 * Notes: 登记模块控制器
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2022-06-23 04:00:00 
 */

const BaseProjectController = require('./base_project_controller.js');
const EnrollService = require('../service/enroll_service.js');
const timeUtil = require('../../../framework/utils/time_util.js');
const dataUtil = require('../../../framework/utils/data_util.js');

class EnrollController extends BaseProjectController {
 

	async getAllEnroll() {
		// 数据校验
		let rules = {
			cateId: 'must|id',
			day: 'must|string',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new EnrollService();
		return await service.getAllEnroll(this._userId, input.cateId, input.day); 
	}

	async getUsedByDay() {
		// 数据校验
		let rules = {
			cateId: 'must|id',
			day: 'must|string',
			isAdmin: 'must|int|default=0',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new EnrollService();
		let list = await service.getUsedByDay(input.cateId, input.day);

		let ret = [];
		for (let k = 0; k < list.length; k++) {

			//用户数据 
			let forms = {};
			let name = list[k].ENROLL_JOIN_OBJ.name;

			if (input.isAdmin == 1) {
				// 管理后台展示
				forms.status = list[k].ENROLL_JOIN_STATUS;
				forms.payStatus = list[k].ENROLL_JOIN_PAY_STATUS;

				forms.list = list[k].ENROLL_JOIN_FORMS;
				forms.address = '【' + list[k].ENROLL_JOIN_CATE_NAME + '】 ' + list[k].ENROLL_JOIN_ENROLL_TITLE;
				forms.time = list[k].ENROLL_JOIN_DAY + ' ' + list[k].ENROLL_JOIN_START + '~' + list[k].ENROLL_JOIN_END_POINT;
				forms.joinId = list[k]._id;

				if (list[k].ENROLL_JOIN_IS_CHECKIN == 1)
					name = '[已核销] ' + name;
				else
					name = '[未核销] ' + name;

				let fee = list[k].ENROLL_JOIN_PAY_FEE = Number(dataUtil.fmtMoney(list[k].ENROLL_JOIN_PAY_FEE / 100));
				forms.fee = fee;
			}

			let node = {
				forms,
				enrollId: list[k].ENROLL_JOIN_ENROLL_ID,
				userId: list[k].ENROLL_JOIN_USER_ID,
				start: list[k].ENROLL_JOIN_START,
				end: list[k].ENROLL_JOIN_END,
				isCheckin: list[k].ENROLL_JOIN_IS_CHECKIN,
				title: name,
				url: '../my_join_detail/enroll_my_join_detail?id=' + list[k]._id
			}
			ret.push(node);
		}

		return ret;
	}

	/** 我的预订登记列表 */
	async getMyEnrollJoinList() {

		// 数据校验
		let rules = {
			search: 'string|min:1|max:30|name=搜索条件',
			sortType: 'string|name=搜索类型',
			sortVal: 'name=搜索类型值',
			orderBy: 'object|name=排序',
			page: 'must|int|default=1',
			size: 'int',
			isTotal: 'bool',
			oldTotal: 'int',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new EnrollService();
		let result = await service.getMyEnrollJoinList(this._userId, input);

		// 数据格式化
		let list = result.list;


		for (let k = 0; k < list.length; k++) {

			list[k].ENROLL_JOIN_ADD_TIME = timeUtil.timestamp2Time(list[k].ENROLL_JOIN_ADD_TIME, 'Y-M-D h:m');
			list[k].ENROLL_JOIN_LAST_TIME = timeUtil.timestamp2Time(list[k].ENROLL_JOIN_LAST_TIME, 'Y-M-D h:m');

			list[k].out = !(list[k].ENROLL_JOIN_END_FULL > timeUtil.time('Y-M-D h:m'));
		}

		result.list = list;

		return result;

	}

	/** 我的登记详情 */
	async getMyEnrollJoinDetail() {
		// 数据校验
		let rules = {
			enrollJoinId: 'must|id',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new EnrollService();
		let enrollJoin = await service.getMyEnrollJoinDetail(this._userId, input.enrollJoinId);
		if (enrollJoin) {
			enrollJoin.ENROLL_JOIN_ADD_TIME = timeUtil.timestamp2Time(enrollJoin.ENROLL_JOIN_ADD_TIME);
			enrollJoin.ENROLL_JOIN_LAST_TIME = timeUtil.timestamp2Time(enrollJoin.ENROLL_JOIN_LAST_TIME);
			enrollJoin.ENROLL_JOIN_CHECKIN_TIME = timeUtil.timestamp2Time(enrollJoin.ENROLL_JOIN_CHECKIN_TIME);
			enrollJoin.ENROLL_JOIN_CANCEL_TIME = timeUtil.timestamp2Time(enrollJoin.ENROLL_JOIN_CANCEL_TIME, 'Y-M-D h:m');

			enrollJoin.ENROLL_JOIN_FEE = Number(dataUtil.fmtMoney(enrollJoin.ENROLL_JOIN_FEE / 100));
			enrollJoin.ENROLL_JOIN_PAY_FEE = Number(dataUtil.fmtMoney(enrollJoin.ENROLL_JOIN_PAY_FEE / 100)); 
			
			enrollJoin.out = enrollJoin.ENROLL_JOIN_END_FULL < timeUtil.time('Y-M-D h:m');
		}
		return enrollJoin;

	}

	/**  登记前获取关键信息 */
	async detailForEnrollJoin() {
		// 数据校验
		let rules = {
			enrollId: 'must|id',
			enrollJoinId: 'id',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new EnrollService();
		let meet = await service.detailForEnrollJoin(this._userId, input.enrollId, input.enrollJoinId);

		if (meet) {
			// 显示转换  
		}

		return meet;
	}

	/** 登记提交 */
	async prepay() {
		// 数据校验
		let rules = {
			enrollId: 'must|id',
			start: 'must|string',
			end: 'must|string',
			endPoint: 'must|string',
			day: 'must|string',
			price: 'must|int',
			forms: 'must|array',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new EnrollService();
		return await service.prepay(this._userId, input);
	}

	/** 登记修改提交 */
	async enrollJoinEdit() {
		// 数据校验
		let rules = {
			enrollId: 'must|id',
			enrollJoinId: 'must|id',
			forms: 'must|array',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new EnrollService();
		return await service.enrollJoinEdit(this._userId, input.enrollId, input.enrollJoinId, input.forms);
	}

	/** 登记取消*/
	async cancelMyEnrollJoin() {
		// 数据校验
		let rules = {
			enrollJoinId: 'must|id',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new EnrollService();
		return await service.cancelMyEnrollJoin(this._userId, input.enrollJoinId);
	}



}

module.exports = EnrollController;