const AdminBiz = require('../../../../../../comm/biz/admin_biz.js');
const pageHelper = require('../../../../../../helper/page_helper.js');
const cloudHelper = require('../../../../../../helper/cloud_helper.js');

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		oprt: 'admin',

		isLoad: true,
		title: '',
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		if (!AdminBiz.isAdmin(this)) return; 
	},
	/*
		* 生命周期函数--监听页面初次渲染完成
	* /
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

	bindScanTap: function (e) {  
		wx.scanCode({
			async success(res) {
				if (!res ||
					!res.result ||
					!res.result.includes('enroll=') ||
					res.result.length != 22) {
					pageHelper.showModal('错误的预订码，请重新扫码');
					return;
				}

				let code = res.result.replace('enroll=', '');
				let params = { 
					code
				};
				let options = {
					title: '预订码核销中'
				}
				await cloudHelper.callCloudSumbit('admin/enroll_join_scan', params, options).then(res => {
					wx.showModal({
						title: '温馨提示',
						content: res.data,
						confirmText: '继续核验',
						cancelText: '查看详情',
						success(res) {
							if (res.confirm) {

							} else if (res.cancel) {
								wx.navigateTo({
									url: '../join_detail/admin_enroll_join_detail?id=' + code,
								})
							}
						}
					})

				}).catch(err => {
					console.log(err);
				});
			},
			fail(err) {
				if (err && err.errMsg == 'scanCode:fail')
					pageHelper.showModal('预订码核销错误，请重新扫码');
			}
		});
	}

})