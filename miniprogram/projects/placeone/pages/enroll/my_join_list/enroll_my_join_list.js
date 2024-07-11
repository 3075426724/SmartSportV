const pageHelper = require('../../../../../helper/page_helper.js');
const ProjectBiz = require('../../../biz/project_biz.js');
const helper = require('../../../../../helper/helper.js'); 
const cloudHelper = require('../../../../../helper/cloud_helper.js'); 
const PassportBiz = require('../../../../../comm/biz/passport_biz.js');
const projectSetting = require('../../../public/project_setting.js');

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		isLogin: true,
		sortMenusDefaultIndex: -1,
		cate: projectSetting.ENROLL_CATE
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: async function (options) {
		ProjectBiz.initPage(this);
		//	if (!await PassportBiz.loginMustBackWin(this)) return;

		if (options && helper.isDefined(options.status)) {
			this.setData({
				isLoad: true,
				_params: {
					sortType: options.status,
					sortVal: '',
				}
			});
		}

		this._getSearchMenu();
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

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {

	},

	url: async function (e) {
		pageHelper.url(e, this);
	},

	bindCommListCmpt: function (e) {
		pageHelper.commListListener(this, e);
	},

	/** 搜索菜单设置 */
	_getSearchMenu: function () {
		let sortItem1 = [
			{ label: '排序', type: '', value: '' },
			{ label: '按时间倒序', type: 'timedesc', value: '' },
			{ label: '按时间正序', type: 'timeasc', value: '' }];

		let sortItems = [sortItem1];
		let sortMenus = [
			{ label: '全部', type: 'status', value: '' },
			{ label: '今日', type: 'today', value: '' },
			{ label: '可使用', type: 'run', value: '' },
			{ label: '已核销', type: 'check', value: '' },
			{ label: '已过期', type: 'out', value: '' },
			{ label: '用户取消', type: 'cancel', value: '' },
			{ label: '系统取消', type: 'syscancel', value: '' },
		]

		this.setData({
			search: '',
			sortItems,
			sortMenus,
			isLoad: true
		});

	},
	bindCancelTap: async function (e) {

		if (!await PassportBiz.loginMustCancelWin(this)) return;

		let enrollJoinId = pageHelper.dataset(e, 'id'); 

		let cb = async () => {
			try {
				let params = {
					enrollJoinId
				}
				let opts = {
					title: '取消中'
				}

				await cloudHelper.callCloudSumbit('enroll/my_join_cancel', params, opts).then(res => {
					let callback = () => {
						pageHelper.modifyListNode(enrollJoinId, this.data.dataList.list, 'ENROLL_JOIN_STATUS', 9);
						this.setData({
							dataList: this.data.dataList
						});
					}

					pageHelper.showModal('取消成功 (若有在线缴费，所缴纳费用将在1-5分钟内原路退还)', '温馨提示', callback);
				});
			} catch (err) {
				console.log(err);
			}
		}

		pageHelper.showConfirm('确认取消? 取消不可恢复', cb);
	}
})