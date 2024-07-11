/**
 * Notes: 登记表格模块业务逻辑
 * Ver : CCMiniCloud Framework 3.2.11 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2022-07-04 07:48:00 
 */

const BaseProjectService = require('./base_project_service.js');
const util = require('../../../framework/utils/util.js');
const dataUtil = require('../../../framework/utils/data_util.js');
const timeUtil = require('../../../framework/utils/time_util.js');
const UserModel = require('../model/user_model.js');
const DayModel = require('../model/day_model.js');
const EnrollModel = require('../model/enroll_model.js');
const EnrollJoinModel = require('../model/enroll_join_model.js');
const PayService = require('../service/pay_service.js');
const PayModel = require('../model/pay_model.js');
const projectConfig = require('../public/project_config.js');

class EnrollService extends BaseProjectService {

	async minuteJob() {
		console.log('### minuteJob >>>>>');


		// 未支付的成功订单取消  
		let time = this._timestamp - 6 * 60 * 1000;
		console.log('###### Begin>>> 未支付订单6分钟后取消, time<=' + time + ', ' + timeUtil.timestamp2Time(time));


		let where = {
			ENROLL_JOIN_STATUS: EnrollJoinModel.STATUS.SUCC,
			ENROLL_JOIN_PAY_STATUS: 0,
			ENROLL_JOIN_ADD_TIME: ['<=', time],
		}
		let rows = await EnrollJoinModel.getAll(where, '*', {}, 3000, false);
		console.log('未支付订单6分钟后取消， count=', rows.length);

		for (let k in rows) {
			let enrollJoin = rows[k];

			let tradeNo = enrollJoin.ENROLL_JOIN_PAY_TRADE_NO;

			if (!await this.fixEnrollJoinPay(tradeNo)) {
				console.log('该报名记录未支付，已取消并删除！', enrollJoin);
			}

		}

		console.log('###### END. 未支付订单6分钟后取消');

	}

	// 获取某天某个场所下的可约时间点
	async getOneDayTimePoint(day, enrollId) {
		if (projectConfig.IS_DEMO)
			return [{ mark: timeUtil.time(), start: 17, end: 43, price: 30, succ: false }];

		let where = {
			DAY_ENROLL_ID: enrollId,
			day
		};
		let fields = 'times';
		let data = await DayModel.getOne(where, fields);
		if (!data)
			data = [];
		else
			data = data.times;
		return data;
	}

	// 取得某天内所有场地信息
	async getAllEnroll(userId, cateId, day) {


		if (userId) await this.fixUserEnrollJoinPayRecord(userId);

		let where = {
			ENROLL_CATE_ID: String(cateId),
			ENROLL_STATUS: EnrollModel.STATUS.COMM
		}
		let orderBy = {
			ENROLL_ORDER: 'asc',
			ENROLL_ADD_TIME: 'desc'
		}
		let list = await EnrollModel.getAll(where, '*', orderBy);

		let arr = [];

		let startTime = 23;
		let endTime = 0;

		for (let k = 0; k < list.length; k++) {
			let times = await this.getOneDayTimePoint(day, list[k]._id);

			// 分解小时
			let t = [];
			for (let j = 0; j < times.length; j++) {

				if (times[j].start < startTime) startTime = times[j].start;
				if (times[j].end > endTime) endTime = times[j].end;

				for (let i = times[j].start; i <= times[j].end; i++) {
					let node = {
						t: i, //时间点
						price: times[j].price, //价格
					};
					t.push(node);
				}
			}

			if (t.length > 0)
				arr.push({
					enrollId: list[k]._id,
					label: list[k].ENROLL_TITLE,
					timePrice: t
				})
		}


		// 取得可预订的最大日期
		let maxDay = await DayModel.max({
			day: ['>=', day],
			DAY_CATE_ID: cateId
		}, 'day');
		if (maxDay == 0) maxDay = '';

		return {
			maxDay,
			startTime,
			endTime,
			list: arr
		};
	}


	// 获取某天预订情况
	async getUsedByDay(cateId, day) {
		let where = {
			ENROLL_JOIN_CATE_ID: String(cateId),
			ENROLL_JOIN_DAY: day,
			ENROLL_JOIN_STATUS: EnrollJoinModel.STATUS.SUCC,
		};
		return EnrollJoinModel.getAll(where);
	}


	/** 取得我的登记分页列表 */
	async getMyEnrollJoinList(userId, {
		search, // 搜索条件
		sortType, // 搜索菜单
		sortVal, // 搜索菜单
		orderBy, // 排序 
		page,
		size,
		isTotal = true,
		oldTotal
	}) {

		await this.fixUserEnrollJoinPayRecord(userId);

		orderBy = orderBy || {
			'ENROLL_JOIN_ADD_TIME': 'desc'
		};
		let fields = 'ENROLL_JOIN_ENROLL_TITLE,ENROLL_JOIN_IS_CHECKIN,ENROLL_JOIN_CATE_NAME,ENROLL_JOIN_ENROL_TITLE,ENROLL_JOIN_END_FULL,ENROLL_JOIN_OBJ,ENROLL_JOIN_DAY,ENROLL_JOIN_START,ENROLL_JOIN_END,ENROLL_JOIN_END_POINT,ENROLL_JOIN_LAST_TIME,ENROLL_JOIN_ENROLL_ID,ENROLL_JOIN_STATUS,ENROLL_JOIN_ADD_TIME,enroll.ENROLL_EDIT_SET,enroll.ENROLL_CANCEL_SET';

		let where = {
			ENROLL_JOIN_USER_ID: userId
		};

		if (util.isDefined(search) && search) {
			where['ENROLL_JOIN_OBJ.name'] = {
				$regex: '.*' + search,
				$options: 'i'
			};
		} else if (sortType) {
			// 搜索菜单
			switch (sortType) {
				case 'timedesc': { //按时间倒序
					orderBy = {
						'ENROLL_JOIN_START_FULL': 'desc'
					};
					break;
				}
				case 'timeasc': { //按时间正序
					orderBy = {
						'ENROLL_JOIN_START_FULL': 'asc'
					};
					break;
				}
				case 'status': {

					break;
				}
				case 'today': {
					where.ENROLL_JOIN_DAY = timeUtil.time('Y-M-D');
					where.ENROLL_JOIN_STATUS = EnrollJoinModel.STATUS.SUCC;
					break;
				}
				case 'run': {
					where.ENROLL_JOIN_END_FULL = ['>', timeUtil.time('Y-M-D h:m')];
					where.ENROLL_JOIN_STATUS = EnrollJoinModel.STATUS.SUCC;
					where.ENROLL_JOIN_IS_CHECKIN = 0;
					break;
				}
				case 'check': {
					where.ENROLL_JOIN_END_FULL = ['>', timeUtil.time('Y-M-D h:m')];
					where.ENROLL_JOIN_STATUS = EnrollJoinModel.STATUS.SUCC;
					where.ENROLL_JOIN_IS_CHECKIN = 1;
					break;
				}
				case 'out': {
					where.ENROLL_JOIN_END_FULL = ['<=', timeUtil.time('Y-M-D h:m')];
					where.ENROLL_JOIN_STATUS = EnrollJoinModel.STATUS.SUCC;
					break;
				}
				case 'cancel': {
					where.ENROLL_JOIN_STATUS = EnrollJoinModel.STATUS.CANCEL;
					break;
				}
				case 'syscancel': {
					where.ENROLL_JOIN_STATUS = EnrollJoinModel.STATUS.ADMIN_CANCEL;
					break;
				}
			}
		}

		let joinParams = {
			from: EnrollModel.CL,
			localField: 'ENROLL_JOIN_ENROLL_ID',
			foreignField: '_id',
			as: 'enroll',
		};

		let result = await EnrollJoinModel.getListJoin(joinParams, where, fields, orderBy, page, size, isTotal, oldTotal);

		return result;
	}

	/** 取得我的登记详情 */
	async getMyEnrollJoinDetail(userId, enrollJoinId) {

		await this.fixUserEnrollJoinPayRecord(userId);

		let fields = '*';

		let where = {
			_id: enrollJoinId
		};
		let enrollJoin = await EnrollJoinModel.getOne(where, fields);

		return enrollJoin;
	}

	//################## 登记 
	// 把时间格式'hh:mm'转为数组['00:00','11:00']
	getTimeArr(start, end) {
		let startArr = start.split(':');
		start = Number(startArr[0].trim()) * 2;
		if (startArr[1] == '30') start++;

		let endArr = end.split(':');
		end = Number(endArr[0].trim()) * 2;
		if (endArr[1] == '59') end++;


		let ret = [];
		for (let k = start; k <= end; k++) {
			if (k % 2 == 0)
				ret.push(Math.floor(k / 2) + ':00');
			else
				ret.push(Math.floor(k / 2) + ':30');
		}
		return ret;
	}

	// 修正某用户所有未支付的成功订单状态，无须支付的不用处理
	async fixUserEnrollJoinPayRecord(userId) {
		let where = {
			ENROLL_JOIN_USER_ID: userId,
			ENROLL_JOIN_PAY_STATUS: 0,
			ENROLL_JOIN_STATUS: EnrollJoinModel.STATUS.SUCC,
		}
		let list = await EnrollJoinModel.getAll(where);

		for (let k = 0; k < list.length; k++) {
			await this.fixEnrollJoinPay(list[k].ENROLL_JOIN_PAY_TRADE_NO, list[k].ENROLL_JOIN_ENROLL_ID);
		}
	}

	// 修正某订单状态 （仅需支付订单）
	async fixEnrollJoinPay(tradeNo) {

		if (!tradeNo) {
			// 无支付号空单 删除
			await EnrollJoinModel.del({ ENROLL_JOIN_PAY_TRADE_NO: tradeNo });

			// 重新统计
			this.statEnrollJoin();

			return false;
		}

		let payService = new PayService();
		if (!await payService.fixPayResult(tradeNo)) {
			// 关闭未支付单
			payService.closePay(tradeNo);

			// 未支付 
			await EnrollJoinModel.del({ ENROLL_JOIN_PAY_TRADE_NO: tradeNo });

			// 重新统计
			this.statEnrollJoin();

			return false;
		}

		// 已支付
		let pay = await PayModel.getOne({ PAY_TRADE_NO: tradeNo });
		if (!pay) this.AppError('支付流水异常，请核查');

		// 更新支付信息
		let data = {
			ENROLL_JOIN_PAY_STATUS: 1,
			ENROLL_JOIN_PAY_TRADE_NO: tradeNo,
			ENROLL_JOIN_PAY_FEE: pay.PAY_TOTAL_FEE,
			ENROLL_JOIN_PAY_TIME: pay.PAY_END_TIME,
		}
		await EnrollJoinModel.edit({ ENROLL_JOIN_PAY_TRADE_NO: tradeNo }, data);


		// 重新统计
		this.statEnrollJoin();
		return true;
	}

	// 支付预订 
	async prepay(userId, {
		enrollId,
		price,
		start,
		end,
		endPoint,
		day,
		forms
	}) {

		this.AppError('[场地预订P]该功能暂不开放，如有需要请加作者微信：cclinux0730');

	}


	// 修改登记 
	async enrollJoinEdit(userId, enrollId, enrollJoinId, forms) {
		let whereJoin = {
			_id: enrollJoinId,
			ENROLL_JOIN_USER_ID: userId,
			ENROLL_JOIN_ENROLL_ID: enrollId,
			ENROLL_JOIN_STATUS: EnrollJoinModel.STATUS.SUCC,
		}
		let enrollJoin = await EnrollJoinModel.getOne(whereJoin);
		if (!enrollJoin)
			this.AppError('该预订记录不存在或者已经被系统取消');


		// 登记是否结束
		let whereEnroll = {
			_id: enrollId,
			ENROLL_STATUS: EnrollModel.STATUS.COMM
		}
		let enroll = await EnrollModel.getOne(whereEnroll);
		if (!enroll)
			this.AppError('该场地不存在');


		if (enrollJoin.ENROLL_JOIN_IS_CHECKIN == 1)
			this.AppError('该预订已核销，不能修改');

		if (enroll.ENROLL_EDIT_SET == 0)
			this.AppError('该预订不允许修改资料');


		if (enroll.ENROLL_EDIT_SET == 2 && enrollJoin.ENROLL_JOIN_START_FULL <= timeUtil.time('Y-M-D h:m'))
			this.AppError('该预订已经开始，不能修改资料');


		if (enroll.ENROLL_EDIT_SET == 3 && enrollJoin.ENROLL_JOIN_END_FULL <= timeUtil.time('Y-M-D h:m'))
			this.AppError('该预订已经结束，不能修改资料');


		let data = {
			ENROLL_JOIN_FORMS: forms,
			ENROLL_JOIN_OBJ: dataUtil.dbForms2Obj(forms),
			ENROLL_JOIN_LAST_TIME: this._timestamp,
		}
		await EnrollJoinModel.edit(whereJoin, data);

	}

	async statEnrollJoin() {

	}

	/**  登记前获取关键信息 */
	async detailForEnrollJoin(userId, enrollId, enrollJoinId = '') {
		await this.fixUserEnrollJoinPayRecord(userId);

		let fields = 'ENROLL_JOIN_FORMS, ENROLL_TITLE, ENROLL_CATE_NAME';

		let where = {
			_id: enrollId,
			ENROLL_STATUS: EnrollModel.STATUS.COMM
		}
		let enroll = await EnrollModel.getOne(where, fields);
		if (!enroll)
			this.AppError('该预订不存在');



		let joinMy = null;
		if (enrollJoinId) {
			// 编辑
			let whereMy = {
				ENROLL_JOIN_USER_ID: userId,
				_id: enrollJoinId
			}
			joinMy = await EnrollJoinModel.getOne(whereMy);
			enroll.join = {
				start: joinMy.ENROLL_JOIN_START,
				end: joinMy.ENROLL_JOIN_END,
				endPoint: joinMy.ENROLL_JOIN_END_POINT,
				day: joinMy.ENROLL_JOIN_DAY,
			}
		}
		else {
			// 取出本人最近一次的填写表单 

			let whereMy = {
				ENROLL_JOIN_USER_ID: userId,
			}
			let orderByMy = {
				ENROLL_JOIN_ADD_TIME: 'desc'
			}
			joinMy = await EnrollJoinModel.getOne(whereMy, 'ENROLL_JOIN_FORMS', orderByMy);
		}

		let myForms = joinMy ? joinMy.ENROLL_JOIN_FORMS : [];
		enroll.myForms = myForms;

		return enroll;
	}

	/** 取消我的登记   */
	async cancelMyEnrollJoin(userId, enrollJoinId) {
		let where = {
			ENROLL_JOIN_USER_ID: userId,
			_id: enrollJoinId,
			ENROLL_JOIN_STATUS: EnrollJoinModel.STATUS.SUCC,
		};
		let enrollJoin = await EnrollJoinModel.getOne(where);

		if (!enrollJoin) {
			this.AppError('未找到可取消的记录');
		}

		if (enrollJoin.ENROLL_JOIN_IS_CHECKIN == 1)
			this.AppError('该预订已核销，不能取消');


		let enroll = await EnrollModel.getOne(enrollJoin.ENROLL_JOIN_ENROLL_ID);
		if (!enroll)
			this.AppError('该场地不存在');

		if (enroll.ENROLL_CANCEL_SET == 0)
			this.AppError('该预订不能取消');


		if (enroll.ENROLL_CANCEL_SET == 2 && enrollJoin.ENROLL_JOIN_START_FULL <= timeUtil.time('Y-M-D h:m'))
			this.AppError('该预订已经开始，不能取消');


		if (enroll.ENROLL_CANCEL_SET == 3 && enrollJoin.ENROLL_JOIN_END_FULL <= timeUtil.time('Y-M-D h:m'))
			this.AppError('该预订已经结束，不能取消');

		if (enroll.ENROLL_CANCEL_SET > 20) {

			let step = enroll.ENROLL_CANCEL_SET - 20;
			let day = timeUtil.time2Timestamp(enrollJoin.ENROLL_JOIN_END_FULL + ':00') - step * 86400 * 1000;
			day = timeUtil.timestamp2Time(day, 'Y-M-D');
			let now = timeUtil.time('Y-M-D');
			if (now > day) this.AppError('仅开始前' + step + '天可取消');
		}

		if (enrollJoin.ENROLL_JOIN_PAY_STATUS == 99) {
			// 无须支付
			// 更新记录 
			let data = {
				ENROLL_JOIN_STATUS: EnrollJoinModel.STATUS.CANCEL,
				ENROLL_JOIN_CANCEL_TIME: this._timestamp,
				ENROLL_JOIN_IS_CHECKIN: 0
			}
			await EnrollJoinModel.edit(enrollJoinId, data);
		}
		else {
			let tradeNo = enrollJoin.ENROLL_JOIN_PAY_TRADE_NO;
			if (!await this.fixEnrollJoinPay(tradeNo, enrollJoin.ENROLL_JOIN_ENROLL_ID)) {
				this.AppError('该报名记录未支付，已取消并删除！');
			}
			let payService = new PayService();
			await payService.refundPay(tradeNo, '用户取消报名');

			// 更新记录 
			let data = {
				ENROLL_JOIN_STATUS: EnrollJoinModel.STATUS.CANCEL,
				ENROLL_JOIN_CANCEL_TIME: this._timestamp,
				ENROLL_JOIN_PAY_STATUS: 8,
				ENROLL_JOIN_IS_CHECKIN: 0
			}
			await EnrollJoinModel.edit(enrollJoinId, data);
		}

		this.statEnrollJoin();


	}



}

module.exports = EnrollService;