const AdminBiz = require('../../../../../../comm/biz/admin_biz.js');
const pageHelper = require('../../../../../../helper/page_helper.js');
const cacheHelper = require('../../../../../../helper/cache_helper.js');

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		name: '',
		pwd: '',
		remember: false
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		AdminBiz.clearAdminToken();

		// 记住密码 
		let pwd = cacheHelper.get('admin-pwd');
		if (pwd) {
			this.setData({
				name: pwd.name,
				pwd: pwd.pwd,
				remember: true
			});
		}

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
	onUnload: function () {

	},

	url: function (e) {
		pageHelper.url(e, this);
	},

	bindBackTap: function (e) {
		wx.reLaunch({
			url: pageHelper.fmtURLByPID('/pages/my/index/my_index'),
		});
	},

	bindLoginTap: async function (e) {
		// 记住密码
		if (this.data.remember) {
			cacheHelper.set('admin-pwd', { pwd: this.data.pwd, name: this.data.name }, 86400 * 30);
		}
		else {
			cacheHelper.clear('admin-pwd');
		}

		return AdminBiz.adminLogin(this, this.data.name, this.data.pwd);
	},

	bindRememberTap: function (e) {
		this.setData({
			remember: !this.data.remember
		})
	}

})