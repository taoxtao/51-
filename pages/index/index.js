/**
 * @file index.js
 * @author swan
 */
const app = getApp()

Page({
    data: {
        userInfo: {},
        hasUserInfo: false,
        canIUse: swan.canIUse('button.open-type.getUserInfo'),
        theme: 'default',
        placeholderStyle: '',
        searchIconColor: '#999',
        swiperCurrent: 0,
        lists: [],
        page: 1,
        systeminfo: null,
        imgW: null,
        isShow: false,
        full: app.siteInfo.oss.full,
        thumbnail: app.siteInfo.oss.thumbnail,
        per_page: 10,
        isEnd: false,
        isIos: false,
        indicatorDots: false,
        rightMenuInfo: null,
    },
    onLoad() {
        var that = this;
        var rightMenuInfo = swan.getMenuButtonBoundingClientRect();

        swan.getSystemInfo({
            success: res => {
                console.log('res', res);
                var isIos = /iOS/i.test(res.system) ? true : false;
                this.setData({
                    indicatorDots: !isIos,
                    systeminfo: res,
                    isIos: isIos,
                    rightMenuInfo: rightMenuInfo
                    // imgW:(res.windowWidth-12)/2*0.99
                })
            }
        });
        that.getNews();
    },
    onShow() {

        swan.setNavigationBarColor({
            frontColor: '#000000',
            backgroundColor: '#fff000',
            animation: {
                duration: 500,
                timingFunc: 'linear'
            },
            success: res => {
                swan.setNavigationBarTitle({
                    title: 111,
                    success: res => {
                        console.log(res);
                    },
                    fail: res => {
                        console.log(res);
                    }
                });
            }
        });
    },
    getImginfo(e) {
        console.log("getImginfo", e);
    },
    viewImgs(e) {
        console.log('viewImgs', e);
        var imgs = this.data.lists[e.currentTarget.dataset.index].img;
        var imgss = [];
        var i = 0;
        for (i; i < imgs.length; i++) {
            imgss.push(imgs[i].replace(this.data.thumbnail, this.data.full));
        }
        console.log("imgss", imgss);
        this.setData({
            isShow: true,
            imgs: imgss
        })
    },
    hiddenShow() {
        console.log('hiddenShow');
        this.setData({
            isShow: false,
            swiperCurrent: 0,
        })
    },
    swiperChange(e) {
        this.setData({
            swiperCurrent: e.detail.current
        })
    },
    getNews() {
        var that = this;
        if (that.data.isEnd) {
            console.log('isEnd');
            swan.showToast({
                'icon': 'none',
                title: '没有更多数据了'
            });
            return;
        }
        swan.request({
            // 开发者服务器接口地址
            url: app.siteInfo.newsurl + "wp-json/wp/v2/posts?page=" + that.data.page + "&order=desc&per_page=" + that.data.per_page,
            // 请求的参数
            data: '',
            // 设置请求的 header，header 中不能设置 Referer。
            header: {},
            // 有效值：OPTIONS, GET, HEAD, POST, PUT, DELETE 。
            method: 'get',
            // 有效值：string,json。 如果设为 json，会尝试对返回的数据做一次 JSON.parse 。
            dataType: 'json',
            // 收到开发者服务成功返回的回调函数。
            success: res => {
                console.log('getNews', res.data);
                that.showImg(res.data);
            },
            // 接口调用失败的回调函数。
            fail: res => {
                console.log("getnews fail", res);
            },
            // 接口调用结束的回调函数（调用成功、失败都会执行）。
            complete: res => {
            }
        });
    },
    showImg(news) {
        var that = this;
        var lists = [];
        for (var a = 0; a < news.length; a++) {
            var title = news[a].title.rendered;
            var content = news[a].content.rendered;
            //优先展示视频

            //图片
            var imgReg = /<img.*?(?:>|\/>)/gi;
            var srcReg = /https[\'\"]?([^\'\"]*)[\']?/i;
            var arr = content.match(imgReg);
            var imgArr = [];
            if (arr != null) {
                var len = arr.length;
                for (var i = 0; i < len; i++) {
                    var src = arr[i].match(srcReg);
                    if (src != null) imgArr.push(src[0] + that.data.thumbnail);
                }
                if (imgArr.length > 0) {
                    lists[a] = {
                        title: title,
                        img: imgArr
                    }
                }

            }
        }
        if (news.length < 10) {
            that.data.isEnd = true
        } else {
            that.data.page = that.data.page + 1;
        }
        console.log(lists);

        that.setData({
            isEnd: that.data.isEnd,
            page: that.data.page,
            lists: that.data.lists.concat(lists)
        })
    },
    getUserInfo(e) {
        this.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true
        });
    },
    onReachBottom() {
        console.log('onReachBottom');
        this.getNews();
    }
})
