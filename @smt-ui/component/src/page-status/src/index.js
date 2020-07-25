/**
 * @file index.js
 * @author zhangxiaoqian (zhangxiaoqian03@baidu.com)
 * @desc 页面状态组件
 */

import {PS_TYPE_ICON, PS_TEXT_TYPE, PS_CLIP_NUM} from '../../common/utils/consts';

Component({
    externalClasses: [
        'smt-page-status-wrap',
        'smt-page-status-loading-title',
        'smt-page-status-title',
        'smt-page-status-icon',
        'smt-page-status-description',
        'smt-page-status-btn'
    ],

    properties: {
        // 主题
        theme: {
            type: String,
            value: ''
        },

        // 从图标库调用
        icon: {
            type: String,
            value: 'content'
        },

        // 加载态的标题
        loadingTitle: {
            type: String,
            value: '正在加载...',
            observer(n) {
                this.clipText(n, PS_TEXT_TYPE.LOADING_TITLE, 20);
            }
        },

        // 空态的标题
        title: {
            type: String,
            value: '单行标题',
            observer(n) {
                this.clipText(n, PS_TEXT_TYPE.PAGE_TITLE, 20);
            }
        },

        // 空态的描述内容
        desc: {
            type: String,
            value: '',
            observer(n) {
                this.clipText(n, PS_TEXT_TYPE.PAGE_DESC, 40);
            }
        },

        // 空态状态是否显示操作按钮
        showBtn: {
            type: Boolean,
            value: true
        },

        // 操作按钮的文案
        btnText: {
            type: String,
            value: '重新加载',
            observer(n) {
                this.clipText(n, PS_TEXT_TYPE.PAGE_BTN_TEXT, 4);
            }
        },

        // 是否展示正在加载页面态
        loading: {
            type: Boolean,
            value: false
        }
    },

    data: {
        // 重新加载按钮是否被点击
        isClicked: false,
        // 正在加载文本截断，不超过20个字
        clipLoadingTitle: '',
        // 空态标题截断，不超过20个字
        clipTitle: '',
        // 空态描述文本截断，不超过40个字
        clipDesc: '',
        // 空态按钮文本阶段，不超过4个字
        clipBtnText: ''
    },

    created() {
        // 若传入的值不在列表内，则抛出异常
        if (!this.checkIconExist(this.data.icon)) {
            throw new Error('传入的icon值在组件库内不存在。');
        }

        // 截断文本
        this.clipText(this.data.loadingTitle, PS_TEXT_TYPE.LOADING_TITLE, PS_CLIP_NUM.TITLE);
        this.clipText(this.data.title, PS_TEXT_TYPE.PAGE_TITLE, PS_CLIP_NUM.TITLE);
        this.clipText(this.data.desc, PS_TEXT_TYPE.PAGE_DESC, PS_CLIP_NUM.DESC);
        this.clipText(this.data.btnText, PS_TEXT_TYPE.PAGE_BTN_TEXT, PS_CLIP_NUM.BTN);
    },

    methods: {
        /**
         * 空省状态点击按钮操作
         *
         * @private
         */
        onTap() {
            if (!this.isClicked) {
                this.isClicked = true;
                setTimeout(() => {
                    this.triggerEvent('smtreloading');
                    this.isClicked = false;
                }, 200);
            }
        },

        /**
         * 判断传入的icon是否存在于图表库中
         *
         * @private
         * @param {string} iconVal 传入的图标名称
         */
        checkIconExist(iconVal) {
            return PS_TYPE_ICON.some(item => iconVal === item);
        },

        /**
         * 截取超出的文字
         *
         * @private
         * @param {string} name 传入的文字
         * @param {string} type 截断的文本类型
         * @param {string} num 截断的文本长度
         */
        clipText(name, type, num) {
            const str = name.slice(0, num);
            switch (type) {
                case PS_TEXT_TYPE.LOADING_TITLE:
                    this.setData({clipLoadingTitle: str});
                    break;
                case PS_TEXT_TYPE.PAGE_TITLE:
                    this.setData({clipTitle: str});
                    break;
                case PS_TEXT_TYPE.PAGE_DESC:
                    this.setData({clipDesc: str});
                    break;
                case PS_TEXT_TYPE.PAGE_BTN_TEXT:
                    this.setData({clipBtnText: str});
                    break;
                default:
                    break;
            }
        }
    }
});
