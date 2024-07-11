/**
 * Notes: 路由配置文件
  * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * User: CC
 * Date: 2020-10-14 07:00:00
 */

module.exports = {
	'test/test': 'test/test_controller@test',
	
	'job/timer': 'job_controller@minuteJob',   

	'home/setup_get': 'home_controller@getSetup',

	'passport/login': 'passport_controller@login',
	'passport/phone': 'passport_controller@getPhone',
	'passport/my_detail': 'passport_controller@getMyDetail',
	'passport/register': 'passport_controller@register',
	'passport/edit_base': 'passport_controller@editBase',

	// 收藏
	'fav/update': 'fav_controller@updateFav',
	'fav/del': 'fav_controller@delFav',
	'fav/is_fav': 'fav_controller@isFav',
	'fav/my_list': 'fav_controller@getMyFavList',


	// 管理
	'admin/home': 'admin/admin_home_controller@adminHome',
	'admin/clear_vouch': 'admin/admin_home_controller@clearVouchData',

	'admin/login': 'admin/admin_mgr_controller@adminLogin',
	'admin/mgr_list': 'admin/admin_mgr_controller@getMgrList',
	'admin/mgr_insert': 'admin/admin_mgr_controller@insertMgr#demo',
	'admin/mgr_del': 'admin/admin_mgr_controller@delMgr#demo',
	'admin/mgr_detail': 'admin/admin_mgr_controller@getMgrDetail',
	'admin/mgr_edit': 'admin/admin_mgr_controller@editMgr#demo',
	'admin/mgr_status': 'admin/admin_mgr_controller@statusMgr#demo',
	'admin/mgr_pwd': 'admin/admin_mgr_controller@pwdMgr#demo',
	'admin/log_list': 'admin/admin_mgr_controller@getLogList',
	'admin/log_clear': 'admin/admin_mgr_controller@clearLog#demo',

	'admin/setup_set': 'admin/admin_setup_controller@setSetup#demo',
	'admin/setup_set_content': 'admin/admin_setup_controller@setContentSetup#demo',
	'admin/setup_qr': 'admin/admin_setup_controller@genMiniQr',


	// 用户
	'admin/user_list': 'admin/admin_user_controller@getUserList',
	'admin/user_detail': 'admin/admin_user_controller@getUserDetail',
	'admin/user_del': 'admin/admin_user_controller@delUser#demo',
	'admin/user_status': 'admin/admin_user_controller@statusUser#demo',

	'admin/user_data_get': 'admin/admin_user_controller@userDataGet',
	'admin/user_data_export': 'admin/admin_user_controller@userDataExport',
	'admin/user_data_del': 'admin/admin_user_controller@userDataDel',


	// 内容  
	'home/list': 'home_controller@getHomeList',
	'news/list': 'news_controller@getNewsList',
	'news/view': 'news_controller@viewNews',

	'admin/news_list': 'admin/admin_news_controller@getAdminNewsList',
	'admin/news_insert': 'admin/admin_news_controller@insertNews#demo',
	'admin/news_detail': 'admin/admin_news_controller@getNewsDetail',
	'admin/news_edit': 'admin/admin_news_controller@editNews#demo',
	'admin/news_update_forms': 'admin/admin_news_controller@updateNewsForms#demo',
	'admin/news_update_pic': 'admin/admin_news_controller@updateNewsPic#demo',
	'admin/news_update_content': 'admin/admin_news_controller@updateNewsContent#demo',
	'admin/news_del': 'admin/admin_news_controller@delNews#demo',
	'admin/news_sort': 'admin/admin_news_controller@sortNews#demo',
	'admin/news_status': 'admin/admin_news_controller@statusNews#demo',
	'admin/news_vouch': 'admin/admin_news_controller@vouchNews#demo',


	// 登记  
	'enroll/day_used': 'enroll_controller@getUsedByDay',
	'enroll/list': 'enroll_controller@getEnrollList',
	'enroll/all': 'enroll_controller@getAllEnroll',
	'enroll/detail_for_join': 'enroll_controller@detailForEnrollJoin',
	'enroll/prepay': 'enroll_controller@prepay',
	'enroll/join_edit': 'enroll_controller@enrollJoinEdit',
	'enroll/my_join_list': 'enroll_controller@getMyEnrollJoinList',
	'enroll/my_join_cancel': 'enroll_controller@cancelMyEnrollJoin',
	'enroll/my_join_detail': 'enroll_controller@getMyEnrollJoinDetail',

	'admin/enroll_all': 'admin/admin_enroll_controller@getAdminAllEnroll',
	'admin/enroll_join_appt': 'admin/admin_enroll_controller@enrollJoinByAdmin',
	'admin/enroll_join_scan': 'admin/admin_enroll_controller@scanEnrollJoin',
	'admin/enroll_join_checkin': 'admin/admin_enroll_controller@checkinEnrollJoin',
	'admin/enroll_list': 'admin/admin_enroll_controller@getAdminEnrollList',
	'admin/enroll_insert': 'admin/admin_enroll_controller@insertEnroll#demo',
	'admin/enroll_detail': 'admin/admin_enroll_controller@getEnrollDetail',
	'admin/enroll_edit': 'admin/admin_enroll_controller@editEnroll#demo',
	'admin/enroll_update_forms': 'admin/admin_enroll_controller@updateEnrollForms#demo',
	'admin/enroll_del': 'admin/admin_enroll_controller@delEnroll#demo',
	'admin/enroll_sort': 'admin/admin_enroll_controller@sortEnroll#demo',
	'admin/enroll_status': 'admin/admin_enroll_controller@statusEnroll#demo',
	'admin/enroll_join_list': 'admin/admin_enroll_controller@getEnrollJoinList',
	'admin/enroll_join_detail': 'admin/admin_enroll_controller@getEnrollJoinDetail',
	'admin/enroll_join_cancel': 'admin/admin_enroll_controller@cancelEnrollJoin#demo',
	'admin/enroll_join_data_get': 'admin/admin_enroll_controller@enrollJoinDataGet',
	'admin/enroll_join_data_export': 'admin/admin_enroll_controller@enrollJoinDataExport',
	'admin/enroll_join_data_del': 'admin/admin_enroll_controller@enrollJoinDataDel', 

	'admin/enroll_edit_days': 'admin/admin_enroll_controller@editDays',
	'admin/enroll_all_days': 'admin/admin_enroll_controller@getAllDay',
	'admin/enroll_temp_insert': 'admin/admin_enroll_controller@insertTemp',
	'admin/enroll_temp_list': 'admin/admin_enroll_controller@getTempList',
	'admin/enroll_temp_del': 'admin/admin_enroll_controller@delTemp',
	'admin/enroll_temp_edit': 'admin/admin_enroll_controller@editTemp',
	'admin/enroll_pay_flow_list': 'admin/admin_enroll_controller@getAdminPayFlowList', 
 

}