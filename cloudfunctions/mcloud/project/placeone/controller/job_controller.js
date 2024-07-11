/**
 * Notes: 定时器模块控制器
 * Date: 2023-04-15 19:20:00 
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 */

const BaseProjectController = require('./base_project_controller.js');
const EnrollService = require('../service/enroll_service.js');

class JobController extends BaseProjectController {
	// 定时器执行
	minuteJob() {
		console.log('DO minuteJob Begin...')

		let service = new EnrollService();
		service.minuteJob();

		console.log('DO minuteJob END.')
	}
}

module.exports = JobController;