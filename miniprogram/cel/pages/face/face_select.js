import WeCropper from '../../ccmini-cmpts/lib/we-cropper/we-cropper.js'
const ccminiPageHelper = require('../../helper/ccmini_page_helper.js');
const device = wx.getSystemInfoSync()
const width = device.windowWidth
const height = device.windowHeight - 50

Page({
	data: {
		cropperOpt: {
			id: 'cropper',
			targetId: 'targetCropper',
			pixelRatio: device.pixelRatio,
			width,
			height,
			scale: 2.5,
			zoom: 8,
			cut: {
				x: (width - 250) / 2,
				y: (height - 250) / 2,
				width: 250,
				height: 250
			},
			boundStyle: {
				color: '#fff',
				mask: 'rgba(0,0,0,0.8)',
				lineWidth: 1
			}
		}
	},

	onLoad: async function (options) {
		const {
			cropperOpt
		} = this.data;
		cropperOpt.src = '';
		this.cropper = new WeCropper(cropperOpt)
			.on('ready', (ctx) => {
				//console.log(`wecropper is ready for work!`)
			})
			.on('beforeImageLoad', (ctx) => {
				//console.log(`before picture loaded, i can do something`)
				//console.log(`current canvas context:`, ctx)
				wx.showToast({
					title: '上传中',
					icon: 'loading',
					duration: 20000
				});
			})
			.on('imageLoad', (ctx) => {
				//console.log(`picture loaded`)
				//console.log(`current canvas context:`, ctx)
				wx.hideToast();
			})
			.on('beforeDraw', (ctx, instance) => {
				//console.log(`before canvas draw,i can do something`)
				//console.log(`current canvas context:`, ctx)
			})

	},

	url: function (e) {
		ccminiPageHelper.url(e, this);
	},

	touchStart: function (e) {
		this.cropper.touchStart(e);
	},
	touchMove: function (e) {
		this.cropper.touchMove(e);
	},
	touchEnd: function (e) {
		this.cropper.touchEnd(e);
	},

	bindCropperImageTap: async function () {
		this.cropper.getCropperImage(async function (path, err) {
			if (err) {
				wx.showModal({
					title: '温馨提示',
					content: err.message
				});
			} else {
				let prevPage = ccminiPageHelper.getPrevPage();
				// 直接调用上一个页面的setData()方法，把数据存到上一个页面中去
				prevPage.setData({
					userPic: path,
				})

				wx.navigateBack({
					delta: 0,
				});
			}
		})

	},

	uploadTap: function () {
		let that = this;
		wx.chooseImage({
			count: 1, // 默认9
			sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
			sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
			success(res) {
				const src = res.tempFilePaths[0];
				//  获取裁剪图片资源后，给data添加src属性及其值 
				that.cropper.pushOrign(src);
			}
		})
	},

})