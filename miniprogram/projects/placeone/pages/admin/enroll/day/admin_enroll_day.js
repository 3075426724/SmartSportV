const AdminBiz = require('../../../../../../comm/biz/admin_biz.js');
const AdminEnrollBiz = require('../../../../biz/admin_enroll_biz.js');
const pageHelper = require('../../../../../../helper/page_helper.js');
const dataHelper = require('../../../../../../helper/data_helper.js');
const cloudHelper = require('../../../../../../helper/cloud_helper.js');
const timeHelper = require('../../../../../../helper/time_helper.js');

Page({

	/**
		* 页面的初始数据
		*/
	data: {
		isLoad: false,

		daysTimeOptions: AdminEnrollBiz.getDaysTimeOptions(),
		daysTimeEndOptions: AdminEnrollBiz.getDaysTimeEndOptions(),

		multiDoDay: [], //当前选择

		hasJoinDays: [], //未超时有预订

		days: [
			/*{
						day: '2021-12-11',
						dayDesc: '12月11日 (周五)', 
						times: [{ 
							mark: '',
							start: '10:15', //开始
							end: '23:59', // 结束
							price: 50, //价格 
						}]
					}, {
						day: '2022-01-11',
						dayDesc: '1月11日 (周日)', 
						times: [{ 
							mark: '',
							start: '00:00', //开始
							end: '23:59', // 结束
							price: 50, //价格 
						}]
					}*/
		],

		curIdx: -1, // 当前操作的日子索引
		curTimesIdx: -1, // 当前操作的时段索引

		curPriceModalShow: false,
		curTimePrice: 50, // 当前时段价格

		saveTempModalShow: false,
		formTempName: '',

		errIdx: -1, //当前有错误的日子索引
		errTimesIdx: -1, //当前有错误的时段索引

	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: async function (options) {
		if (!AdminBiz.isAdmin(this)) return;

		if (!pageHelper.getOptions(this, options)) return; 

		this._loadDetail();
	},

	async _loadDetail() {
		try {
			cloudHelper.callCloudSumbit('admin/enroll_all_days', { enrollId: this.data.id }, { title: 'bar' }).then(res => {

				let formDaysSet = res.data;

				let days = [];
				let hasJoinDays = [];

				for (let k in formDaysSet) {
					delete formDaysSet[k]._id;
					days.push(formDaysSet[k]);
					if (this._checkHasJoinCnt(formDaysSet[k].times))
						hasJoinDays.push(formDaysSet[k].day);

				}
				this.setData({
					isLoad: true,
					hasJoinDays,
					days
				});
				this._syncCalData();

			});
		}
		catch (err) {
			console.error(err);
		}
	},

	_setHasJoinDays: function () {
		let days = this.data.days;
		let now = timeHelper.time('Y-M-D');
		let hasJoinDays = [];

		for (let k in days) {
			if (days[k].day < now)
				continue;
			else {
				if (this._checkHasJoinCnt(days[k].times))
					hasJoinDays.push(days[k].day);
			}
		}
		this.setData({
			hasJoinDays
		});
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () { },

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () { },

	model: function (e) {
		pageHelper.model(this, e);
	},

	// 判断含有预订的日期
	_checkHasJoinCnt: function (times) {
		if (!times) return false;
		for (let k in times) {
			if (times[k].succ) return true;
		}
		return false;
	},

	_syncCalData: function (e) { // 同步日历选中 
		let days = this.data.days;
		let multiDoDay = dataHelper.getArrByKey(days, 'day');
		this.setData({
			multiDoDay,
		});
	},

	bindTimeAddTap: function (e) {
		let idx = pageHelper.dataset(e, 'idx');
		let days = this.data.days;

		if (days[idx].times.length >= 20) return pageHelper.showModal('最多可以添加20个时段');

		days[idx].times.push(AdminEnrollBiz.getNewTimeNode(days[idx].day));

		this.setData({
			days
		});
	},

	onPullDownRefresh: async function () {
		await this._loadDetail();
		wx.stopPullDownRefresh();
	},

	bindTimeDelTap: function (e) {
		let idx = pageHelper.dataset(e, 'idx');
		let timesIdx = pageHelper.dataset(e, 'timesidx');
		let days = this.data.days;
		let node = days[idx].times[timesIdx];

		this.setData({
			errIdx: -1,
			timesIdx: -1
		});

		if (node.succ) {
			pageHelper.showModal('该时段已有人预订，不能删除');
		} else {
			let callback = () => {
				days[idx].times.splice(timesIdx, 1);
				this.setData({
					days
				});
			};
			pageHelper.showConfirm('是否要删除该时间段？', callback);
		}
	},

	// 检测同一天内时间时段是否有重合
	_checkDayTimes: function (times, start, end, nowTimeIdx, hint = '') {
		for (let k = 0; k < times.length; k++) {

			if (nowTimeIdx == k) continue;

			let kstart = times[k].start;
			let kend = times[k].end;

			if (start <= kstart && end >= kend
				|| start >= kstart && end <= kend
				|| start <= kstart && end >= kstart
				|| start <= kend && end >= kend) {
				return pageHelper.showModal(hint + '存在时段重合，请调整设置');
			}
		}

		return true;

	},

	_checkDayTimesAll: function (days) {
		this.setData({
			errIdx: -1, //当前有错误的日子索引
			errTimesIdx: -1,
		});

		for (let j = 0; j < days.length; j++) {
			let day = days[j];
			for (let i = 0; i < day.times.length; i++) {

				/*if (day.times[i].start == day.times[i].end) {
					pageHelper.anchor('day-view-' + j, this);
					this.setData({
						errIdx: j, //当前有错误的日子索引
						errTimesIdx: i,
					});
					pageHelper.showModal(day.day + '存在开始时间和结束时间相同的设置，请调整~')
					return false;
				}*/

				if (!this._checkDayTimes(day.times, day.times[i].start, day.times[i].end, i, day.day)) {
					this.setData({
						errIdx: j, //当前有错误的日子索引
						errTimesIdx: i,
					});
					pageHelper.anchor('day-view-' + j, this);
					return false;
				}


			}
		}

		// 数字修正与时间排序
		for (let j = 0; j < days.length; j++) {
			for (let k = 0; k < days[j].times.length; k++) {
				days[j].times[k].start = Number(days[j].times[k].start);
				days[j].times[k].end = Number(days[j].times[k].end);
			}

			days[j].times.sort(dataHelper.objArrSortAsc('start'));
		}


		return true;

	},

	bindDaysTimeStartCmpt: function (e) {
		let start = Number(e.detail);
		let idx = pageHelper.dataset(e, 'idx');
		let timesIdx = pageHelper.dataset(e, 'timesidx');

		let days = this.data.days;

		let end = days[idx].times[timesIdx].end;
		if (start > end) return pageHelper.showModal('开始时间不能大于结束时间');


		days[idx].times[timesIdx].start = start;
		this.setData({
			days
		});
	},

	bindDaysTimeEndCmpt: function (e) {
		let end = Number(e.detail);
		let idx = pageHelper.dataset(e, 'idx');
		let timesIdx = pageHelper.dataset(e, 'timesidx');

		let days = this.data.days;

		let start = days[idx].times[timesIdx].start;
		if (start > end) return pageHelper.showModal('开始时间不能大于结束时间');


		days[idx].times[timesIdx].end = end;
		this.setData({
			days
		});
	},

	switchModel: function (e) {
		pageHelper.switchModel(this, e, 'bool');
	},

	bindSaveTempCmpt: async function (e) {


		let days = this.data.days;
		let times = days[this.data.curIdx].times;
		if (times.length <= 0) return pageHelper.showNoneToast('至少需要包含一个时段');
		if (times.length > 20) return pageHelper.showNoneToast('时段不能超过20个');

		// 校验时段是否重合
		if (!this._checkDayTimesAll([days[this.data.curIdx]])) {
			this.setData({
				saveTempModalShow: false
			});
			return;
		}

		// 经过校验修正后 赋给页面
		this.setData({ days: this.data.days });

		try {
			let name = this.data.formTempName;
			if (name.length <= 0) return pageHelper.showNoneToast('请填写模板名称');
			if (name.length > 20) return pageHelper.showNoneToast('模板名称不能超过20个字哦');


			let temps = [];
			for (let k in times) {
				let node = {};
				node.start = times[k].start;
				node.end = times[k].end;
				node.price = times[k].price;
				temps.push(node);
			}
			let opt = {
				title: '模板保存中'
			}
			let params = {
				name,
				times: temps 
			}
			await cloudHelper.callCloudSumbit('admin/enroll_temp_insert', params, opt).then(res => {
				pageHelper.showSuccToast('保存成功');
				this.setData({
					saveTempModalShow: false,
					formTempName: '',
				});
			})
		} catch (err) {
			console.log(err);
		};
	},

	bindTimePriceSetCmpt: function (e) {
		let days = this.data.days;
		let idx = this.data.curIdx;
		let timesIdx = this.data.curTimesIdx;

		let price = this.data.curTimePrice;

		price = Number(price);

		if (!price && price !== 0)
			return pageHelper.showModal('请填写价格');


		if (this.data.curTimesIdx == -1) {
			// 全天
			for (let k in days[idx].times) {
				if (!days[idx].times[k].succ)
					days[idx].times[k].price = price;
			}
		} else {

			// 某时间段
			let node = days[idx].times[timesIdx];
			node.price = price;
			days[idx].times[timesIdx] = node;
		}

		this.setData({
			days,
			curPriceModalShow: false
		});
	},

	bindShowTimePriceModalTap: function (e) {
		let curIdx = pageHelper.dataset(e, 'idx');
		let curTimesIdx = pageHelper.dataset(e, 'timesidx');

		let days = this.data.days;

		if (curTimesIdx == -1) {
			// 全天
			this.setData({
				curIdx,
				curTimesIdx: -1,
				curTimePrice: 50,
				curPriceModalShow: true
			});
		} else {
			// 时间段价格
			let node = days[curIdx].times[curTimesIdx];
			if (node.succ) {
				return pageHelper.showModal('该时段已有人预订，不能修改价格');
			}
			let curTimePrice = node.price;
			this.setData({
				curIdx,
				curTimesIdx,
				curTimePrice,
				curPriceModalShow: true
			});
		}
	},

	_selectTemp: function (e) {
		let curIdx = pageHelper.dataset(e, 'idx');

		if (this._checkHasJoinCnt(this.data.days[curIdx].times)) {
			return pageHelper.showModal('该日已有用户预订，不能选用模板');
		}

		this.setData({
			curIdx
		});
		wx.navigateTo({
			url: '../temp/admin_enroll_temp',
		});
	},

	url: function (e) {
		pageHelper.url(e, this);
	},

	_saveTempModal: function (e) {
		let curIdx = pageHelper.dataset(e, 'idx');
		let days = this.data.days;
		if (days[curIdx].times.length <= 0) return pageHelper.showModal('该日期下没有设置时段，无法保存为模板，请先添加时段');
		this.setData({
			saveTempModalShow: true,
			curIdx
		});
	},

	_copyDaySetToAll: function (e) { //  复制到所有
		let curIdx = pageHelper.dataset(e, 'idx');
		let days = this.data.days;
		let day = days[curIdx].day;
		let temps = days[curIdx].times;

		let callback = () => {
			for (let k in days) {
				if (this._checkHasJoinCnt(days[k].times)) continue; //自己和有记录不复制

				let times = [];
				for (let j in temps) {
					let node = AdminEnrollBiz.getNewTimeNode(days[k].day);
					node.start = temps[j].start;
					node.end = temps[j].end;
					node.price = temps[j].price;
					times.push(node);
				}
				days[k].times = times;
			}
			this.setData({
				days
			});
		}

		pageHelper.showConfirm('确认将「' + day + '」下的时段设置复制到其他日期下吗? (原有时段将被清除)', callback);
	},

	bindDaySetTap: async function (e) {
		let itemList = ['选用模板配置', '保存为模板', '删除该日期', '复制到所有日期'];
		wx.showActionSheet({
			itemList,
			success: async res => {
				this.setData({
					errIdx: -1,
					timesIdx: -1
				});

				let idx = res.tapIndex;
				if (idx == 0) { // 选用模板配置
					this._selectTemp(e);
				}
				if (idx == 1) { // 保存为模板 
					this._saveTempModal(e);
				}
				if (idx == 2) { //  删除
					let curIdx = pageHelper.dataset(e, 'idx');
					if (this._checkHasJoinCnt(this.data.days[curIdx].times)) {
						return pageHelper.showModal('该日已有用户预订，不能删除')
					}
					let callback = () => {
						let days = this.data.days;
						days.splice(curIdx, 1);
						this.setData({
							days
						});
						this._syncCalData();
					}
					pageHelper.showConfirm('确认删除该日期吗?', callback);
				}

				if (idx == 3) { //复制到所有
					this._copyDaySetToAll(e);
				}
			},
			fail: function (res) { }
		})
	},

	bindTimeSetTap: async function (e) {
		let itemList = ['复制到所有日期', '选用模板配置', '保存为模板'];
		wx.showActionSheet({
			itemList,
			success: async res => {
				this.setData({
					errIdx: -1,
					timesIdx: -1
				});

				let idx = res.tapIndex;
				if (idx == 0) { // 复制到所有
					this._copyDaySetToAll(e);
				}
				if (idx == 1) { // 选用模板配置
					this._selectTemp(e);
				}
				if (idx == 2) { // 保存为模板 
					this._saveTempModal(e);
				}

			},
			fail: function (res) { }
		})
	},

	bindDataCalendarClickCmpt: function (e) {
		// 数据日历点击
		let clickDays = e.detail.days;
		if (!clickDays) return;
		let days = this.data.days;

		let retDays = [];
		for (let k in clickDays) {
			let dayExist = false;
			for (let j in days) {
				if (days[j].day == clickDays[k]) {
					// 节点存在
					retDays.push(days[j]);
					dayExist = true;
					break;
				};
			}

			// 节点不存在
			if (!dayExist) {
				let dayDesc = timeHelper.fmtDateCHN(clickDays[k]) + ' (' + timeHelper.week(clickDays[k]) + ')';
				let times = AdminEnrollBiz.getNewDayNode(clickDays[k]);
				let node = {
					day: clickDays[k],
					dayDesc,
					times
				};
				retDays.push(node);
			}

		}

		this.setData({
			days: retDays
		});
	},

	onPageScroll: function (e) {
		if (e.scrollTop > 100) {
			this.setData({
				topShow: true
			});
		} else {
			this.setData({
				topShow: false
			});
		}
	},

	bindTopTap: function () {
		wx.pageScrollTo({
			scrollTop: 0
		})
	},

	bindSaveTap: function () {
		if (!this._checkDayTimesAll(this.data.days)) return;

		// 经过校验修正后 赋给页面
		this.setData({ days: this.data.days });

		let days = this.data.days;
		let getDays = [];
		for (let k in days) {
			if (days[k].times.length > 0) getDays.push(days[k]);
		}

		/*
		if (getDays.length <= 0) {
			return pageHelper.showModal('请设定排期时段');
		}*/

		let options = {
			title: '提交中'
		}
		let params = {
			enrollId: this.data.id,
			days: getDays
		}
		try {
			cloudHelper.callCloudSumbit('admin/enroll_edit_days', params, options).then(res => {
				let cb = () => {
					// 更新列表页面数据
					let node = {
						'leaveDay': getDays.length,
						'leaveDayDate': getDays.length > 0 ? getDays[getDays.length - 1].day : '',

					}
					pageHelper.modifyPrevPageListNodeObject(this.data.id, node);
					wx.navigateBack();
				};
				pageHelper.showSuccToast('提交成功', 1500, cb);
			});
		}
		catch (err) {
			console.error(err);
		}

	}


})