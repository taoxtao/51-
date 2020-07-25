/**
 * @file config.js
 * @author zhangxiaoqian (zhangxiaoqian03@baidu.com)
 * @desc 常量集
 */

 // 空态图标名称, 用于page-status组件
export const PS_TYPE_ICON = [
    'recharge',
    'article',
    'attention',
    'fans',
    'notes',
    'history',
    'comment',
    'authority',
    'delete',
    'video',
    'collect',
    'bookmark',
    'search',
    'message',
    'picture',
    'unfinished',
    'content',
    'question',
    'download',
    'file',
    'rest',
    'warning',
    'music',
    'hide',
    'application',
    'coupon',
    'wifi'
];

// 截断文本类型，用于page-status组件
export const PS_TEXT_TYPE = {
    LOADING_TITLE: 'loadingTitle',
    PAGE_TITLE: 'title',
    PAGE_DESC: 'desc',
    PAGE_BTN_TEXT: 'btnText'
};

// 截断文本数目，用于page-status组件
export const PS_CLIP_NUM = {
    BTN: 4,
    TITLE: 20,
    DESC: 40
};

// 自定义导航的公共属性
export const NAV_PROPS = {
    navigationStyle: {
        type: Object,
        value: {}
    },
    navigationAreaStyle: {
        type: Object,
        value: {}
    },
    backgroundColor: {
        type: String,
        value: '#fff'
    },
    opacity: {
        type: Number,
        value: 1
    },
    frontColor: {
        type: String,
        value: '#000'
    },
    // 主页图标大小
    homeIconSize: {
        type: String,
        value: '35.02rpx'
    },
    // 返回图标大小
    backIconSize: {
        type: String,
        value: '35.02rpx'
    },
    /**
    * TODO:
    * 1，自定义导航行间样式加上安全宽度，原方法作者@houyu01
    * 2，分析safeWidth作用是：防止文字过多挤到右侧关于按钮下面；
    * 3，但是设置了这个行间后，开发者处理slot的居中内容很不方便
    * 4，担心改动引起未知存量问题，故增加isFullScreenWidth方式去兼容旧版本
    */
    isFullScreenWidth: {
        type: Boolean,
        value: false
    },
    // switchType：导航切换时，透明度是否有渐变动画
    switchAnimation: {
        type: Boolean,
        value: false
    }
};
