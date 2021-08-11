/**
 * Notes:   
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY www.code942.com
 * Date: 2021-08-14 07:48:00 
 */

const ccminiPageHelper = require('../../../helper/ccmini_page_helper.js');
const ccminiCloudHelper = require('../../../helper/ccmini_cloud_helper.js');
const ccminiContentCheckHelper = require('../../../helper/ccmini_content_check_helper.js');
const CCMINI_SETTING = require('../../../helper/ccmini_setting.js');

Component({
	/**
	 * 组件的属性列表
	 */
	properties: {
		imgList: {
			type: Array,
			value: []

		},
		imgMax: {
			type: Number,
			value: 4,
		},
		title: {
			type: String,
			value: '图片上传',
		},
		isCheck:{  
			type: Boolean,
			value: true,
		},
		imgUploadSize:{  
			type: Number,
			value: CCMINI_SETTING.IMG_UPLOAD_SIZE,
		}
	},

	/**
	 * 组件的初始数据
	 */
	data: {
		//imgList:[]
	},


	/**
	 * 生命周期方法
	 */
	lifetimes: {
		attached: function () {

		},

		ready: function () {
			 
		},
		detached: function () {
			// 在组件实例被从页面节点树移除时执行
		},
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		/**
		 * 选择上传图片 
		 */
		bindChooseImgTap: function (e) {
			wx.chooseImage({
				count: this.data.imgMax - this.data.imgList.length, //默认9
				sizeType: ['compressed'], //可以指定是原图还是压缩图，默认二者都有
				sourceType: ['album', 'camera'], //从相册选择
				success: async (res) => {
					wx.showLoading({
						title: '图片校验中',
						mask: true
					});

					for (let k = 0; k < res.tempFiles.length; k++) {
						let size = res.tempFiles[k].size;
						let path = res.tempFiles[k].path;
						console.log('size=' + size + ',path=' + path)
						if (!ccminiContentCheckHelper.imgTypeCheck(path)) {
							wx.hideLoading();
							return ccminiPageHelper.showNoneToast('只能上传png、jpg、jpep格式', 3000);
						}

						let imageMaxSize = 1024 * 1000 * this.data.imgUploadSize;
						if (!ccminiContentCheckHelper.imgSizeCheck(size, imageMaxSize)) {
							wx.hideLoading();
							return ccminiPageHelper.showNoneToast('单张图片大小不能超过 ' + this.data.imgUploadSize + 'M', 3000);
						} 

						this.setData({
							imgList: this.data.imgList.concat(path)
						});
						this.triggerEvent('myImgUploadEvent', this.data.imgList);

					}

					wx.hideLoading();
				}
			});
		},

		bindPreviewImgTap: function (e) {
			wx.previewImage({
				urls: this.data.imgList,
				current: e.currentTarget.dataset.url
			});
		},

		/**
		 * 	删除图片 
		 */
		catchDelImgTap: function (e) {
			let that = this;
			let callback = function () {
				that.data.imgList.splice(e.currentTarget.dataset.index, 1);
				that.setData({
					imgList: that.data.imgList
				});
				that.triggerEvent('myImgUploadEvent', that.data.imgList);
			}
			ccminiPageHelper.showConfirm('确定要删除该图片吗？', callback);
		},

	}
})