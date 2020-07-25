"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _px = require("../../common/utils/px");

var _index = require("../../common/utils/index");

function _createForOfIteratorHelper(o) { if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) { var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var it, normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var STATUS = {
  IDLE: 0,
  LOADING: 1,
  SHOWTEXT: 2
};
Component({
  externalClasses: ['smt-feed-container', 'smt-feed-loading', 'smt-feed-content', 'smt-refresh-circle-left', 'smt-refresh-circle-right', 'smt-refresh-result-container', 'smt-refresh-result-text'],
  properties: {
    // 是否开启下拉刷新
    pullToRefresh: {
      type: Boolean,
      value: false
    },
    // loading加载区域高度 * 必须是device px
    loadingHeight: {
      type: Number,
      value: (0, _px.upx2dpx)(192),
      observer: function observer(n) {
        if (typeof n !== 'number') {
          throw 'loadingHeight 必须是数字类型!否则下拉可造成卡顿闪屏';
        }
      }
    },
    // 距底部距离 触发 scrolltolower 事件
    lowerThreshold: {
      type: Number,
      value: 50
    },
    // 加载成功话术 * 不要默认值，prop抖动
    text: {
      type: String,
      value: '',
      observer: function observer(n) {
        this.clipText(n);
      }
    },
    // 加载话术停留时间 * 用于单测
    textStayTime: {
      type: Number,
      value: 800
    },
    // 主题定义
    theme: {
      type: String,
      value: ''
    },
    // 禁止下拉 * 场景：处于滚动页面且api加载(demo示例平台)
    disableTouch: {
      type: Boolean,
      value: false
    }
  },
  data: {
    // 左右小球信息
    circle: {
      // 小球尺寸 * device px防止变形
      size: (0, _px.upx2dpx)(21),
      // 小球移动距离
      offsetX: (0, _px.upx2dpx)(33),
      // 左右渐隐（有先后）
      opacityL: 0,
      opacityR: 0,
      // 左右距离（有先后）
      xL: 0,
      xR: 0
    },
    // 是否禁用scrollView
    enableScroll: true,
    // 滑动距离
    offsetY: 0,
    // 滑动区域高度，用于计算阻尼值
    clientHeight: 0,
    // 最长18个汉字
    clipedText: '',
    // 0: 未开始 1: 加载中 2: 展示话术
    status: STATUS.IDLE,
    // 滚动高度
    scrollTop: 0
  },
  methods: {
    /**
     * 截取18位文字
     * @param {string} str 传入的文字
     */
    clipText: function clipText(str) {
      this.setData({
        clipedText: str.slice(0, 18)
      });
    },

    /**
     * scrollView 滚动参数
     * @param {Object} param Event
     */
    scrollHdl: function scrollHdl(_ref) {
      var _this = this;

      var detail = _ref.detail;
      this.scrollTop = detail.scrollTop; // 如果是ios惯性，就禁掉回弹

      if (this.data.pullToRefresh && this.scrollTop < 0 && this.data.enableScroll && this.offsetY === 0) {
        this.setData({
          enableScroll: false
        }, function () {
          _this.setData({
            enableScroll: true
          });
        });
      }

      this.triggerEvent('scroll', detail);
    },

    /**
     * 阻尼值转换 * 四参方程有常数，便于转换屏幕比
     * 两种情况： 滚动区域 > 400 ? 用系数 = .7 : .65
     * x: 0, 50, 100, 150, 200, 250, 300, 350, 400, 800, 40000, 120000
     * y: 0,32,62,90,115,136,153,164,170,270, 420, 440
     *
     * @param {number} pullDistance 下拉的总距离
     * @param {number=} base 基础值，calc(iphone 8p - 40px)
     * @return {number} 返回值
     */
    dumping: function dumping(offsetY) {
      var base = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 464;
      var y = offsetY > 0 ? offsetY : 0;
      var ratio = this.data.clientHeight / base;
      var result = 0;

      if (this.data.clientHeight > 400) {
        // 系数 .65
        result = (440.5 + .5) * ratio / (1 + Math.pow(y / 551.5665, -1.009)) - .5;
      } else {
        // 系数 .7
        result = (440.0483 + .0510) * ratio / (1 + Math.pow(y / 444.0544, -1.2801)) - .0510;
      }

      return Math.round(result);
    },
    touchHdl: function touchHdl(_ref2) {
      var _this2 = this;

      return (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        var type, _ref2$touches, touches, _ref2$changedTouches, changedTouches, _ref2$manual, manual, disabled, _iterator, _step, touch, id, pageY, distance, _iterator2, _step2, _touch, _id, _pageY, offsetY, pullDown, circleInfo, setOffsetY, _iterator3, _step3, _touch2, _id2, _pageY2, shouldLoad, result;

        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                type = _ref2.type, _ref2$touches = _ref2.touches, touches = _ref2$touches === void 0 ? [] : _ref2$touches, _ref2$changedTouches = _ref2.changedTouches, changedTouches = _ref2$changedTouches === void 0 ? [] : _ref2$changedTouches, _ref2$manual = _ref2.manual, manual = _ref2$manual === void 0 ? false : _ref2$manual;

                if (!(_this2.closing || _this2.data.disableTouch && !manual)) {
                  _context.next = 3;
                  break;
                }

                return _context.abrupt("return");

              case 3:
                // ue规定： 如果api调用下拉刷新，则不启用手势刷新
                disabled = !_this2.data.pullToRefresh && !manual && _this2.status === STATUS.IDLE; // 禁用多点触控

                _context.t0 = type;
                _context.next = _context.t0 === 'touchstart' ? 7 : _context.t0 === 'touchmove' ? 28 : _context.t0 === 'touchend' ? 45 : 57;
                break;

              case 7:
                _this2.touching = true;
                _iterator = _createForOfIteratorHelper(touches);
                _context.prev = 9;

                _iterator.s();

              case 11:
                if ((_step = _iterator.n()).done) {
                  _context.next = 19;
                  break;
                }

                touch = _step.value;
                id = touch.identifier, pageY = touch.pageY;

                if (!(_this2.pos[id] == null)) {
                  _context.next = 17;
                  break;
                }

                _this2.pos[id] = pageY + _this2.scrollTop;
                return _context.abrupt("break", 19);

              case 17:
                _context.next = 11;
                break;

              case 19:
                _context.next = 24;
                break;

              case 21:
                _context.prev = 21;
                _context.t1 = _context["catch"](9);

                _iterator.e(_context.t1);

              case 24:
                _context.prev = 24;

                _iterator.f();

                return _context.finish(24);

              case 27:
                return _context.abrupt("break", 57);

              case 28:
                distance = 0;
                _iterator2 = _createForOfIteratorHelper(touches);

                try {
                  for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                    _touch = _step2.value;
                    _id = _touch.identifier, _pageY = _touch.pageY;

                    if (_this2.pos[_id]) {
                      distance += Math.round(_pageY - _this2.pos[_id]);
                    }
                  }
                } catch (err) {
                  _iterator2.e(err);
                } finally {
                  _iterator2.f();
                }

                offsetY = _this2.offsetY = _this2.dumping(distance + _this2.lastOffsetY);
                pullDown = distance > 0; // 没loading动画时下拉计算动画

                if (_this2.status === STATUS.IDLE) {
                  circleInfo = (0, _index.calcCircle)(offsetY, _this2.data.loadingHeight);
                  circleInfo && _this2.setData(circleInfo);
                } // 还未加载时，向上划要收起loading


                if (!(!pullDown && _this2.status !== STATUS.IDLE && Math.abs(offsetY) > 20)) {
                  _context.next = 41;
                  break;
                }

                _this2.fadeCircle();

                _this2.setData({
                  status: STATUS.IDLE,
                  offsetY: 0
                });

                _this2.status = STATUS.IDLE;

                _this2.triggerEvent('statuschange', STATUS.IDLE);

                _this2.lastOffsetY = _this2.offsetY = 0;
                return _context.abrupt("return");

              case 41:
                if (!disabled) {
                  _context.next = 43;
                  break;
                }

                return _context.abrupt("return");

              case 43:
                // offsetY快，setData慢，可能造成向上划没到顶。
                // 要注意 初始就向下划，过滤掉
                if (offsetY > 0 || _this2.data.offsetY > 0) {
                  setOffsetY = function setOffsetY() {
                    return _this2.setData({
                      offsetY: offsetY
                    });
                  }; // 如果已经禁止滚动&&还往下拉，直接赋值


                  if (!_this2.data.enableScroll) {
                    setOffsetY();
                  } else {
                    _this2.setData({
                      // 该setData 不会多次执行
                      enableScroll: false
                    }, setOffsetY);
                  }
                }

                return _context.abrupt("break", 57);

              case 45:
                _iterator3 = _createForOfIteratorHelper(changedTouches);

                try {
                  for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                    _touch2 = _step3.value;
                    _id2 = _touch2.identifier, _pageY2 = _touch2.pageY;

                    if (_this2.pos[_id2]) {
                      _this2.lastOffsetY += _pageY2 - _this2.pos[_id2];
                    }
                  }
                } catch (err) {
                  _iterator3.e(err);
                } finally {
                  _iterator3.f();
                }

                if (!(touches.length || disabled)) {
                  _context.next = 49;
                  break;
                }

                return _context.abrupt("return");

              case 49:
                _this2.touching = false;
                _this2.pos = {}; // 判断是否加载

                shouldLoad = _this2.scrollTop <= 0 && _this2.offsetY >= _this2.data.loadingHeight;
                result = 0;

                if (shouldLoad) {
                  // 只有status === 0时，触发加载
                  if (_this2.status === STATUS.IDLE) {
                    _this2.triggerEvent('refresh');

                    _this2.setData({
                      status: STATUS.LOADING
                    });

                    _this2.status = STATUS.LOADING;

                    _this2.triggerEvent('statuschange', STATUS.LOADING);
                  }

                  _this2.startRefreshTime = Date.now();
                  result = _this2.data.loadingHeight;
                } else {
                  _this2.fadeCircle();
                }

                _this2.setData({
                  enableScroll: true
                }, function () {
                  _this2.setData({
                    offsetY: result
                  });
                });

                _this2.lastOffsetY = _this2.offsetY = result;
                return _context.abrupt("break", 57);

              case 57:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, null, [[9, 21, 24, 27]]);
      }))();
    },

    /**
     * circle渐隐
     */
    fadeCircle: function fadeCircle() {
      var _this3 = this;

      return (0, _index.linearAccu)(function (y, callback) {
        var circleInfo = (0, _index.calcCircle)(y, _this3.data.loadingHeight);

        if (circleInfo) {
          _this3.setData(circleInfo, callback);
        } else {
          callback();
        }
      }, this.data.loadingHeight, 0);
    },

    /**
     * 渐隐loadingbar
     */
    closeLoading: function closeLoading() {
      var _this4 = this;

      return (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                // 防止关闭后，touchend还在触发中
                _this4.closing = true;

                _this4.debCloseLoading.cancel();

                if (_this4.data.enableScroll) {
                  _context2.next = 5;
                  break;
                }

                _context2.next = 5;
                return (0, _index.syncSetData)(_this4, {
                  enableScroll: true
                });

              case 5:
                _context2.next = 7;
                return (0, _index.syncSetData)(_this4, {
                  offsetY: 0
                });

              case 7:
                _context2.next = 9;
                return new Promise(function (r) {
                  return setTimeout(r, 200);
                });

              case 9:
                _context2.next = 11;
                return (0, _index.syncSetData)(_this4, {
                  status: STATUS.IDLE
                });

              case 11:
                _this4.triggerEvent('statuschange', STATUS.IDLE);

                _this4.status = STATUS.IDLE;
                _this4.lastOffsetY = _this4.offsetY = 0;
                _this4.closing = false;

              case 15:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }))();
    },

    /**
     * 调用模拟下拉刷新
     */
    startRefresh: function startRefresh() {
      var _this5 = this;

      return (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (!(_this5.status !== STATUS.IDLE)) {
                  _context3.next = 4;
                  break;
                }

                _this5.debCloseLoading.cancel();

                _context3.next = 4;
                return _this5.closeLoading();

              case 4:
                _this5.status = STATUS.LOADING;

                _this5.setData({
                  enableScroll: false,
                  status: STATUS.LOADING
                }, function () {
                  if (_this5.closing) {
                    return;
                  }

                  _this5.offsetY = _this5.data.loadingHeight;

                  _this5.touchHdl({
                    type: 'touchend',
                    manual: true
                  });
                });

                _this5.triggerEvent('statuschange', STATUS.LOADING);

              case 7:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }))();
    },

    /**
     * 停止当前刷新
     */
    stopRefresh: function stopRefresh() {
      var _this6 = this;

      return (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4() {
        var time;
        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                // 用户下拉，至少保证小球转1圈
                time = 500 - (Date.now() - _this6.startRefreshTime);
                time = time > 0 ? time : 0;
                _context4.next = 4;
                return new Promise(function (r) {
                  return setTimeout(r, time);
                });

              case 4:
                _this6.status = STATUS.SHOWTEXT;

                _this6.setData({
                  status: STATUS.SHOWTEXT
                });

                _this6.triggerEvent('statuschange', STATUS.SHOWTEXT);

                _context4.next = 9;
                return _this6.debCloseLoading();

              case 9:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4);
      }))();
    },

    /**
     * 滚动到底部时触发
     * @param {Object} param detail 事件
     */
    scrollToLower: function scrollToLower(_ref3) {
      var detail = _ref3.detail;
      this.triggerEvent('scrolltolower', detail);
    },
    setScrollTop: function setScrollTop(scrollTop) {
      this.setData({
        scrollTop: scrollTop
      });
    }
  },
  created: function created() {
    var _this7 = this;

    this.setData({
      max: (0, _px.upx2dpx)(this.data.maxDistance)
    });
    this.clipText(this.data.text); // 记录用户下拉开始时间，到加载结束至少保证小球转3圈

    this.startRefreshTime = 0; // 滚动高度，用于计算是否触顶下拉

    this.scrollTop = 0; // 是否有手指在屏幕

    this.touching = false; // 多点触控位置，解决手指交叉切换问题

    this.pos = {}; // 上次结束位置

    this.lastOffsetY = 0; // 手指移动位置 * 用这个来判断是否手机离开屏幕

    this.offsetY = 0; // 0: 未开始 1: 加载中 2: 展示话术

    this.status = STATUS.IDLE; // 是否正在关闭

    this.closing = false; // 循环检测是否要关闭loading

    this.debOffsetCheck = function () {
      return new Promise(function (resolve) {
        var timer = setInterval(function () {
          if (_this7.touching) {
            return;
          }

          clearInterval(timer);
          resolve();
        }, 300);
      });
    }; // 关闭loading bar; text显示时长: 800ms


    this.debCloseLoading = (0, _index.promiseDebounce)( /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5() {
      return _regenerator["default"].wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return _this7.debOffsetCheck();

            case 2:
              _context5.next = 4;
              return new Promise(function (r) {
                return setTimeout(r, _this7.data.textStayTime);
              });

            case 4:
              _context5.next = 6;
              return _this7.closeLoading();

            case 6:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5);
    })), 100);
  },
  ready: function ready() {
    var _this8 = this;

    // 计算滑动区域高度，用于计算阻尼值
    swan.createSelectorQuery()["in"](this).select('.smt-feed-wrap').boundingClientRect(function (res) {
      try {
        if (!res) {
          throw '未找到节点';
        }

        var clientHeight = res.height;

        _this8.setData({
          clientHeight: clientHeight
        });
      } catch (err) {
        console.error('获取节点信息错误');
      }
    }).exec();
  }
});