/**
 * @file app.js
 * @author swan
 */

/* globals swan */

App({
    onLaunch(options) {
    var that = this;
        
    },
    onShow(options) {
        
        const uuid = this.getUUID();
        this.globalData.uuid = uuid;
    },
    onHide() {
        // do something when hide
    },
    getUUID() {
      var that = this;
        let uuid = swan.getStorageSync('uuid');
        if (uuid && uuid.length === 36) {
            return uuid;
        }
        uuid = ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ that.unit8() & 15 >> c / 4).toString(16)
        );
        swan.setStorageSync('uuid', uuid);
        return uuid;
    },
    // 兼容crypto.getRandomValues的callBack。
    unit8() {
        const unitCode = ((typeof crypto !== 'undefined') && crypto.getRandomValues)
                       ? crypto.getRandomValues(new Uint8Array(1))[0]
                       : Math.floor(Math.random() * 0xff);
        return unitCode;
    },
    globalData:{
        user:{
         uuid:''
        },
    },
    siteInfo:require('siteinfo.js')
});
