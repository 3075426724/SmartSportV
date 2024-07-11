/**
 * Notes: 活动模块后台管理-控制器
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2022-06-23 10:20:00 
 */

const BaseProjectAdminController = require('./base_project_admin_controller.js');

const AdminEnrollService = require('../../service/admin/admin_enroll_service.js');
const timeUtil = require('../../../../framework/utils/time_util.js');
const dataUtil = require('../../../../framework/utils/data_util.js');
const contentCheck = require('../../../../framework/validate/content_check.js');
const EnrollModel = require('../../model/enroll_model.js');
const EnrollService = require('../../service/enroll_service.js');


class AdminEnrollController extends BaseProjectAdminController {

	async getEnrollJoinDetail() {
		await this.isAdmin();

		let rules = {
			id: 'must|string',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminEnrollService();
		let enrollJoin = await service.getEnrollJoinDetail(input.id);

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

	async getAdminAllEnroll() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			cateId: 'must|id', 
			day: 'must|string',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new EnrollService();
		return await service.getAllEnroll('', input.cateId, input.day);
	}

	async getAdminPayFlowList() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			search: 'string|min:1|max:30|name=搜索条件',
			sortType: 'string|name=搜索类型',
			sortVal: 'name=搜索类型值',
			orderBy: 'object|name=排序',
			page: 'must|int|default=1',
			size: 'int|default=10',
			isTotal: 'bool',
			oldTotal: 'int',
		};

		// 取得数据
		let input = this.validateData(rules);

		const PayService = require('../../service/pay_service.js');
		let service = new PayService();
		let result = await service.getPayFlowList(input);

		// 数据格式化
		let list = result.list;
		for (let k = 0; k < list.length; k++) {
			list[k].PAY_ADD_TIME = timeUtil.timestamp2Time(list[k].PAY_ADD_TIME);
			list[k].PAY_REFUND_TIME = timeUtil.timestamp2Time(list[k].PAY_REFUND_TIME);
			list[k].PAY_END_TIME = timeUtil.timestamp2Time(list[k].PAY_END_TIME);
			list[k].PAY_USER_ID = list[k].PAY_USER_ID.split('^^^')[1];

		}
		result.list = list;

		return result;

	}

	async enrollJoinByAdmin() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			mobile: 'must|mobile',
			enrollId: 'must|id',
			start: 'must|string',
			end: 'must|string',
			endPoint: 'must|string',
			day: 'must|string',
			price: 'must|int',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminEnrollService();
		return await service.enrollJoinByAdmin(input);
	}

	/** 管理员按钮核验 */
	async checkinEnrollJoin() {
		await this.isAdmin();

		let rules = {
			enrollJoinId: 'must|id',
			val: 'must|int',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminEnrollService();
		await service.checkinEnrollJoin(input.enrollJoinId, input.val);
	}


	/** 管理员扫码核验 */
	async scanEnrollJoin() {
		await this.isAdmin();

		let rules = {
			code: 'must|string|len:15',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminEnrollService();
		return await service.scanEnrollJoin(input.code);
	}

	/** 置顶与排序设定 */
	async sortEnroll() {
		await this.isAdmin();

		let rules = {
			id: 'must|id',
			sort: 'must|int',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminEnrollService();
		await service.sortEnroll(input.id, input.sort);
	}



	/** 状态修改 */
	async statusEnroll() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			id: 'must|id',
			status: 'must|int',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminEnrollService();
		return await service.statusEnroll(input.id, input.status);
	}

	/** 列表 */
	async getAdminEnrollList() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			search: 'string|min:1|max:30|name=搜索条件', 
			sortType: 'string|name=搜索类型',
			sortVal: 'name=搜索类型值',
			orderBy: 'object|name=排序',
			whereEx: 'object|name=附加查询条件',
			page: 'must|int|default=1',
			size: 'int',
			isTotal: 'bool',
			oldTotal: 'int',
		};

		// 取得数据
		let input = this.validateData(rules);

		let adminService = new AdminEnrollService();
		let result = await adminService.getAdminEnrollList(input);



		let now = timeUtil.time('Y-M-D');
		// 数据格式化
		let list = result.list;
		for (let k = 0; k < list.length; k++) {

			list[k].ENROLL_ADD_TIME = timeUtil.timestamp2Time(list[k].ENROLL_ADD_TIME, 'Y-M-D h:m:s');

			if (list[k].ENROLL_OBJ && list[k].ENROLL_OBJ.desc)
				delete list[k].ENROLL_OBJ.desc;

			// 计算可约天数
			let count = 0;
			let leaveDayDate = '';
			for (let j = 0; j < list[k].ENROLL_DAYS.length; j++) {
				if (list[k].ENROLL_DAYS[j] >= now) {
					leaveDayDate = list[k].ENROLL_DAYS[j];
					count++;
				}
			}
			list[k].leaveDay = count;
			list[k].leaveDayDate = leaveDayDate;


		}
		result.list = list;

		return result;

	}

	/** 发布 */
	async insertEnroll() {
		await this.isAdmin();

		// 数据校验 
		let rules = {
			title: 'must|string|min:2|max:50|name=标题', 

			cateId: 'must|string|name=场地分类',
			cateName: 'must|string|name=场地分类名称',

			order: 'must|int|min:0|max:9999|name=排序号',

			cancelSet: 'must|int|name=取消设置',
			editSet: 'must|int|name=修改设置',

			forms: 'array|name=表单',

			joinForms: 'must|array|name=用户填写资料设置',
		};


		// 取得数据
		let input = this.validateData(rules);

		// 内容审核
		await contentCheck.checkTextMultiAdmin(input);

		let service = new AdminEnrollService();
		let result = await service.insertEnroll(input);

		this.logOther('添加了《' + input.title + '》');

		return result;

	}

	/** 获取信息用于编辑修改 */
	async getEnrollDetail() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			id: 'must|id',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminEnrollService();
		let enroll = await service.getEnrollDetail(input.id);


		return enroll;

	}

	/** 编辑 */
	async editEnroll() {
		await this.isAdmin();

		let rules = {
			id: 'must|id',
			title: 'must|string|min:2|max:50|name=标题', 

			cateId: 'must|string|name=场地分类',
			cateName: 'must|string|name=场地分类名称',

			cancelSet: 'must|int|name=取消设置',
			editSet: 'must|int|name=修改设置',

			order: 'must|int|min:0|max:9999|name=排序号',
			forms: 'array|name=表单',

			joinForms: 'must|array|name=用户填写资料设置',
		};

		// 取得数据
		let input = this.validateData(rules);

		// 内容审核
		await contentCheck.checkTextMultiAdmin(input);

		let service = new AdminEnrollService();
		let result = service.editEnroll(input);

		this.logOther('修改了《' + input.title + '》');

		return result;
	}



	/** 删除 */
	async delEnroll() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			id: 'must|id',
		};

		// 取得数据
		let input = this.validateData(rules);

		let title = await EnrollModel.getOneField(input.id, 'ENROLL_TITLE');

		let service = new AdminEnrollService();
		await service.delEnroll(input.id);

		if (title)
			this.logOther('删除了《' + title + '》');

	}

	/** 更新图片信息 */
	async updateEnrollForms() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			id: 'must|id',
			hasImageForms: 'array'
		};

		// 取得数据
		let input = this.validateData(rules);

		// 内容审核
		await contentCheck.checkTextMultiAdmin(input);

		let service = new AdminEnrollService();
		return await service.updateEnrollForms(input);
	}

	//########################## 订单
	/** 订单列表 */
	async getEnrollJoinList() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			search: 'string|min:1|max:30|name=搜索条件',
			sortType: 'string|name=搜索类型',
			sortVal: 'name=搜索类型值',
			orderBy: 'object|name=排序', 
			page: 'must|int|default=1',
			size: 'int|default=10',
			isTotal: 'bool',
			oldTotal: 'int',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminEnrollService();
		let result = await service.getEnrollJoinList(input);

		// 数据格式化
		let list = result.list;
		for (let k = 0; k < list.length; k++) {
			list[k].ENROLL_JOIN_PAY_TIME = timeUtil.timestamp2Time(list[k].ENROLL_JOIN_PAY_TIME);
			list[k].ENROLL_JOIN_CANCEL_TIME = timeUtil.timestamp2Time(list[k].ENROLL_JOIN_CANCEL_TIME);
			list[k].ENROLL_JOIN_ADD_TIME = timeUtil.timestamp2Time(list[k].ENROLL_JOIN_ADD_TIME);
			list[k].ENROLL_JOIN_PAY_FEE = Number(dataUtil.fmtMoney(list[k].ENROLL_JOIN_PAY_FEE / 100));

		}
		result.list = list;

		return result;

	}


	/** 预订取消 */
	async cancelEnrollJoin() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			enrollJoinId: 'must|id'
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminEnrollService();
		return await service.cancelEnrollJoin(input.enrollJoinId);
	}

	/**************登记数据导出 BEGIN ********************* */
	/** 当前是否有导出文件生成 */
	async enrollJoinDataGet() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			isDel: 'int|must', //是否删除已有记录
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminEnrollService();

		if (input.isDel === 1)
			await service.deleteEnrollJoinDataExcel(); //先删除

		return await service.getEnrollJoinDataURL();
	}

	/** 导出数据 */
	async enrollJoinDataExport() {
		await this.isAdmin();

		// 数据校验
		let rules = { 
			cateId: 'id|must',
			start: 'string|must',
			end: 'string|must',
			status: 'int|must|default=1'
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminEnrollService();
		return await service.exportEnrollJoinDataExcel(input);
	}

	/** 删除导出的登记数据文件 */
	async enrollJoinDataDel() {
		await this.isAdmin();

		// 数据校验
		let rules = { 
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminEnrollService();
		return await service.deleteEnrollJoinDataExcel();
	}


	async editDays() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			enrollId: 'id|must',
			days: 'array'
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminEnrollService();
		return await service.editDays(input);
	}

	async getAllDay() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			enrollId: 'id|must',
		};

		// 取得数据
		let input = this.validateData(rules);
		let service = new AdminEnrollService();
		return await service.getAllDays(input.enrollId);
	}

	/****************模板 */
	/** 创建模板 */
	async insertTemp() {
		await this.isAdmin();

		let rules = {
			name: 'must|string|min:1|max:20|name=名称',
			times: 'must|array|name=模板时段' 
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminEnrollService();
		let result = await service.insertTemp(input);

		return result;

	}

	/** 编辑模板 */
	async editTemp() {
		await this.isAdmin();

		let rules = {
			id: 'must|id',
			price: 'must|int|name=价格',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminEnrollService();
		let result = service.editTemp(input);

		return result;
	}

	/** 模板列表 */
	async getTempList() {
		await this.isAdmin();

		let rules = { 
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminEnrollService();
		let result = await service.getTempList();

		return result;
	}

	/** 删除模板 */
	async delTemp() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			id: 'must|id',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminEnrollService();
		await service.delTemp(input.id);

	}

}

module.exports = AdminEnrollController;