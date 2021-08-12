// +----------------------------------------------------------------------
// | CCMiniCloud [ Cloud Framework ]
// +----------------------------------------------------------------------
// | Copyright (c) 2021 www.code942.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( http://www.apache.org/licenses/LICENSE-2.0 )
// +----------------------------------------------------------------------
// | Author: 明章科技
// +----------------------------------------------------------------------

/**
 * Notes: 云函数业务主逻辑
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY www.code942.com
 * Date: 2020-09-05 04:00:00
 * Version : CCMiniCloud Framework Ver 2.0.1 ALL RIGHTS RESERVED BY 明章科技
 */
const ccminiUtil = require('../utils/ccmini_util.js');
const ccminiConfig = require('../../comm/ccmini_config.js');
const ccminiRouter = require('../../comm/ccmini_router.js');
const ccminiCloudBase = require('../cloud/ccmini_cloud_base.js');
const ccminiAppCode = require('./ccmini_app_code.js');
const ccminiTimeUtil = require('../utils/ccmini_time_util.js');
const ccminiDBUtil = require('../database/ccmini_db_util.js');
const SetupModel = require('../../model/setup_model.js');
const NewsModel = require('../../model/news_model.js');
const AdminModel = require('../../model/admin_model.js');

async function ccminiApp(event, context) {

	const cloud = ccminiCloudBase.getCloud();
	const wxContext = cloud.getWXContext();
	let r = '';

	//console.log(wxContext);
	let mark = ccminiConfig.PROJECT_MARK + '_cloud';

	try {

		if (!ccminiUtil.isDefined(event.router)) {
			console.error('[' + mark + ']CC-MINI Router Not Defined');
			return handlerSvrErr();
		}

		r = event.router.toLowerCase();

		if (!ccminiUtil.isDefined(ccminiRouter[r])) {
			console.error('[' + mark + ']CCMINI Router [' + r + '] Is Not Exist');
			return handlerSvrErr();
		}

		let ccminiRouterArr = ccminiRouter[r].split('@');

		let controllerName = ccminiRouterArr[0];
		let actionName = ccminiRouterArr[1];
		let token = event.token || '';
		let params = event.params;

		console.log('');
		console.log('');
		let time = ccminiTimeUtil.time('Y-M-D h:m:s');
		console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
		console.log('[' + mark + '][' + time + '][CCMINI Request][Route=' + r + '], Controller=[' + controllerName + '], Action=[' + actionName + '], Token=[' + token + '], ###IN DATA=\r\n', JSON.stringify(params, null, 4));


		let openId = wxContext.OPENID;

		if (!openId) {
			console.error('CCMINI OPENID is unfined');
			if (ccminiConfig.CCMINI_TEST_MODE)
				openId = ccminiConfig.CCMINI_TEST_TOKEN_ID;
			else
				return handlerSvrErr();
		}

		//####
		await initSetup();

		controllerName = controllerName.toLowerCase().replace('controller', '').trim();
		const ControllerClass = require('controller/' + controllerName + '_controller.js');
		const controller = new ControllerClass(openId, params, r, token);

		let result = await controller[actionName]();

		if (!result)
			result = handlerSucc(r);
		else
			result = handlerData(result, r);

		console.log('------');
		time = ccminiTimeUtil.time('Y-M-D h:m:s');
		console.log('[' + mark + '][' + time + '][CCMINI Response][Route=' + r + '], ###OUT DATA=', result);
		console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
		console.log('');
		console.log('');

		return result;


	} catch (ex) {
		const log = cloud.logger();

		if (ex.name == 'CCMiniAppError') {
			log.warn({
				router: r,
				errCode: ex.code,
				errMsg: ex.message
			});
			// 自定义error处理
			return handlerAppErr(ex.message, ex.code);
		} else {
			console.log(ex);
			log.error({
				router: r,
				errCode: ex.code,
				errMsg: ex.message,
				errStack: ex.stack
			});

			// 系统error
			return handlerSvrErr();
		}
	}
}

function handlerBasic(code, msg = '', data = {}) {

	switch (code) {
		case ccminiAppCode.SUCC:
			msg = (msg) ? msg + ':ok' : 'ok';
			break;
		case ccminiAppCode.SVR:
			msg = '服务器繁忙，请稍后再试';
			break;
		case ccminiAppCode.LOGIC:
			break;
		case ccminiAppCode.DATA:
			break;
		case ccminiAppCode.USER_EXCEPTION:
			msg = msg || '用户状态异常';
			break;
		case ccminiAppCode.NOT_USER:
			msg = msg || '用户不存在';
			break;
		case ccminiAppCode.MUST_LOGIN:
			msg = msg || '需要登录';
			break;
		case ccminiAppCode.USER_CHECK:
			msg = msg || '用户审核中';
			break;
		case ccminiAppCode.ADMIN_ERROR:
			msg = msg || '管理员错误';
			break;
		default:
			msg = '服务器开小差了，请稍后再试';
			break;
	}

	return {
		code: code,
		msg: msg,
		data: data
	}

}

function handlerSvrErr(msg = '') {
	return handlerBasic(ccminiAppCode.SVR, msg);
}

function handlerSucc(msg = '') {
	return handlerBasic(ccminiAppCode.SUCC, msg);
}

function handlerAppErr(msg = '', code = ccminiAppCode.LOGIC) {
	return handlerBasic(code, msg);
}


function handlerData(data, msg = '') {
	return handlerBasic(ccminiAppCode.SUCC, msg, data);
}

async function initSetup() {
	if (await ccminiDBUtil.isExistCollection('setup')) return;

	let arr = ccminiConfig.CCMINI_COLLECTION_NAME.split('|');
	for (let k in arr) {
		if (!await ccminiDBUtil.isExistCollection(arr[k])) {
			await ccminiDBUtil.createCollection(arr[k]);
		}
	}

	if (await ccminiDBUtil.isExistCollection('setup')) {
		await ccminiDBUtil.clear('setup');
		
		let data = {};
		data.SETUP_TITLE = ccminiConfig.CCMINI_SETUP_TITLE;
		data.SETUP_ABOUT = ccminiConfig.CCMINI_SETUP_ABOUT;
		data.SETUP_REG_CHECK = 0;
		await SetupModel.insert(data);
	}

	if (await ccminiDBUtil.isExistCollection('admin')) {
		await ccminiDBUtil.clear('admin');

		let data = {};
		data.ADMIN_NAME = '系统管理员';
		data.ADMIN_PHONE = '13900000000';

		await AdminModel.insert(data);
	}

	if (await ccminiDBUtil.isExistCollection('news') && ccminiConfig.CCMINI_COLLECTION_NAME.includes('news')) {
		await ccminiDBUtil.clear('news');

		let data = {};
		data.NEWS_TITLE = ccminiConfig.CCMINI_NEWS_TITLE;
		data.NEWS_DESC = ccminiConfig.CCMINI_NEWS_DESC;
		data.NEWS_CATE = ccminiConfig.CCMINI_NEWS_CATE;
		data.NEWS_CONTENT = ccminiConfig.CCMINI_NEWS_CONTENT;

		await NewsModel.insert(data);
 
		data = {};
		data.NEWS_TITLE = '1955-2011年度校史大事记';
		data.NEWS_DESC = '1955-2011年度校史大事记';
		data.NEWS_CATE = '校史大事记'
		data.NEWS_CONTENT = '1955-2011年度校史大事记'; 
		await NewsModel.insert(data);

		data = {};
		data.NEWS_TITLE = '权威发布｜100周年校庆活动指南';
		data.NEWS_DESC = '亲爱的校友们，我们诚挚地献上关于100周年校庆的“活动指南”，并奉上这一封汇聚众人期许的邀请函';
		data.NEWS_CATE = '校庆指南'
		data.NEWS_CONTENT = '从丁未年1907至丁酉年2017，转眼间，印记已逾百年。百年来的风雨沧桑，数不尽的辉煌荣光，只因一路有你们的拼搏相伴。而今100周年华诞将至，亲爱的校友们，我们诚挚地献上关于100周年校庆的“活动指南”，并奉上这一封汇聚众人期许的邀请函。'; 
		await NewsModel.insert(data); 

		data = {};
		data.NEWS_TITLE = '百年校庆系列纪念活动';
		data.NEWS_DESC = '全体参会人员来到C楼前合影留念，大家互相留了最新的通讯信息，彼此依依不舍地告别，纷纷表示愿意联系身边更多的同学返校，积极组织并参与学校举办的百年纪念活动，在金秋十月百年校庆日再相聚！';
		data.NEWS_CATE = '活动安排'
		data.NEWS_CONTENT = '　会议开始前，校园里出现了相互指认的热闹场面，很多多年未见面的老同学在此刻重逢，激动的心情溢于言表。分别时大家正值青春少年，日月穿梭，斗转星 移，现在见面已两鬓白发。大家互相询问着近况，关注着学校百年校庆的相关进展情况。校友们纷纷对着采访镜头，表达自己对母校百年华诞的祝福\n全体参会人员来到C楼前合影留念，大家互相留了最新的通讯信息，彼此依依不舍地告别，纷纷表示愿意联系身边更多的同学返校，积极组织并参与学校举办的百年纪念活动，在金秋十月百年校庆日再相聚！'; 
		await NewsModel.insert(data);

		data = {};
		data.NEWS_TITLE = '“我爱母校”校友年度捐赠计划';
		data.NEWS_DESC = '鼓励校友最广泛地参与到母校的发 展和建设中。年度捐赠讲究平民化和持续性，在金额上虽然无法与大额捐赠相比，但对于体现校友们 对母校的认同感、参与感、凝聚力和向心力在某种程度上却更有着不可比拟的巨大作用';
		data.NEWS_CATE = '校友捐赠'
		data.NEWS_CONTENT = '鼓励校友最广泛地参与到母校的发 展和建设中。年度捐赠讲究平民化和持续性，在金额上虽然无法与大额捐赠相比，但对于体现校友们 对母校的认同感、参与感、凝聚力和向心力在某种程度上却更有着不可比拟的巨大作用'; 
		await NewsModel.insert(data);

		data = {};
		data.NEWS_TITLE = '报返校信息填报';
		data.NEWS_DESC = '报返校信息时尽量将所乘坐交通工具准点到达的时间和车站详细填报';
		data.NEWS_CATE = '返校信息'
		data.NEWS_CONTENT = '报返校信息时尽量将所乘坐交通工具准点到达的时间和车站详细填报'; 
		await NewsModel.insert(data);
	}
}


module.exports = {
	ccminiApp,
	handlerBasic,
	handlerData,
	handlerSucc,
	handlerSvrErr,
	handlerAppErr
}