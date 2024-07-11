/**
 * Notes: 登记后台管理
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2022-06-23 07:48:00 
 */

const BaseProjectAdminService = require('./base_project_admin_service.js');
const EnrollService = require('../enroll_service.js');
const util = require('../../../../framework/utils/util.js');
const EnrollModel = require('../../model/enroll_model.js');
const EnrollJoinModel = require('../../model/enroll_join_model.js');
const cloudUtil = require('../../../../framework/cloud/cloud_util.js');
const timeUtil = require('../../../../framework/utils/time_util.js');
const dataUtil = require('../../../../framework/utils/data_util.js');
const exportUtil = require('../../../../framework/utils/export_util.js');

const DayModel = require('../../model/day_model.js');
const TempModel = require('../../model/temp_model.js');
const UserModel = require('../../model/user_model.js');

// 导出登记数据KEY
const EXPORT_ENROLL_JOIN_DATA_KEY = 'EXPORT_ENROLL_JOIN_DATA';

class AdminEnrollService extends BaseProjectAdminService {

	async getEnrollJoinDetail(enrollJoinId) {

		let where = {};
		if (enrollJoinId.length == 15)
			where.ENROLL_JOIN_CODE = enrollJoinId;
		else
			where = id;

		let fields = '*';

		let enrollJoin = await EnrollJoinModel.getOne(where, fields);

		return enrollJoin;
	}


	// 管理员代预订 
	async enrollJoinByAdmin({
		mobile,
		enrollId,
		price,
		start,
		end,
		endPoint,
		day
	}) {
		this.AppError('[场地预订P]该功能暂不开放，如有需要请加作者微信：cclinux0730');

	}

	/** 管理员按钮核销 */
	async checkinEnrollJoin(enrollJoinId, val) {

		this.AppError('[场地预订P]该功能暂不开放，如有需要请加作者微信：cclinux0730');
	}

	/** 管理员扫码核销 */
	async scanEnrollJoin(code) {
		this.AppError('[场地预订P]该功能暂不开放，如有需要请加作者微信：cclinux0730');
	}


	/**取得分页列表 */
	async getAdminEnrollList({
		search, // 搜索条件
		sortType, // 搜索菜单
		sortVal, // 搜索菜单
		orderBy, // 排序
		whereEx, //附加查询条件
		page,
		size,
		isTotal = true,
		oldTotal
	}) {

		orderBy = orderBy || {
			'ENROLL_ORDER': 'asc',
			'ENROLL_ADD_TIME': 'desc'
		};
		let fields = 'ENROLL_DAYS,ENROLL_TITLE,ENROLL_CATE_ID,ENROLL_CATE_NAME,ENROLL_EDIT_TIME,ENROLL_ADD_TIME,ENROLL_ORDER,ENROLL_STATUS,ENROLL_VOUCH,ENROLL_EDIT_SET,ENROLL_CANCEL_SET,ENROLL_QR,ENROLL_OBJ';

		let where = {};
		where.and = {
			_pid: this.getProjectId() //复杂的查询在此处标注PID
		};

		if (util.isDefined(search) && search) {
			where.or = [{
				ENROLL_TITLE: ['like', search]
			},];

		} else if (sortType && util.isDefined(sortVal)) {
			// 搜索菜单
			switch (sortType) {
				case 'cateId': {
					where.and.ENROLL_CATE_ID = String(sortVal);
					break;
				}
				case 'status': {
					where.and.ENROLL_STATUS = Number(sortVal);
					break;
				}
				case 'vouch': {
					where.and.ENROLL_VOUCH = 1;
					break;
				}
				case 'top': {
					where.and.ENROLL_ORDER = 0;
					break;
				}
				case 'sort': {
					orderBy = this.fmtOrderBySort(sortVal, 'ENROLL_ADD_TIME');
					break;
				}
			}
		}

		return await EnrollModel.getList(where, fields, orderBy, page, size, isTotal, oldTotal);
	}

	/**置顶与排序设定 */
	async sortEnroll(id, sort) {
		this.AppError('[场地预订P]该功能暂不开放，如有需要请加作者微信：cclinux0730');
	}


	/**添加 */
	async insertEnroll({
		title,

		cateId,
		cateName,
		cancelSet,
		editSet,

		order,
		forms,
		joinForms,
	}) {

		this.AppError('[场地预订P]该功能暂不开放，如有需要请加作者微信：cclinux0730');
	}

	/**删除数据 */
	async delEnroll(id) {
		this.AppError('[场地预订P]该功能暂不开放，如有需要请加作者微信：cclinux0730');


	}

	/**获取信息 */
	async getEnrollDetail(id) {
		return await EnrollModel.getOne(id, '*');
	}


	// 更新forms信息
	async updateEnrollForms({
		id,
		hasImageForms
	}) {
		this.AppError('[场地预订P]该功能暂不开放，如有需要请加作者微信：cclinux0730');

	}


	/**更新数据 */
	async editEnroll({
		id,
		title,

		cateId, // 二级分类 
		cateName,

		cancelSet,
		editSet,

		order,
		forms,
		joinForms
	}) {

		this.AppError('[场地预订P]该功能暂不开放，如有需要请加作者微信：cclinux0730');

	}

	/**修改状态 */
	async statusEnroll(id, status) {
		this.AppError('[场地预订P]该功能暂不开放，如有需要请加作者微信：cclinux0730');

	}


	//#############################
	/**登记分页列表 */
	async getEnrollJoinList({
		search, // 搜索条件
		sortType, // 搜索菜单
		sortVal, // 搜索菜单
		orderBy, // 排序
		page,
		size,
		isTotal = true,
		oldTotal
	}) {

		orderBy = orderBy || {
			'ENROLL_JOIN_ADD_TIME': 'desc'
		};
		let fields = '*';

		let where = {
		 
		};
		if (util.isDefined(search) && search) {
			if (search.length == 10 && search.includes('-')) {
				where['ENROLL_JOIN_DAY'] = search;
				console.log(where)
			}
			else {
				where['ENROLL_JOIN_FORMS.val'] = {
					$regex: '.*' + search,
					$options: 'i'
				};
			}

		} else if (sortType && util.isDefined(sortVal)) {
			// 搜索菜单
			switch (sortType) {
				case 'cateId': {
					where.ENROLL_JOIN_CATE_ID = sortVal;
					break;
				}
				case 'status': {
					where.ENROLL_JOIN_STATUS = Number(sortVal);
					break;
				}
				case 'check': {
					where.ENROLL_JOIN_IS_CHECK = Number(sortVal);
					break;
				}
				case 'new': {
					orderBy = {
						'ENROLL_JOIN_ADD_TIME': 'desc'
					};
				}

			}
		}

		return await EnrollJoinModel.getList(where, fields, orderBy, page, size, isTotal, oldTotal);
	}

	/** 取消 */
	async cancelEnrollJoin(enrollJoinId) {
		this.AppError('[场地预订P]该功能暂不开放，如有需要请加作者微信：cclinux0730');


	}

	// #####################导出登记数据
	/**获取登记数据 */
	async getEnrollJoinDataURL() {
		return await exportUtil.getExportDataURL(EXPORT_ENROLL_JOIN_DATA_KEY );
	}

	/**删除登记数据 */
	async deleteEnrollJoinDataExcel() {
		return await exportUtil.deleteDataExcel(EXPORT_ENROLL_JOIN_DATA_KEY);
	}

	/**导出登记数据 */
	async exportEnrollJoinDataExcel({
		cateId,
		start,
		end,
		status
	}) {

		this.AppError('[场地预订P]该功能暂不开放，如有需要请加作者微信：cclinux0730');

	}


	/** 计算排期 */
	async statDayCnt(enrollId) {
		this.AppError('[场地预订P]该功能暂不开放，如有需要请加作者微信：cclinux0730');
	}

	/** 更新日期设置 */
	async editDays(
		{
			enrollId,
			days
		}
	) {
		this.AppError('[场地预订P]该功能暂不开放，如有需要请加作者微信：cclinux0730');
	}

	async getAllDays(enrollId) {
		// 删除之前超时数据
		let nowDay = timeUtil.time('Y-M-D');
		let whereOut = {
			DAY_ENROLL_ID: enrollId,
			day: ['<', nowDay]
		}
		console.log(whereOut)
		await DayModel.del(whereOut);

		let where = {
			DAY_ENROLL_ID: enrollId,
		}
		return DayModel.getAll(where, 'day, dayDesc, times');
	}

	/****************模板 */

	/**添加模板 */
	async insertTemp({
		name,
		times,
	}) {

		this.AppError('[场地预订P]该功能暂不开放，如有需要请加作者微信：cclinux0730');
	}

	/**更新数据 */
	async editTemp({
		id,
		price,
	}) {


		this.AppError('[场地预订P]该功能暂不开放，如有需要请加作者微信：cclinux0730');
	}


	/**删除数据 */
	async delTemp(id) {
		this.AppError('[场地预订P]该功能暂不开放，如有需要请加作者微信：cclinux0730');
	}


	/**分页列表 */
	async getTempList() {
		let orderBy = {
			'TEMP_ADD_TIME': 'desc'
		};
		let fields = 'TEMP_NAME,TEMP_TIMES';

		let where = {
		};
		return await TempModel.getAll(where, fields, orderBy);
	}

}

module.exports = AdminEnrollService;