const AdminBiz = require('../../../../../../comm/biz/admin_biz.js');
const pageHelper = require('../../../../../../helper/page_helper.js');
const AdminEnrollBiz = require('../../../../biz/admin_enroll_biz.js');
const EnrollBiz = require('../../../../biz/enroll_biz.js');
const validate = require('../../../../../../helper/validate.js');
const cloudHelper = require('../../../../../../helper/cloud_helper.js');
const formSetHelper = require('../../../../../../cmpts/public/form/form_set_helper.js');
const projectSetting = require('../../../../public/project_setting.js'); 

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

		if (!pageHelper.getOptions(this, options)) return;


		this._loadDetail();
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () { },

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () { },

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () { },

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () { },

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: async function () {
		await this._loadDetail();
		this.selectComponent("#cmpt-form").reload();
		wx.stopPullDownRefresh();
	},

	model: function (e) {
		pageHelper.model(this, e);
	},

	_loadDetail: async function () {
		if (!AdminBiz.isAdmin(this)) return;

		let id = this.data.id;
		if (!id) return;

		if (!this.data.isLoad) this.setData(AdminEnrollBiz.initFormData(id)); // 初始化表单数据

		let params = {
			id
		};
		let opt = {
			title: 'bar'
		};
		let enroll = await cloudHelper.callCloudData('admin/enroll_detail', params, opt);
		if (!enroll) {
			this.setData({ isLoad: null });
			return;
		};

		if (!Array.isArray(enroll.ENROLL_JOIN_FORMS) || enroll.ENROLL_JOIN_FORMS.length == 0)
			enroll.ENROLL_JOIN_FORMS = projectSetting.ENROLL_JOIN_FIELDS;
 
		this.setData({
			isLoad: true,
 

			formTitle: enroll.ENROLL_TITLE, 
			formCateId: enroll.ENROLL_CATE_ID,
			formOrder: enroll.ENROLL_ORDER,
 
			formCancelSet: enroll.ENROLL_CANCEL_SET,
			formEditSet: enroll.ENROLL_EDIT_SET,

			formForms: enroll.ENROLL_FORMS,
			formJoinForms: formSetHelper.initFields(enroll.ENROLL_JOIN_FORMS)

		});
	},

	bindFormSubmit: async function () {
		if (!AdminBiz.isAdmin(this)) return;

		// 数据校验
		let data = this.data;
		data = validate.check(data, AdminEnrollBiz.CHECK_FORM, this);
		if (!data) return;


		let forms = this.selectComponent("#cmpt-form").getForms(true);
		if (!forms) return;
		data.forms = forms;

		data.cateName = EnrollBiz.getCateName(data.cateId); 

		try {
			let enrollId = this.data.id;
			data.id = enrollId;

			// 先修改，再上传 
			await cloudHelper.callCloudSumbit('admin/enroll_edit', data).then(res => {
				// 更新列表页面数据
				let node = {
					'ENROLL_TITLE': data.title, 
					'ENROLL_CATE_ID': data.cateId,
					'ENROLL_CATE_NAME': data.cateName,
					'ENROLL_ORDER': data.order,
					'ENROLL_EDIT_SET': data.editSet,
					'ENROLL_CANCEL_SET': data.cancelSet,
				}
				pageHelper.modifyPrevPageListNodeObject(enrollId, node);
			});

			await cloudHelper.transFormsTempPics(forms, 'enroll/', enrollId, 'admin/enroll_update_forms');

			let callback = () => {
				wx.navigateBack();
			}
			pageHelper.showSuccToast('修改成功', 2000, callback);

		} catch (err) {
			console.log(err);
		}

	},


	url: function (e) {
		pageHelper.url(e, this);
	},

	switchModel: function (e) {
		pageHelper.switchModel(this, e);
	},

	bindJoinFormsCmpt: function (e) {
		this.setData({
			formJoinForms: e.detail,
		});
	},

})