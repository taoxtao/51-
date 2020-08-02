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
        noMore:false,
        inputValue:null,
        tag:null,
        tags:[],
        newTags:[],
        tagid:null,
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
                    rightMenuInfo: rightMenuInfo,
                    imgW:res.windowWidth/2-6
                })
            }
        });
        console.log('tagid',that.options.id);
        that.setData({
            tagid:that.options.id
        })
        // that.getTag();
        that.getTagById(that.options.id);
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
    search(){
    console.log("search");
        this.setData({
            isEnd:false,
            page:1,
            lists:[]
        })
        this.getNews();
    },
    inputValue(e){
       this.setData({
        inputValue:e.value
       })
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
            listsIndex:e.currentTarget.dataset.index,
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
    imageLoad(e){
        // console.log("imageLoad",e);
    },
    imageError(e){
        console.log("imageError",e);
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
            this.setData({
                noMore:true
            })
            return;
        }
        var data = {
            page:that.data.page,
            order:'desc',
            per_page:that.data.per_page,
        }
        if(that.data.inputValue!=null){
                data.search = that.data.inputValue
        }
        if(that.data.tagid!=null){
            data.tags = that.data.tagid
        }
        var url = app.siteInfo.newsurl + "wp-json/wp/v2/posts";
        swan.request({
            // 开发者服务器接口地址
            url: url,
            // 请求的参数
            data: data,
            // 设置请求的 header，header 中不能设置 Referer。
            header: {},
            // 有效值：OPTIONS, GET, HEAD, POST, PUT, DELETE 。
            method: 'get',
            // 有效值：string,json。 如果设为 json，会尝试对返回的数据做一次 JSON.parse 。
            dataType: 'json',
            // 收到开发者服务成功返回的回调函数。
            success: res => {
                console.log('getNews', res.data);
                if(res.data.length>0){
                    that.showImg(res.data);
                }else{
                    this.setData({
                        noMore:true
                    })
                }
                
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
    getTag(){
        var that = this;
        var data = {};
        var url = app.siteInfo.newsurl + "wp-json/wp/v2/tags";
        swan.request({
            url: url,
            data:data,
            method:'GET',
            dataType:'json',
            success:res=>{
                console.log("getTag",res);
                 that.setData({
                     tags:res.data,
                 });
            },
            fail:res=>{
                console.log("getTag",res);
            }
        });
    },
    getTagById(id){
        var that = this;
        var data = {};
        var url = app.siteInfo.newsurl + "wp-json/wp/v2/tags/"+id;
        swan.request({
            url: url,
            data:data,
            method:'GET',
            dataType:'json',
            success:res=>{
                console.log("getTag",res);
                 that.setData({
                     tag:res.data,
                 });                
            },
            fail:res=>{
                console.log("getTag",res);
            }
        });                
    },
    showImg(news) {
        var that = this;
        var lists = [];
        for (var a = 0; a < news.length; a++) {
            var title = news[a].title.rendered;
            var date = news[a].date.replace('T',' ');
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
                var anchor = {
                    avator:imgArr[imgArr.length-1],
                    name:that.randomString(title+'abcdefghijklmnopqrstuvwxyz0123456789'),
                    slong:title,
                }
                var imgwh = {};
                switch(imgArr.length){
                    case 1:
                        imgwh = {
                            "img_w":'100%',
                            "img_h":that.data.imgW*2+"px"
                        }
                        break;
                    case 2:
                        imgwh = {
                            "img_w":'49%',
                            "img_h":that.data.imgW*2+"px"
                        }
                        break;
                    default:
                        imgwh = {
                            "img_w":that.data.imgW+"px",
                            "img_h":that.data.imgW+"px"
                        }
                }
                    lists[a] = {
                        title: title,
                        img: imgArr,
                        anchor:anchor,
                        date:date,
                        imgwh:imgwh,
                        tags:news[a].tags
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
        that.setPageInfo();
    },
randomString(str) {
  
  　　var maxPos = str.length;
        var n = maxPos/11;
  　　var pwd = '';
  　　for (i = 0; i <n; i++) {
  　　　　pwd += str.charAt(Math.floor(Math.random() * maxPos));
  　　}
   　　return pwd;
11 },
    getUserInfo(e) {
        this.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true
        });
    },
    onReachBottom() {
        console.log('onReachBottom');
        this.getNews();
    },
    onShareAppMessage(e) {
        var index=0;
        var idx=0;
        if(e.from=="menu"){
            if(this.data.isShow){
                index = this.data.listsIndex;
                idx = this.data.swiperCurrent;
            }
        }else{
           var index = e.target.dataset.index;
           var idx = 0;
        }
        var data =   this.data.lists[index];
        console.log("onShareAppMessage",index,idx);
        return {
            title: data.title,
            content: data.title,
            imageUrl: data.img[idx],
            path: '/pages/tag/tag?id='+this.options.id
        };
    },
    onPullDownRefresh(){
        this.search()
    },
    setPageInfo(){        
        var that = this;
        var data = that.data.lists[0];
        swan.setPageInfo({
            // 页面标题
            title: that.data.tag.name+'图片，就在-'+app.siteInfo.zh_name,
            // 页面关键字
            keywords: that.data.tag.name+'壁纸,高清'+that.data.tag.name+'壁纸,'+that.data.tag.name+'桌面壁纸,高清'+that.data.tag.name+'桌面壁纸,图片头像，高清摄影,屏保图、手机桌面图',
            // 页面描述信息
            description: '热门高清'+that.data.tag.name+'图片尽在国内综合性图片网站-51看图',
            // 原始发布时间(年-月-日 时:分:秒 带有前导零）
            releaseDate: data.date,
            // 文章(内容)标题(适用于当前页面是图文、视频类的展示形式，文章标题需要准确标识当前文章的主要信息点；至少6个字，不可以全英文。)
            articleTitle: data.title,
            // 图片线上地址，用于信息流投放后的封面显示，最多3张，单图片最大2M；封面图建议尺寸：高>=210px & 宽>=375px；最小尺寸：高>=146px & 宽>=218px。多张图时，用数组表示
            image:[data.img[0],data.img[1],data.img[2]],
            // 视频信息，多个视频时，用数组表示
            video: '',
            // 浏览信息。最低支持版本3.40.6。
            visit: {},
            // 点赞量，若页面未统计可为空。最低支持版本3.40.6。
            likes: '',
            // 评论量，若页面未统计可为空。最低支持版本3.40.6。
            comments: '',
            // 收藏量，若页面未统计可为空。最低支持版本3.40.6。
            collects: '',
            // 分享量，若页面未统计可为空。最低支持版本3.40.6。
            shares: '',
            // 关注量，若页面未统计可为空。最低支持版本3.40.6。
            followers: '',
            // 接口调用成功的回调函数
            success: res => {},
            // 接口调用失败的回调函数
            fail: res => {},
            // 接口调用结束的回调函数（调用成功、失败都会执行）
            complete: res => {}
        });
    },
    goBack(){
        swan.navigateBack({
            
        });
    }
})
