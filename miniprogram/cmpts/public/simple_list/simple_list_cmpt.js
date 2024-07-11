const cloudHelper = require('../../../helper/cloud_helper.js');
const PublicBiz = require('../../../comm/biz/public_biz.js');

Component({
    options: {
        addGlobalClass: true,
        //pureDataPattern: /^_dataList/, // 指定所有 _ 开头的数据字段为纯数据字段
        multipleSlots: true // 在组件定义时的选项中启用多slot支持
    },

    /**
     * 组件的属性列表
     */
    properties: {
        route: { // 业务路由
            type: String,
            value: ''
        },
        _params: { //路由的附加参数
            type: Object,
            value: {}
        },
        _dataList: {
            type: Object,
            value: null
        },
        type: {
            type: String, //业务类型 info,user,well
            value: ''
        },
        top: {
            type: String, // 顶部空出高度 rpx
            value: '0'
        },
        topBottom: {
            type: String, // 回顶部按钮的位置 rpx
            value: '50'
        },
        isLoad: {
            type: Boolean, //数据加载中
            value: false
        },
        dataNoHint: {
            type: String, //无数据提示
            value: '暂无数据哦~'
        },
        isCache: { // 非缓存状态下或者list缓存过期下onshow加载, 缓存下onload加载
            type: Boolean, //是否cache
            value: true
        },
		show: {
            type: String, //显示模式 分页page或者直接显示show
            value: 'page'
        },
    },

    /**
     * 组件的初始数据
     */
    data: {
        refresherTriggered: false, //下拉刷新是否完成  

        topNum: 0, //回顶部
        topShow: false,
    },

    lifetimes: {
        created: function () {
            // 组件实例化，但节点树还未导入，因此这时不能用setData
        },
        attached: function () {
            // 在组件实例进入页面节点树时执行 
            // 节点树完成，可以用setData渲染节点，但无法操作节点 
        },
        ready: async function () {

            // 组件布局完成，这时可以获取节点信息，也可以操作节点 

            if (this.data.isCache) //缓存状态下加载
                await this._getList(1);
        },
        move: function () {
            // 组件实例被移动到树的另一个位置
        },
        detached: function () {
            // 在组件实例被从页面节点树移除时执行
        },
    },

    pageLifetimes: {
        async show() {
            // 页面被展示   
            if (!this.data.isCache || !PublicBiz.isCacheList(this.data.type)) {
                // 非缓存状态下或者 list缓存过期下加载
                await this._getList(1);
            }

        },
        hide() {
            // 页面被隐藏
        },
        resize(size) {
            // 页面尺寸变化
        }
    },

    /**
     * 组件的方法列表
     */
    methods: {
        reload: async function () {
            await this._getList(1);
        },
        // 数据列表
        _getList: async function (page) {
            this.setData({ isLoad: false });

            let params = {
                page: page,
                ...this.data._params
            };

            if (page == 1 && !this.data._dataList) {
                this.triggerEvent('list', {
                    dataList: null //第一页面且没有数据提示加载中
                });
            }


            let opt = {};
            //if (this.data._dataList && this.data._dataList.list && this.data._dataList.list.length > 0)
            opt.title = 'bar';
            await cloudHelper.dataList(this, '_dataList', this.data.route, params, opt);

            this.setData({ isLoad: true });

            this.triggerEvent('list', { //TODO 考虑改为双向数据绑定model 
                dataList: this.data._dataList
            });

            if (this.data.isCache)
                PublicBiz.setCacheList(this.data.type);
            if (page == 1) this.bindTopTap();

        },

        bindReachBottom: async function () {
            // 上拉触底  
            await this._getList(this.data._dataList.page + 1);

        },

        bindPullDownRefresh: async function () {
            // 下拉刷新
            this.setData({
                refresherTriggered: true
            });
            await this._getList(1);
            this.setData({
                refresherTriggered: false
            });

        },

        /**
         * 顶部位置
         * @param {*} e 
         */
        bindScrollTop: function (e) {
            if (e.detail.scrollTop > 100) {
                this.setData({
                    topShow: true
                });
            } else {
                this.setData({
                    topShow: false
                });
            }
        },

        /**
         * 一键回到顶部
         */
        bindTopTap: function () {
            this.setData({
                topNum: 0
            });
        },

    }
})