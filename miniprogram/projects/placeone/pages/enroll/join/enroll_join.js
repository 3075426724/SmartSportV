const cloudHelper = require('../../../../../helper/cloud_helper.js');
const pageHelper = require('../../../../../helper/page_helper.js');
const ProjectBiz = require('../../../biz/project_biz.js');
const PassportBiz = require('../../../../../comm/biz/passport_biz.js');
const projectSetting = require('../../../public/project_setting.js');

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		isLoad: false,

		isEdit: false,

		price: 0,
		start: '',
		end: '',
		endPoint: '',
		day: '',

		forms: [],
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: async function (options) {
		ProjectBiz.initPage(this);

		if (!pageHelper.getOptions(this, options)) return;

		if (!await PassportBiz.loginMustBackWin(this)) return;

		if (options && options.start) {
			this.setData({
				price: decodeURIComponent(options.price),
				start: decodeURIComponent(options.start),
				end: decodeURIComponent(options.end),
				endPoint: decodeURIComponent(options.endPoint),
				day: decodeURIComponent(options.day),
			});
		}

		this._loadDetail();

	},

	_loadDetail: async function () {
		let id = this.data.id;
		if (!id) return;


		let params = {
			enrollId: id
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
		let that = this;


		try {
			let opts = {
				title: '提交中'
			}
			let params = {
				enrollId: that.data.id,
				start: that.data.start,
				end: that.data.end,
				endPoint: that.data.endPoint,
				day: that.data.day,
				price: that.data.price,
				forms
			}

			await cloudHelper.callCloudSumbit('enroll/prepay', params, opts).then(res => {

				if (!res.data.payRet) {
                    wx.showModal({
                        title: '温馨提示',
                        showCancel: false,
                        content: '预订成功！',
                        async success(res) {
							wx.reLaunch({ 
								url: '../../my/index/my_index'
							});
                        }
                    });
                }
                else {
                    const payment = res.data.payRet.payment;
                    wx.requestPayment({
                        ...payment,
                        success(result) {
                            wx.showModal({
                                title: '温馨提示',
                                showCancel: false,
                                content: '预订成功！',
                                success(res) {
									wx.reLaunch({ 
										url: '../../my/index/my_index'
									});
                                }
                            });

                        },
                        fail(err) {
                            pageHelper.showModal('提交失败， 请重新提交~');
                            console.error('pay fail', err);
                        },
                        async complete() {
                           
                        }
                    })
                } 
			})
		} catch (err) {
			console.log(err);
		};




	}

})