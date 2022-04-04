 /**
  * Notes: 通用页面操作类库
  * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux@qq.com
  * Date: 2020-11-14 07:48:00 
  */

 const helper = require('./helper.js');
 const setting = require('../setting/setting.js');
 const cacheHelper = require('./cache_helper.js');
 const picHelper = require('./pic_helper.js');
 const CACHE_SKIN = 'SKIN_PID';

 function getSkin() {
 	return {
		PID: 'A00', //音乐厅
	
		NAV_COLOR: '#ffffff',
		NAV_BG: '#163959',
	
		MEET_NAME: '演出', 
	 
		MENU_ITEM: ['首页', '演出日历', '我的'], // 第1,4,5菜单
	
		NEWS_CATE: '1=资讯动态,2=演出信息,3=艺术教育,4=经典剧目,5=商务合作,6=关于我们',
		MEET_TYPE: '1=公益演出预约|leftbig3,2=商演预约|leftbig2',
	
		DEFAULT_FORMS: [{
				type: 'line',
				title: '姓名',
				desc: '请填写您的姓名',
				must: true,
				len: 50,
				onlySet: {
					mode: 'all',
					cnt: -1
				},
				selectOptions: ['', ''],
				mobileTruth: true,
				checkBoxLimit: 2,
			},
			{
				type: 'line',
				title: '手机',
				desc: '请填写您的手机号码',
				must: true,
				len: 50,
				onlySet: {
					mode: 'all',
					cnt: -1
				},
				selectOptions: ['', ''],
				mobileTruth: true,
				checkBoxLimit: 2,
			}
		]
	}
 }

 function getCurrentPageURL() {
 	const pages = getCurrentPages();
 	const currentPage = pages[pages.length - 1];
 	const url = `/${currentPage.route}`;
 	return url;
 }

 function setSkin(skin) {
 	cacheHelper.set(CACHE_SKIN, skin, 86400 * 365);
 }

 function getPID() {
 	if (setting.PID) return setting.PID; // 已配置的情况
 	let route = getCurrentPageURL();

 	if (route.includes('/admin/')) { //后台直接读缓存
 		let skin = getSkin();
 		if (skin) return skin.PID;
 	} else if (route.startsWith('/projects/A')) { //前台根据路径判定
 		let PID = route.replace('/projects/', '');
 		PID = PID.split('/')[0];
 		return PID;
 	} else
 		return '';
 }

 function fmtURLByPID(url, PID = '') {
 	if (!PID) PID = getPID();
 	if (url.startsWith('/pages/')) {
 		url = url.replace('/pages/', '/projects/' + PID + '/');
 	} else {
 		url = '/projects/' + PID + '/' + url;
 	}
 	return url;
 }

 /** 定时器销毁 */
 function clearTimer(that, timerName = 'timer') {
 	if (helper.isDefined(that.data[timerName])) {
 		clearInterval(null);
 	}
 }

 /**
  *  获取父页面
  * @param {*} deep  1=当前 2=父页 3=父父页
  */
 function getPrevPage(deep = 2) {
 	let pages = getCurrentPages();
 	let prevPage = pages[pages.length - deep]; //上一个页面 
 	return prevPage;
 }

 /**
  * 修改当前/父页面的某个列表节点
  * @param {*} id 主键
  * @param {*} valName 被修改的字段名
  * @param {*} val  被修改的值 
  * @param {*} list   数据集
  * @param {*} idName 主键名
  */
 function modifyListNode(id, list, valName, val, idName = '_id') {

 	if (!list || !Array.isArray(list)) return false;
 	let pos = list.findIndex(item => item[idName] === id);
 	if (pos > -1) {
 		list[pos][valName] = val;
 		return true;
 	}
 	return false;
 }

 /**
  * 修改当前/父页面的某个列表节点(单个值)
  * @param {*} id 主键
  * @param {*} valName 被修改的字段名
  * @param {*} val  被修改的值
  * @param {*} deep  1=当前 2=父页 3=父父页
  * @param {*} listName   数据集名
  * @param {*} idName 主键名
  */
 function modifyPrevPageListNode(id, valName, val, deep = 2, listName = 'dataList', idName = '_id') {
 	let prevPage = getPrevPage(deep);
 	if (!prevPage) return;

 	let dataList = prevPage.data[listName];
 	if (!dataList) return;

 	let list = dataList['list'];
 	if (modifyListNode(id, list, valName, val, idName)) {
 		prevPage.setData({
 			[listName + '.list']: list
 		});
 	}
 }

 /**
  * 修改当前/父页面的某个列表节点(一组值)
  * @param {*} id 主键
  * @param {*} valName 被修改的字段名
  * @param {*} val  被修改的值
  * @param {*} deep  1=当前 2=父页 3=父父页
  * @param {*} listName   数据集名
  * @param {*} idName 主键名
  */
 function modifyPrevPageListNodeObject(id, vals, deep = 2, listName = 'dataList', idName = '_id') {
 	let prevPage = getPrevPage(deep);
 	if (!prevPage) return;

 	let dataList = prevPage.data[listName];
 	if (!dataList) return;

 	let list = dataList['list'];

 	for (let k in vals) {
 		modifyListNode(id, list, k, vals[k], idName)
 	}

 	prevPage.setData({
 		[listName + '.list']: list
 	});
 }

 /**
  * 从记录数组里删除某个节点
  * @param {*} id 
  * @param {*} list 
  * @param {*} idName 
  */
 function delListNode(id, list, idName = '_id') {
 	if (!list || !Array.isArray(list)) return false;
 	let pos = list.findIndex(item => item[idName] === id);
 	if (pos > -1) {
 		list.splice(pos, 1);
 		return true;
 	}
 	return false;
 }


 /**
  * 删除当前/父页面的某个列表节点
  * @param {*} id 主键
  * @param {*} deep 1=当前 2=父页 3=父父页
  * @param {*} listName  数据集名
  * @param {*} idName  主键名
  */
 function delPrevPageListNode(id, deep = 2, listName = 'dataList', idName = '_id') {
 	let prevPage = getPrevPage(deep);
 	let dataList = prevPage.data[listName];
 	if (!dataList) return;

 	let list = dataList['list'];
 	let total = dataList['total'] - 1;
 	if (delListNode(id, list, idName)) {
 		prevPage.setData({
 			[listName + '.list']: list,
 			[listName + '.total']: total
 		});
 	}

 }

 /**
  * 刷新当前/父页面的某个列表节点
  * @param {*} deep  1=当前 2=父页 3=父父页
  * @param {*} listName  数据集名
  * @param {*} listFunc  翻页函数名
  */
 async function refreshPrevListNode(deep = 2, listName = 'dataList', listFunc = '_getList') {
 	let prevPage = getPrevPage(deep);
 	let dataList = prevPage.data[listName];
 	if (!dataList) return;
 	await prevPage[listFunc]();
 }

 /**
  * 回到顶部测算
  */
 function scrollTop(e, that) {
 	if (e.scrollTop > 100) {
 		that.setData({
 			topShow: true
 		});
 	} else {
 		that.setData({
 			topShow: false
 		});
 	}
 }

 /**
  * 选择图片
  * @param {*} that 
  * @param {*} max  最大上传上限
  * @param {*} imgListName  图片数组名
  */
 function chooseImage(that, max = 4, imgListName = 'imgList') {
 	wx.chooseImage({
 		count: max, //默认9
 		sizeType: ['compressed'], //可以指定是原图还是压缩图，默认二者都有
 		sourceType: ['album', 'camera'], //从相册选择
 		success: async (res) => {
 			that.setData({
 				[imgListName]: that.data[imgListName].concat(res.tempFilePaths)
 			});
 		}
 	});
 }

 /**
  * 删除图片
  * @param {*} that 
  * @param {*} idx  被删除图片索引
  * @param {*} imgListName  图片数组名
  */
 function delImage(that, idx, imgListName = 'imgList') {
 	let callback = function () {
 		that.data[imgListName].splice(idx, 1);
 		that.setData({
 			[imgListName]: that.data[imgListName]
 		})
 	}
 	showConfirm('确定要删除该图片吗？', callback);
 }

 /**
  * 图片预览
  * @param {*} that 
  * @param {*} url 
  * @param {*} imgListName  图片数组名
  */
 function previewImage(that, url, imgListName = 'imgList') {
 	// 图片预览
 	wx.previewImage({
 		urls: that.data[imgListName],
 		current: url
 	});
 }

 /**
  * 取得data-数据 去掉驼峰式命名，改成纯小写式命名
  * @param {*} e 
  * @param {*} name 
  * @param {*} child  是否获取穿透子元素的data-
  */
 function dataset(e, name, child = false) {
 	if (!child)
 		return e.currentTarget.dataset[name];
 	else
 		return e.target.dataset[name];
 }

 // 表单的双向数据绑定 
 function model(that, e) {
 	let item = e.currentTarget.dataset.item;
 	that.setData({
 		[item]: e.detail.value
 	})
 }

 // 表单的开关按钮数据绑定 mode=int/bool
 function switchModel(that, e, mode = 'int') {
 	let item = e.currentTarget.dataset.item;
 	let sel = (e.detail.value) ? 1 : 0;

 	if (mode == 'bool') {
 		sel = (e.detail.value) ? true : false;
 	}

 	that.setData({
 		[item]: sel
 	})
 }

 // 无提示成功，同时做后续处理, 最多可显示两行
 function showNoneToast(title = '操作完成', duration = 1500, callback) {
 	return wx.showToast({
 		title: title,
 		icon: 'none',
 		duration: duration,
 		mask: true,
 		success: function () {
 			callback && (setTimeout(() => {
 				callback();
 			}, duration));
 		}
 	});
 }

 // 无提示成功，返回 
 function showNoneToastReturn(title = '操作完成', duration = 2000) {
 	let callback = function () {
 		wx.navigateBack({
 			delta: 0,
 		})
 	}
 	return showNoneToast(title, duration, callback);
 }

 // 错误提示成功，同时做后续处理, 最多显示7个汉字长度
 function showErrToast(title = '操作失败', duration = 1500, callback) {
 	return wx.showToast({
 		title: title,
 		icon: 'error',
 		duration: duration,
 		mask: true,
 		success: function () {
 			callback && (setTimeout(() => {
 				callback();
 			}, duration));
 		}
 	});
 }

 // 加载中，同时做后续处理, 最多显示7个汉字长度
 function showLoadingToast(title = '加载中', duration = 1500, callback) {
 	return wx.showToast({
 		title: title,
 		icon: 'loading',
 		duration: duration,
 		mask: true,
 		success: function () {
 			callback && (setTimeout(() => {
 				callback();
 			}, duration));
 		}
 	});
 }

 // 提示成功，同时做后续处理, 最多显示7个汉字长度
 function showSuccToast(title = '操作成功', duration = 1500, callback) {
 	return wx.showToast({
 		title: title,
 		icon: 'success',
 		duration: duration,
 		mask: true,
 		success: function () {
 			callback && (setTimeout(() => {
 				callback();
 			}, duration));
 		}
 	});
 }

 // 提示成功，同时返回
 function showSuccToastReturn(title = '操作成功', duration = 1500) {
 	let callback = function () {
 		wx.navigateBack({
 			delta: 0,
 		});
 	}
 	return showSuccToast(title, duration, callback);
 }

 // 清理提示焦点
 function formClearFocus(that) {
 	let data = that.data;
 	let focus = {};
 	for (let key in data) {
 		if (key.startsWith('form') && !key.endsWith('Focus'))
 			focus[key + 'Focus'] = null;
 	}
 	that.setData({
 		...focus
 	});
 }

 // 焦点提示
 function formHint(that, formName, hint) {
 	that.setData({
 		[formName + 'Focus']: hint
 	});
 	return showModal(hint);
 }

 // 编辑或者添加设置标题
 function formSetBarTitleByAddEdit(id, title) {
 	title = id ? title + '编辑' : title + '添加',
 		wx.setNavigationBarTitle({
 			title
 		});
 }

 // 二次确认操作 
 function showConfirm(title = '确定要删除吗？', yes, no) {
 	return wx.showModal({
 		title: '',
 		content: title,
 		cancelText: '取消',
 		confirmText: '确定',
 		success: res => {
 			if (res.confirm) {
 				yes && yes();
 			} else if (res.cancel) {
 				no && no();
 			}
 		}
 	})
 }

 function showModal(content, title = '温馨提示', callback = null, confirmText = null) {
 	return wx.showModal({
 		title,
 		content: content,
 		confirmText: confirmText || '确定',
 		showCancel: false,
 		success(res) {
 			callback && callback();
 		}
 	});
 }

 /**
  * 页面赋值
  * @param {*} that 
  * @param {*} data 
  */
 function setPageData(that, data) {
 	// 删除页面保留数据
 	if (helper.isDefined(data['__webviewId__']))
 		delete data['__webviewId__'];

 	that.setData(data);
 }
 /**
  * 配合搜索列表响应监听
  * @param {*} that 
  */
 function commListListener(that, e) {
 	if (helper.isDefined(e.detail.search))
 		that.setData({
 			search: '',
 			sortType: '',
 		});
 	else {
 		that.setData({
 			dataList: e.detail.dataList,
 		});
 		if (e.detail.sortType)
 			that.setData({
 				sortType: e.detail.sortType,
 			});
 	}

 }

 function bindShowModalTap(e) {
 	this.setData({
 		modalName: e.currentTarget.dataset.modal
 	})
 }

 function bindHideModalTap(e) {
 	this.setData({
 		modalName: null
 	})
 }


 /**
  * 控制回页首按钮
  * @param {*} e 
  */
 function showTopBtn(e, that) {
 	if (e.scrollTop > 100) {
 		that.setData({
 			topBtnShow: true
 		});
 	} else {
 		that.setData({
 			topBtnShow: false
 		});
 	}
 }

 /**
  * 回到顶部
  */
 function top() {
 	wx.pageScrollTo({
 		scrollTop: 0
 	})
 }

 // 跳到锚点
 function anchor(id, that) {
 	let query = wx.createSelectorQuery().in(that);
 	query.selectViewport().scrollOffset()
 	//#comm 跳转到指定id位置
 	query.select('#' + id).boundingClientRect();

 	query.exec(function (res) {
 		if (!res || res.length != 2 || !res[0] || !res[1]) return;
 		//第一个为视图，第二个为当前id

 		let miss = res[0].scrollTop + res[1].top - 10;
 		wx.pageScrollTo({
 			scrollTop: miss,
 			duration: 300
 		});
 	});
 }

 // 页面跳转/图片预览 
 function url(e, that) {
 	let url = e.currentTarget.dataset.url;
 	let type = e.currentTarget.dataset.type;
 	if (!type) type = 'url';

 	switch (type) {
 		case 'picker': //picker 选择trigger
 		{
 			let item = e.currentTarget.dataset.item;
 			that.setData({
 				[item]: e.detail
 			})
 			break;
 		}
 		case 'map':
 		case 'location': {
 			wx.getLocation({
 				type: 'gcj02', //返回可以用于wx.openLocation的经纬度
 				success(res) {
 					if (url) res = url;
 					const latitude = res.latitude;
 					const longitude = res.longitude;
 					const name = res.name;
 					const address = res.address;
 					wx.openLocation({
 						latitude,
 						longitude,
 						name,
 						address,
 						scale: 14
 					});
 				}
 			})
 			break;
 		}
 		case 'top': {
 			top();
 			break;
 		}
 		case 'mini': {
 			wx.navigateToMiniProgram({
 				appId: e.currentTarget.dataset.app,
 				path: url,
 				envVersion: 'release'
 			});
 			break;
 		}
 		case 'out': {
 			wx.navigateTo({
 				url: fmtURLByPID('/pages/public/web_article?url=' + encodeURIComponent(url)),
 			})
 			break;
 		}
 		case 'redirect': {
 			if (!url) return;
 			wx.redirectTo({
 				url
 			});
 			break;
 		}
 		case 'reLaunch':
 		case 'relaunch': {
 			if (!url) return;
 			wx.reLaunch({
 				url
 			})
 			break;
 		}
 		case 'copy': {
 			wx.setClipboardData({
 				data: url,
 				success(res) {
 					wx.getClipboardData({
 						success(res) {
 							showNoneToast('已复制到剪贴板');
 						}
 					})
 				}
 			});
 			break;
 		}
 		case 'hint': {
 			if (!url) return;
 			showModal(url);
 			break;
 		}
 		case 'switch': {
 			if (!url) return;
 			wx.switchTab({
 				url
 			});
 			break;
 		}
 		case 'back': {
 			wx.navigateBack({
 				delta: 0,
 			});
 			break;
 		}
 		case 'toURL': {
 			toURL(url);
 			break;
 		}
 		case 'phone': {
 			wx.makePhoneCall({
 				phoneNumber: url
 			});
 			break;
 		}
 		case 'anchor': {
 			anchor(url, that);
 			break;
 		}
 		case 'saveimg':
 		case 'saveimage': {
 			let callback = function () {
 				wx.saveImageToPhotosAlbum({ //成功之后保存到本地 
 					filePath: url, //生成的图片的本地路径
 					success: function (res) {
 						wx.showToast({
 							title: e.currentTarget.dataset.hint || '保存成功',
 							icon: 'none',
 							duration: 2000
 						})
 					},
 					fail: function (err) {
 						console.log(err);
 					}
 				})
 			}

 			picHelper.getWritePhotosAlbum(callback);
 			break;
 		}
 		case 'bool': //正反 
 		{
 			that.setData({
 				[url]: !that.data[url]
 			})
 			break;
 		}
 		case 'img':
 		case 'image': {
 			if (url.indexOf('qlogo') > -1) { //微信大图
 				url = url.replace('/132', '/0');
 			}
 			let urls = [url];

 			if (helper.isDefined(e.currentTarget.dataset.imgs))
 				urls = e.currentTarget.dataset.imgs;

 			wx.previewImage({
 				current: url, // 当前显示图片的http链接
 				urls
 			})
 			break;
 		}
 		default:
 			if (!url) return;
 			wx.navigateTo({
 				url
 			})

 	}

 }

 function getOptions(that, options, idName = 'id') {
 	let id = options[idName];
 	if (!id) return false;

 	that.setData({
 		[idName]: id
 	});
 	return true;

 }

 // 页面提示
 function hint(msg, type = 'redirect') {
 	if (type == 'reLaunch')
 		wx.reLaunch({
 			url: fmtURLByPID('/pages/public/hint?type=9&msg=' + encodeURIComponent(msg)),
 		});
 	else
 		wx.redirectTo({
 			url: fmtURLByPID('/pages/public/hint?type=9&msg=' + encodeURIComponent(msg)),
 		});
 }


 // 跳转操作，找到页面中的目标，出栈后面的 delta=1为上一页面
 function toURL(url) {
 	let pages = getCurrentPages();
 	for (let k in pages) {
 		if (pages[k].route.includes(url)) {
 			wx.navigateBack({
 				delta: pages.length - k - 1
 			});
 			return;
 		}
 	}

 	wx.redirectTo({
 		url,
 	});

 }

 /** ListTouch触摸开始 */
 function listTouchStart(e, that) {
 	that.setData({
 		touchX: e.touches[0].pageX
 	})
 }

 /** ListTouch计算方向 */
 function listTouchMove(e, that, precision = 50) {
 	if (that.data.touchX - e.touches[0].pageX > precision) {
 		that.setData({
 			touchDirection: 'left'
 		});
 	} else if (that.data.touchX - e.touches[0].pageX < -precision) {
 		that.setData({
 			touchDirection: 'right'
 		});
 	}

 }

 /** ListTouch计算滚动 */
 function listTouchEnd(e, that) {
 	if (that.data.touchDirection == 'left') {
 		that.setData({
 			touchCur: e.currentTarget.dataset.idx
 		})
 	} else {
 		that.setData({
 			touchCur: null
 		})
 	}

 	that.setData({
 		touchDirection: null
 	});
 }



 /**
  * 多条件复合查询条件
  * @param {*} e 
  * @param {*} key 查询键值
  * @param {*} val  查询值
  * @param {*} def  键值的数据类型(int,str,float)
  */
 function queryMulti(that, e, key, val, def) {
 	key = helper.isDefined(key) ? key : dataset(e, 'key');
 	val = helper.isDefined(val) ? val : dataset(e, 'val');
 	def = helper.isDefined(def) ? def : dataset(e, 'def');

 	// 类型转换
 	if (def == 'int') {
 		val = parseInt(val);
 	} else if (def == 'float') {
 		val = parseFloat(val);
 	} else if (def == 'str') {
 		val = val.toString();
 	}

 	let _params = that.data._params;
 	_params.query[key] = val;
 	that.setData({
 		_params
 	})
 }

 /**
  * 页面缓存
  * @param {*} key  
  * @param {*} that 
  * @param {*} listKey  数据项KEY
  */
 function cacheListExist(key, that, listKey = 'list') {
 	key = key.toUpperCase();
 	if (setting.CACHE_IS_LIST)
 		return cacheHelper.get(key + '_LIST') && that.data && that.data[listKey];
 	else
 		return false;
 }

 function cacheListRemove(key) {
 	key = key.toUpperCase();
 	if (setting.CACHE_IS_LIST)
 		cacheHelper.remove(key + '_LIST');
 }

 function cacheListSet(key, time = setting.CACHE_LIST_TIME) {
 	key = key.toUpperCase();
 	if (setting.CACHE_IS_LIST)
 		cacheHelper.set(key + '_LIST', 'TRUE', time);
 }


 module.exports = {
 	setSkin,
 	getSkin,
 	getPID,
 	fmtURLByPID,

 	//### form
 	formClearFocus,
 	formHint,
 	formSetBarTitleByAddEdit,

 	//### 
 	dataset, //节点数据data-

 	//### 节点操作
 	getPrevPage,
 	modifyListNode,
 	modifyPrevPageListNode, //单个
 	modifyPrevPageListNodeObject, //一组
 	delListNode,
 	delPrevPageListNode,
 	refreshPrevListNode,

 	scrollTop, //### 回顶部

 	// ### 图片
 	chooseImage,
 	previewImage,
 	delImage,

 	//## 提示窗口
 	showSuccToastReturn,
 	showSuccToast,
 	showErrToast,
 	showNoneToast,
 	showNoneToastReturn,
 	showLoadingToast,
 	showConfirm,
 	showModal,
 	setPageData,

 	hint, //单独提示页

 	commListListener, //组件监听

 	bindShowModalTap,
 	bindHideModalTap,
 	showTopBtn,

 	getOptions, //获取id或者其他参数

 	model, // 双向数据绑定
 	switchModel, //开关控件数据绑定

 	top, // 回顶部事件
 	url, // 跳转事件
 	anchor, //锚点跳转事件  

 	toURL, //跳转操作

 	//### 列表横向滑动
 	listTouchStart,
 	listTouchMove,
 	listTouchEnd,

 	//### 多条件复合查询
 	queryMulti,

 	clearTimer, //定时器销毁

 	//LIST数据缓存
 	cacheListExist,
 	cacheListRemove,
 	cacheListSet,

 }