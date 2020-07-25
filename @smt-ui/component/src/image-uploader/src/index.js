/**
 * @file 图片上传组件
 * @author jingxiangzheng(jingxiangzheng@baidu.com)
 */
/* globals Component, swan */
Component({
    externalClasses: [
        'picture-container-class',
        'picture-item-class'
    ],
    properties: {
        // 主题：default为小图，large为大图模式
        theme: {
            type: String,
            value: 'default'
        },
        // 上传图片列表
        pictureList: {
            type: Array,
            value: [],
            observer(n) {
                this.showTypeTipsHdl(n);
            }
        },
        // 上传图片个数上限
        pictureLimit: {
            type: Number,
            value: 9
        },
        // 是否支持预览
        showPreview: {
            type: Boolean,
            value: false
        },
        // 是否展示提示信息
        showTips: {
            type: Boolean,
            value: false
        },
        // 单张图片大小限制
        pictureSizeLimit: {
            type: Number,
            value: 1e7
        },
        // 从本地相册中选择图片个数
        pictureSelectLimit: {
            type: Number,
            value: 2
        }
    },

    data: {
        pictureList: [],
        modeList: [],
        typeList: []
    },
    methods: {
        /**
         * 增加图片并进行数量、大小的校验，获得图片信息，派发事件通知订阅者
         *
         */
        addHdl() {
            const {
                pictureSizeLimit,
                pictureLimit,
                pictureList
            } = this.data;

            swan.chooseImage({
                count: pictureLimit - pictureList.length,
                success: event => {
                    const selectedImages = event.tempFiles;
                    const totalImagesLength = selectedImages.length + pictureList.length;

                    // 超出限制图片数目，校验失败
                    if (totalImagesLength > pictureLimit) {
                        return swan.showToast({
                            title: `图片总数超过${pictureLimit}张，无法上传`
                        });
                    }
                    // 有图片大于10M的话，校验失败
                    if (selectedImages.some(file => file.size > pictureSizeLimit)) {
                        return swan.showToast({
                            title: `部分图片大于${pictureSizeLimit / 1000000}M，无法上传`
                        });
                    }
                    this.triggerEvent('chooseimage', {
                        images: pictureList.concat(selectedImages.map(file => file.path))
                    });
                },
                fail: err => {
                    console.log(err);
                }
            });
        },
        /**
         * 展示图片类型的描述
         *
         * @param {Array} picturesList 图片列表
         */
        showTypeTipsHdl(picturesList) {
            const typeList = this.data.typeList;
            picturesList.forEach((item, index) => {
                swan.getImageInfo({
                    src: item,
                    success: res => {

                        const imgType = res.type === 'gif'
                        ? 'GIF'
                        : (typeList[index] ? typeList[index] : '');
                        this.setData('typeList.' + index, imgType);
                    },
                    fail: err => {
                        console.log(err);
                    }
                });
            });
        },

        /**
         * 图片加载过程中触发，获得图片的裁剪、缩放模式
         *
         * @param {Event} event 事件对象
         * @param {Obejct} event.currentTarget.dataset 事件对象的数据
         */
        loadHdl(event) {
            const index = event.currentTarget.dataset.index;
            const imgWidth = event.detail.width;
            const imgHeight = event.detail.height;
            const aspectRatio = imgWidth / imgHeight;
            const type = this.data.typeList[index];
            this.setData('modeList.' + index, aspectRatio <= 0.4 ? 'widthFix' : 'aspectFill');
            if (type !== 'GIF') {
                this.setData('typeList.' + index, aspectRatio <= 0.4 ? '长图' : '');
            }
        },

        /**
         * 点击预览图片
         *
         * @param {Event} event 事件对象
         * @param {Obejct} event.currentTarget.dataset 事件对象的数据
         */
        viewHdl(event) {
            if (!this.data.showPreview) {
                return;
            }
            const pictureList = this.data.pictureList;
            swan.previewImage({
                current: pictureList[event.currentTarget.dataset.index],
                urls: pictureList
            });
        },

        /**
         * 删除图片，并派发事件通知订阅者
         *
         * @param {Event} e 事件对象
         * @param {Obejct} event.currentTarget.dataset 事件对象的数据
         */
        delHdl(event) {
            const pictureList = this.data.pictureList;
            const index = event.currentTarget.dataset.index;

            pictureList.splice(index, 1);
            this.triggerEvent('delimage', {index});
            this.setData({pictureList});
        }
    }
});
