const cloudHelper = require('../../../../../helper/cloud_helper.js');
const pageHelper = require('../../../../../helper/page_helper.js');
const dataHelper = require('../../../../../helper/data_helper.js');
const ProjectBiz = require('../../../biz/project_biz.js');
const projectSetting = require('../../../public/project_setting.js');
const PassportBiz = require('../../../../../comm/biz/passport_biz.js');

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		isLoad: false,
		isLogin: true,

		isEdit: true,

		forms: [],
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: async function (options) {
		ProjectBiz.initPage(this);

		if (!pageHelper.getOptions(this, options)) return;
		if (!pageHelper.getOptions(this, options, 'enrollJoinId')) return;

		if (!await PassportBiz.loginMustBackWin(this)) return;

		this._loadDetail();

	},

	_loadDetail: async function () {
		let id = this.data.id;
		if (!id) return;


		let params = {
			enrollId: id,
			enrollJoinId: this.data.enrollJoinId
		};
		let opt = {
			title: 'bar'
		};
		let enroll = await cloudHelper.callCloudData('enroll/detail_for_join', params, opt);
		if (!enroll) {
			this.setData({
				isLoad: null
			})
			return;
		}

		if (!Array.isArray(enroll.ENROLL_JOIN_FORMS) || enroll.ENROLL_JOIN_FORMS.length == 0)
			enroll.ENROLL_JOIN_FORMS = projectSetting.ENROLL_JOIN_FIELDS;

		this.setData({
			isLoad: true,
			enroll,
		});

	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () { },

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
		this.setData({
			isLoad: false
		}, async () => {
			await this._loadDetail();
		});
		wx.stopPullDownRefresh();
	},



	url: function (e) {
		pageHelper.url(e, this);
	},

	onPageScroll: function (e) {
		// 回页首按钮
		pageHelper.showTopBtn(e, this);

	},

	bindCheckTap: async function (e) {
		this.selectComponent("#form-show").checkForms();
	},

	bindSubmitCmpt: async function (e) {
		let forms = e.detail;

		let enrollJoinId = this.data.enrollJoinId;

		try {
			let opts = {
				title: '提交中'
			}
			let params = {
				enrollId: this.data.id,
				enrollJoinId,
				forms
			}
			await cloudHelper.callCloudSumbit('enroll/join_edit', params, opts).then(res => { 
				let callback = () => {
					// 更新列表页面数据
					let node = {
						'ENROLL_JOIN_OBJ': {
							'name': dataHelper.getDataByKey(forms, 'mark', 'name').val,
						}
					}
					pageHelper.modifyPrevPageListNodeObject(enrollJoinId, node);

					wx.navigateBack();

				}
				pageHelper.showSuccToast('修改成功', 2000, callback);


			})
		} catch (err) {
			console.log(err);
		};
	}

})