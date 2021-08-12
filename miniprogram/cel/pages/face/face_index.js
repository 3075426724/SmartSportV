import Poster from '../../ccmini-cmpts/lib/wxa-plugin-canvas/poster/poster.js'
const ccminiPageHelper = require('../../helper/ccmini_page_helper.js');
const ccminiHelper = require('../../helper/ccmini_helper.js');
const RegBiz = require('../../biz/reg_biz.js');
const PassportBiz = require('../../biz/passport_biz.js');

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		facePic: '/cel/images/face/face0.png ',
		userPic: '',
		proIdx: 'face0.png',
		current: 0, //当前图片
		proList: ['face0.png', 'face1.png', 'face2.png', 'face3.png', 'face4.png', 'face5.png', 'face6.png','face7.png']
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: async function (options) {
		await PassportBiz.initPage(this);
		//await this.catchCreatePosterTap();
	},


	bindPreviewTap: function () {
		wx.previewImage({
			current: [this.data.facePic], // 当前显示图片的http链接
			urls: [this.data.facePic] // 需要预览的图片http链接列表
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
	onShow: async function () {
		await this.catchCreatePosterTap();
	},

	bindPosterSuccessListener(e) {
		let facePic = e.detail;
		this.setData({
			facePic
		});
	},

	bindPosterFailListener(e) {
		console.log(e);
	},

	bindSelectedTap: async function (e) {
		let proIdx = e.currentTarget.dataset.idx;
		this.setData({
			proIdx
		});
		await this.catchCreatePosterTap();
	},

	/**
	 * 异步生成海报
	 */
	catchCreatePosterTap: async function () {

		let posterConfig = {};

		posterConfig = this.makeFace();

		this.setData({
			posterConfig
		}, async () => {
			await Poster.create(true);
		});

	},

	makeFace: function () {
		let posterConfig = {
			width: 500,
			height: 500,
			pixelRatio: 3,
			backgroundColor: '#eee',
			debug: false,
		}

		let images = [];
		images = [{
			x: 0,
			y: 0,
			url: '/cel/images/face/' + this.data.proIdx,
			width: 500,
			height: 500,
			zIndex: 9999
		}];

		if (this.data.userPic) {
			let mainImg = {
				x: 0,
				y: 0,
				url: this.data.userPic,
				width: 500,
				height: 500,
			}
			images.push(mainImg);
		}



		posterConfig.images = images;

		return posterConfig;
	},



	onPosterFail: function (e) {
		console.log(e)
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
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function (res) {

	},


	prevImg: function () {
		let current = this.data.current;
		current = current < (this.data.proList.length - 1) ? current + 1 : 0;
		this.setData({
			current,
		})
	},

	nextImg: function () {
		let current = this.data.current;
		current = current > 0 ? current - 1 : this.data.proList.length - 1;
		this.setData({
			current,
		})
	},

	bindSaveTap: function (e) {
		wx.saveImageToPhotosAlbum({ //成功之后保存到本地

			filePath: this.data.facePic, //生成的图片的本地路径
			success: function (res) {
				wx.showToast({
					title: '保存成功',
					icon: 'success',
					duration: 2000
				})
			},
			fail: function (res) {

			}
		})
	},

	url: function (e) {
		ccminiPageHelper.url(e, this);
	},

	getUserProfile: async function (e) {
		wx.getUserProfile({
			desc: '用于完善校庆头像',
			success: async (res) => {
				let userInfo = res.userInfo;
				if (!ccminiHelper.isDefined(userInfo) || !userInfo)
					wx.showToast({
						title: '授权失败，请重新授权',
						icon: 'none',
						duration: 4000
					});
				else {
 
					this.setData({
						userPic:userInfo.avatarUrl
					});
					await this.catchCreatePosterTap();
				};
			},
			fail: (err) => {
				wx.showToast({
					title: '授权失败，请重新授权',
					icon: 'none'
				});
			}
		})
	},
})