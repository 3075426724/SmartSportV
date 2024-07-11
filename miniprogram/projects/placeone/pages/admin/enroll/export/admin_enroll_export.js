const AdminBiz = require('../../../../../../comm/biz/admin_biz.js');
const pageHelper = require('../../../../../../helper/page_helper.js');
const cloudHelper = require('../../../../../../helper/cloud_helper.js');
const fileHelper = require('../../../../../../helper/file_helper.js');
const EnrollBiz = require('../../../../biz/enroll_biz.js');

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		title: '',
		url: '',
		time: '',
		status: 1,

		formCateId: '',
		formStart: '',
		formEnd: '',
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: async function (options) {
		if (!AdminBiz.isAdmin(this)) return; 

		let cateIdOptions = EnrollBiz.getCateListOptions();
		let baseOptions = {
			label: '所有分类',
			type: 'cateId',
			val: '9999',
			value: '9999'
		}
		cateIdOptions.push(baseOptions);
		this.setData({ cateIdOptions });

		this._loadDetail(1);
	},

	_loadDetail: async function (isDel) {
		if (!AdminBiz.isAdmin(this)) return;

		let params = {
			isDel 
		}
		let options = {
			title: 'bar'
		}
		let data = await cloudHelper.callCloudData('admin/enroll_join_data_get', params, options);

		if (!data) return;

		this.setData({
			isLoad: true,
			url: data.url
		})

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
	onPullDownRefresh: async function () {
		await this._loadDetail(1);
		wx.stopPullDownRefresh();
	},

	bindOpenTap: function (e) {
		fileHelper.openDoc('订单', this.data.url);
	},

	url: async function (e) {
		pageHelper.url(e, this);
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {

	},

	bindExportTap: async function (e) {

		let cateId = this.data.formCateId;
		if (!cateId) return pageHelper.showModal('请选择场地分类');


		let start = this.data.formStart;
		if (!start) return pageHelper.showModal('请选择起始时间');

		let end = this.data.formEnd;
		if (!end) return pageHelper.showModal('请选择结束时间');

		try {
			let options = {
				title: '数据生成中'
			}

			let params = { 
				cateId,
				start,
				end,
				status: this.data.status
			}

			await cloudHelper.callCloudData('admin/enroll_join_data_export', params, options).then(res => {
				this._loadDetail(0);
				pageHelper.showModal('数据文件生成成功(' + res.total + '条记录), 请点击「直接打开」按钮或者复制文件地址下载');

			});
		} catch (err) {
			console.log(err);
			pageHelper.showNoneToast('导出失败，请重试');
		}

	},

	bindDelTap: async function (e) {
		try {
			let options = {
				title: '数据删除中'
			}
			let params = { 
			}
			await cloudHelper.callCloudData('admin/enroll_join_data_del', params, options).then(res => {
				this.setData({
					url: '',
				});
				pageHelper.showSuccToast('删除成功');
			});
		} catch (err) {
			console.log(err);
			pageHelper.showNoneToast('删除失败，请重试');
		}

	},

	url: function (e) {
		pageHelper.url(e, this);
	}


})