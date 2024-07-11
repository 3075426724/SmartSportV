const AdminBiz = require('../../../../../../comm/biz/admin_biz.js');
const pageHelper = require('../../../../../../helper/page_helper.js');
const helper = require('../../../../../../helper/helper.js');
const timeHelper = require('../../../../../../helper/time_helper.js');
const cloudHelper = require('../../../../../../helper/cloud_helper.js');
const EnrollBiz = require('../../../../biz/enroll_biz.js');

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		isLoad: false,
		isAllFold: true,

		date: '',

		search: ''

	},


	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		if (!AdminBiz.isAdmin(this)) return; 
	 
		this._getSearchMenu();
	},

	bindDateChange: function (e) {
		this.setData({ search: e.detail.value });
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {

	},

	url: async function (e) {
		pageHelper.url(e, this);
	},

	bindUnFoldTap: function (e) {
		let idx = pageHelper.dataset(e, 'idx');
		let dataList = this.data.dataList;
		dataList.list[idx].fold = false;
		this.setData({
			dataList
		});
	},

	bindFoldTap: function (e) {
		let idx = pageHelper.dataset(e, 'idx');
		let dataList = this.data.dataList;
		dataList.list[idx].fold = true;
		this.setData({
			dataList
		});
	},

	bindFoldAllTap: function (e) {
		let dataList = this.data.dataList;
		for (let k = 0; k < dataList.list.length; k++) {
			dataList.list[k].fold = true;
		}
		this.setData({
			isAllFold: true,
			dataList
		});
	},

	bindUnFoldAllTap: function (e) {
		let dataList = this.data.dataList;
		for (let k = 0; k < dataList.list.length; k++) {
			dataList.list[k].fold = false;
		}
		this.setData({
			isAllFold: false,
			dataList
		});
	},

	bindCopyTap: function (e) {
		let idx = pageHelper.dataset(e, 'idx');
		let forms = this.data.dataList.list[idx].ENROLL_JOIN_FORMS;

		let ret = '';

		ret += `场地：${this.data.dataList.list[idx].ENROLL_JOIN_CATE_NAME} - ${this.data.dataList.list[idx].ENROLL_JOIN_ENROLL_TITLE}\r`;

		for (let k = 0; k < forms.length; k++) {
			ret += forms[k].title + '：' + forms[k].val + '\r';
		}
		wx.setClipboardData({
			data: ret,
			success(res) {
				wx.getClipboardData({
					success(res) {
						pageHelper.showSuccToast('已复制到剪贴板');
					}
				})
			}
		});

	},


	bindCheckinTap: async function (e) {
		let flag = Number(pageHelper.dataset(e, 'flag'));

		let callback = async () => {
			let idx = Number(pageHelper.dataset(e, 'idx'));
			let dataList = this.data.dataList;
			let enrollJoinId = dataList.list[idx]._id;
			let params = {
				enrollJoinId,
				val: flag,
			}
			let opts = {
				title: '处理中'
			}
			try {
				await cloudHelper.callCloudSumbit('admin/enroll_join_checkin', params, opts).then(res => {
					let cb = () => {
						dataList.list[idx].ENROLL_JOIN_IS_CHECKIN = flag;
						this.setData({
							dataList
						});
					}

					pageHelper.showSuccToast('操作成功', 1000, cb);


				});
			} catch (err) {
				console.error(err);
			}
		}
		if (flag == 1)
			pageHelper.showConfirm('确认「核销」？', callback);
		else if (flag == 0)
			pageHelper.showConfirm('确认「取消核销」？', callback);

	},

	bindCancelTap: async function (e) {

		let callback = async () => {
			let idx = Number(pageHelper.dataset(e, 'idx'));
			let dataList = this.data.dataList;
			let enrollJoinId = dataList.list[idx]._id;
			let params = {
				enrollJoinId
			}
			let opts = {
				title: '取消中'
			}
			try {
				await cloudHelper.callCloudSumbit('admin/enroll_join_cancel', params, opts).then(res => {

					let cb = () => {
						this.setData({
							['dataList.list[' + idx + '].ENROLL_JOIN_STATUS']: 99,
							['dataList.list[' + idx + '].ENROLL_JOIN_CANCEL_TIME']: timeHelper.time('Y-M-D h:m:s'),

						});

					}

					pageHelper.showModal('取消成功 (若有在线缴费，所缴纳费用将在1-5分钟内原路退还)', '温馨提示', cb);
				});
			} catch (err) {
				console.error(err);
			}
		}

		pageHelper.showConfirm('确认取消该记录？ 取消后不可恢复', callback);


	},



	bindCommListCmpt: function (e) {

		if (helper.isDefined(e.detail.search))
			this.setData({
				search: '',
				sortType: '',
			});
		else {
			let dataList = e.detail.dataList;
			if (dataList) {
				for (let k = 0; k < dataList.list.length; k++) {
					dataList.list[k].fold = this.data.isAllFold;
				}
			}

			this.setData({
				dataList,
			});
			if (e.detail.sortType)
				this.setData({
					sortType: e.detail.sortType,
				});
		}

	},

	// 修改与展示状态菜单
	_getSearchMenu: async function () {
		let cateIdOptions = EnrollBiz.getCateListOptions();

		let sortItems = [[
			{ label: '场地分类', type: '', value: '' },
			...cateIdOptions
		]];

		let sortMenus = [];
		sortMenus = [
			{ label: '全部', type: '', value: '' },
			{ label: `最新`, type: 'sort', value: 'new' },
			{ label: `成功`, type: 'status', value: 1 },
			{ label: `系统取消`, type: 'status', value: 99 },
			{ label: `用户取消`, type: 'status', value: 9 },
			{ label: `已核销`, type: 'check', value: 1 },
			{ label: `未核销`, type: 'check', value: 0 },

		];
		this.setData({
			sortItems,
			sortMenus,
			isLoad: true
		})


	},


})