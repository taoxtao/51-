/**
 * @file 搜索框组件
 * @author jingxiangzheng(jingxiangzheng@baidu.com)
 */
/* globals Component, swan */
import {systemInfo} from '../../common/utils/index';

Component({
    externalClasses: [
        'search-bar-class',
        'search-bar-content-class',
        'search-icon-class',
        'search-input-class',
        'search-text-class'
    ],
    properties: {
        /**
         * 搜索框主题样式：
         * default为搜索框灰色填充主题
         * border为搜索框描边主题
         * white为搜索框白色填充主题
         * transparent为搜索框透明主题
         */
        theme: {
            type: String,
            value: ''
        },
        placeholder: {
            type: String,
            value: '搜索关键词'
        },
        placeholderStyle: {
            type: String,
            value: ''
        },
        // 搜索icon的颜色
        searchIconColor: {
            type: String,
            value: '#999'
        },
        // 键盘右下角按钮文字
        confirmType: {
            type: String,
            value: 'search'
        },
        // 搜索框内容
        value: {
            type: String,
            value: ''
        },
        // 聚焦，调起输入键盘
        focus: {
            type: Boolean,
            value: false
        },
        // 最外层容器的样式，但theme权重大于该样式
        containerStyle: {
            type: Object,
            value: {
                background: '#f4f5f6',
                opacity: 1
            }
        },
        // 内层搜索容器的样式
        contentStyle: {
            type: Object,
            value: {
                width: 688.41,
                minWidth: 218
            }
        }
    },

    data: {
        platform: systemInfo.platform
    },

    methods: {
        /**
         * 聚焦处理
         *
         * @param {Event} e 事件对象
         * @param {Object} e.detail 获取value值
         */
        focusHdl(e) {
            this.setData('focus', true);
            this.triggerEvent('focus', e.detail);
            this.setData('showClear', !!this.data.value);
        },
        /**
         * 处理tap事件
         * @description 按钮如在focus触发时显示，会有延迟，故选在tap时触发
         */
        tapHdl() {
            this.setData('showSearchBtn', true);
            this.setData('showClear', !!this.data.value);
        },
        /**
         * 失焦处理
         *
         * @param {Event} e 事件对象
         * @param {Object} e.detail 获取value值
         */
        blurHdl(e) {
            // 点击清除时会触发失焦，引起问题点击失效，300ms可达到UE预期效果
            setTimeout(() => {
                this.setData({
                    showSearchBtn: false,
                    showClear: false,
                    focus: false
                });
                this.triggerEvent('blur', e.detail);
            }, 300);
        },
        /**
         * 触发输入
         *
         * @param {Event} e 事件对象
         * @param {Object} e.detail 获取value值
         */
        inputHdl(e) {
            const detail = e.detail;
            this.setData('value', detail.value);
            this.setData('showClear', !!this.data.value);
            this.triggerEvent('input', detail);
        },
        /**
         * 点击清除按钮
         */
        clearHdl() {
            this.setData({
                value: '',
                showSearchBtn: true,
                focus: true
            });
            this.triggerEvent('clear', {value: ''});
        },
        /**
         * 触发搜索
         */
        searchHdl() {
            this.setData({
                showSearchBtn: false,
                showClear: false
            });
            this.triggerEvent('search', {value: this.data.value});
        }
    }
});
