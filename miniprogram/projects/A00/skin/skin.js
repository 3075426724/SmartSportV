module.exports = {
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