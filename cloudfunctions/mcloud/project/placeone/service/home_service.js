/**
 * Notes: 全局/首页模块业务逻辑
 * Date: 2021-03-15 04:00:00 
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 */

const BaseProjectService = require('./base_project_service.js');
const setupUtil = require('../../../framework/utils/setup/setup_util.js');
const constants = require('../public/constants.js');
const NewsModel = require('../model/news_model.js');

class HomeService extends BaseProjectService {

	async getSetup(key) {
		return await setupUtil.get(key);
	}

	/**首页列表 */
	async getHomeList() { 

		let where = {
			NEWS_STATUS: 1,
			NEWS_VOUCH: 1
		};

		let orderBy = {
			'NEWS_ORDER': 'asc',
			'NEWS_ADD_TIME': 'desc'
		};
		let fields = 'NEWS_PIC,NEWS_CATE_NAME,NEWS_TITLE,NEWS_DESC,NEWS_ADD_TIME';
		let list = await NewsModel.getAll(where, fields, orderBy);
		if (list.length > 0) return list;

		where = { NEWS_STATUS: 1 };
		return await NewsModel.getAll(where, fields, orderBy, 10);
	} 
 
}

module.exports = HomeService;