/**
 * Notes: 后台管理控制模块
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2021-03-15 19:20:00 
 */

const BaseAdminController = require('../../../../framework/platform/controller/base_admin_controller.js');
const BaseProjectAdminService = require('../../service/admin/base_project_admin_service.js');
const BaseProjectService = require('../../service/base_project_service.js');

class BaseProjectAdminController extends BaseAdminController {
	/** 是否管理员  */
	async isAdmin() {
		// 判断是否管理员
		let service = new BaseProjectAdminService();
		let admin = await service.isAdmin(this._token);
		this._admin = admin;
		this._adminId = admin._id;
	}

	/** 是否超级管理员  */
	async isSuperAdmin() {
		// 判断是否管理员
		let service = new BaseProjectAdminService();
		let admin = await service.isSuperAdmin(this._token);
		this._admin = admin;
		this._adminId = admin._id;
	}

	// TODO
	async initSetup() {
		let service = new BaseProjectService();
		await service.initSetup();
	}

}

module.exports = BaseProjectAdminController;