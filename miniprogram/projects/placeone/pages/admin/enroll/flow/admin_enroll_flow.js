const AdminBiz = require('../../../../../../comm/biz/admin_biz.js');
const pageHelper = require('../../../../../../helper/page_helper.js');

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		isLoad: false,
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: async function (options) {
		if (!AdminBiz.isAdmin(this)) return;


		//设置搜索菜单
		this._getSearchMenu();

	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () { },

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: async function () { },

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () { },

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () { },

	url: async function (e) {
		pageHelper.url(e, this);
	},

	bindCommListCmpt: function (e) {
		pageHelper.commListListener(this, e);
	},



	_getSearchMenu: function () {

		let sortMenus = [
			{ label: '全部', type: '', value: '' },
			{ label: '待支付', type: 'status', value: 0 },
			{ label: '已支付', type: 'status', value: 1 },
			{ label: '已退款', type: 'status', value: 8 },
			{ label: '失败', type: 'status', value: 9 },
			{ label: '已关闭', type: 'status', value: 10 },
			{ label: '无需支付', type: 'status', value: 99 },
		]
		this.setData({
			search: '',
			sortItems: [],
			sortMenus,
			isLoad: true
		})
	}

})