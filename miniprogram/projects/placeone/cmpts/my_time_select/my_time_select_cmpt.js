const dataHelper = require('../../../../helper/data_helper.js');
const pageHelper = require('../../../../helper/page_helper.js');
const timeHelper = require('../../../../helper/time_helper.js');
Component({
	options: {
		addGlobalClass: true
	},

	/**
	 * 组件的属性列表
	 */
	properties: {
		day: {
			type: String,
			value: '', // 当前日期
		},
		columnsSource: {
			type: Object,
			value: {},
			/* 
			{
				list:[{ label: '场所1', enrollId: 'xx',times:[1,2,3,4] }, { label: '场所2', enrollId: 'yy',times:[]  }, { label: '场所3', enrollId: 'zzz',times:['时间点']  }],
				startTime:最早时间,
				endTime:最晚时间
			}
			*/
		},
		times: {
			type: Array,
			value: [], // {idx, title, start, end, used, error,price}
		},
		used: { // 已选择
			type: Array,
			value: [], // {title,start,end,url=支持true或者跳转地址}
		},
		enrollId: { // 当前 
			type: String,
			value: '',
		},
		height: { //整体高度
			type: Number,
			value: 800
		},
		startTime: { //开始时间点  
			type: Number,
			value: -1,//1
		},
		endTime: { //结束时间点  
			type: Number,
			value: -1,//23
		},
		timeMode: { // 时间模式 24/48
			type: String,
			value: '24',
		},
		showDetail: { //显示预订详情 no=不显示 line=单行 detail=详细
			type: String,
			value: 'no'
		},
		isAdmin: { //是否预订
			type: Boolean,
			value: false,
		},
		nowUserId: { // 当前用户ID
			type: String,
			value: ''
		},
		isPrice: { //是否显示价格
			type: Boolean,
			value: false,
		},

	},

	/**
	 * 组件的初始数据
	 */
	data: {
		selectedStart: '',
		selectedEnd: '',
		selectedEndPoint: '',
		columns: [], // 按场所的数据列
		price: 0,

		detailModalShow: false, //详情窗口
		apptData: null  //预订
	},

	/**
	 * 生命周期方法
	 */
	lifetimes: {
		attached: function () { },

		ready: function () {
			this.init();
		},

		detached: function () {
			// 在组件实例被从页面节点树移除时执行
		},

	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		init: function () {
			let startTime = Number(this.data.startTime);
			let endTime = Number(this.data.endTime);

			let now = timeHelper.time('Y-M-D h:m');

			let day = this.data.day;
			if (!day) day = timeHelper.time('Y-M-D'); 

			// 整体高度 暂时未用
			let height = (endTime - startTime + 1) * 68 + 78;
			this.setData({
				day,
				height
			});


			// 初始化 
			let columns = this.data.columnsSource.list;
			if (startTime = -1) startTime = this.data.columnsSource.startTime;
			if (endTime = -1) endTime = this.data.columnsSource.endTime;

			for (let j = 0; j < columns.length; j++) {
				let times = [];
				for (let k = startTime; k <= endTime; k++) {
					let start = '';
					let end = '';
					let title = '';

					if (k % 2 == 0) {
						start = dataHelper.padLeft(Math.floor(k / 2), 2, '0') + ':00';
						end = dataHelper.padLeft(Math.floor(k / 2), 2, '0') + ':29';

						title = dataHelper.padLeft(Math.floor(k / 2), 1, '0') + ':00';
					}
					else {
						start = dataHelper.padLeft(Math.floor(k / 2), 2, '0') + ':30';
						end = dataHelper.padLeft(Math.floor(k / 2), 2, '0') + ':59';

						title = dataHelper.padLeft(Math.floor(k / 2), 1, '0') + ':30';
					}

					if (end == '24:00') end = '23:59';


					let price = 999;
					let error = '';
					let timePrice = dataHelper.getValFromArr(columns[j].timePrice, 't', k);
					if (timePrice) {
						// 能找到定价
						price = timePrice.price;
					}
					else {
						// 不能找到定价
						error = '未开放';
					}

					if (!error) error = (day + ' ' + start < now) ? '已过期' : '';


					let node = {
						enrollId: columns[j].enrollId,
						idx: k,
						title,
						start,
						end,
						price,
						used: false,
						selected: false,
						error, //不能预订 
					}
					times.push(node);

				}

				// 已约时间段 
				for (let k = 0; k < this.data.used.length; k++) {
					let usedNode = this.data.used[k];


					// 计算有占有几个时间段
					let usedlen = 0;
					for (let j = 0; j < times.length; j++) {
						let node = times[j];
						if (node.enrollId == usedNode.enrollId && node.start >= usedNode.start && node.start <= usedNode.end) {
							usedlen++;
						}
					}
					if (usedlen <= 1) usedlen = 2;
					usedlen = Math.round(usedlen / 2);

					let curLen = 0;
					for (let j = 0; j < times.length; j++) {
						let node = times[j];
						if (node.enrollId == usedNode.enrollId && node.start == usedNode.start) {
							node.used = usedNode.url;
							node.usedFirst = true;
							node.forms = usedNode.forms;
							node.isCheckin = usedNode.isCheckin;

							curLen++;
							if (this.data.showDetail == 'detail' && curLen == usedlen)
								node.usedText = usedNode.title;
							else if (this.data.showDetail == 'line')
								node.usedText = usedNode.title;
							else if (this.data.showDetail == 'no') {
								node.usedText = this.data.nowUserId == usedNode.userId ? '我已约' : '已预订';
							}


						} else if (node.enrollId == usedNode.enrollId && node.start >= usedNode.start && node.start <= usedNode.end) {
							node.used = usedNode.url;
							node.usedFirst = false;
							node.forms = usedNode.forms;
							node.isCheckin = usedNode.isCheckin;

							curLen++;

							if (this.data.showDetail == 'detail' && curLen == usedlen)
								node.usedText = usedNode.title;
							else if (this.data.showDetail == 'line')
								node.usedText = usedNode.title;
							else if (this.data.showDetail == 'no')
								node.usedText = this.data.nowUserId == usedNode.userId ? '我已约' : '已预订';
						}
					}
				}

				columns[j].times = times;
			} 
 
			this.setData({
				columns
			});
		},

		bindSelectTap: function (e) {

			let columns = this.data.columns;

			//  选择
			let idx = pageHelper.dataset(e, 'idx');
			let columnIdx = pageHelper.dataset(e, 'columnidx');

			let timeNode = this.data.columns[columnIdx].times[idx];


			let selected = timeNode.start;

			// 已选择 
			let used = timeNode.used;
			if (used) {
				if (this.data.showDetail == 'no')
					return; // 不能下单
				else {
					this.setData({
						detailModalShow: true,
						apptData: timeNode
					});
					return;
				}
			}

			// 不能下单
			let error = timeNode.error;
			if (error) return;

			let enrollId = timeNode.enrollId;

			if (enrollId != this.data.enrollId) {
				// 切换了场所，所有选中都清除
				for (let j = 0; j < columns.length; j++) {
					for (let k = 0; k < columns[j].times.length; k++) {
						columns[j].times[k].selected = false;
					}
				}
				this.setData({
					price: 0,
					columns,
					selectedStart: '',
					selectedEnd: ''
				});
			}

			this.setData({
				enrollId
			});


			let selectedStart = this.data.selectedStart;
			let selectedEnd = this.data.selectedEnd;


			let times = columns[columnIdx].times;

			// 区间内直接干掉
			if (selected >= selectedStart && selected <= selectedEnd) {
				selectedStart = '';
				selectedEnd = '';
				for (let k = 0; k < times.length; k++) {
					times[k].selected = false;
				}
				this.setData({
					columns,
					selectedStart,
					selectedEnd
				});
				return;
			}


			if (!selectedStart && !selectedEnd) {
				selectedStart = selected;
				selectedEnd = selected;
			}

			if (selected < selectedStart) selectedStart = selected;
			if (selected > selectedEnd) selectedEnd = selected;


			// 如果包含了已选的，则只保留最后或者最后选择那一个时段
			for (let k = 0; k < times.length; k++) {
				if (times[k].start >= selectedStart
					&& times[k].start <= selectedEnd
					&& (times[k].used || times[k].error)
				) {

					if (selected >= selectedEnd) {
						selectedStart = selectedEnd;
					}
					else if (selected <= selectedStart) {
						selectedEnd = selectedStart;
					}

					break;
				}
			}



			// 时间段选中 
			let price = 0;
			for (let k = 0; k < times.length; k++) {
				if (times[k].start >= selectedStart && times[k].start <= selectedEnd) {
					times[k].selected = true;
					price += Number(times[k].price)
				}
				else {
					times[k].selected = false;
				}
			}

			// 取得结束时间点
			let selectedEndPoint = '';
			for (let k = 0; k < times.length; k++) {
				if (times[k].start == selectedEnd) {
					selectedEndPoint = times[k].end;
				}
			}

			this.setData({
				price,
				columns,
				selectedStart,
				selectedEnd,
				selectedEndPoint
			});

		},

		bindSumbitTap: function (e) {
			let that = this;

			let start = that.data.selectedStart;
			let end = that.data.selectedEnd;
			let endPoint = that.data.selectedEndPoint;
			let enrollId = that.data.enrollId;
			if (!start || !end || !endPoint) return;

			that.triggerEvent('select', {
				start,
				end,
				endPoint,
				enrollId,
				price: that.data.price
			});



		},

		bindCancelCmpt: function (e) { //取消
			this.setData({
				detailModalShow: false,
			});
			this.triggerEvent('cancel', this.data.apptData.forms);
		},

		bindCheckinTap: function (e) { //取消
			let val = pageHelper.dataset(e, 'val');
			let txt = (val == 1) ? '取消核销' : '核销';
			val = (val == 1) ? 0 : 1;

			let joinId = this.data.apptData.forms.joinId;
			let cb = () => {
				this.setData({
					detailModalShow: false,
				});
				this.triggerEvent('checkin', { val, joinId });
			}
			pageHelper.showConfirm('确认' + txt + '?', cb);

		}
	}
})