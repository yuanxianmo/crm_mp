//app.js
let nativePage = Page;
let nativeComponent = Component;
const config = {
   // 58:9090,161:8082,72:8082
  apiBase: "http://192.168.1.58:9090"
}

function ajax(obj) {
   var that = this;
   var isList = this.isList;
   obj.data = obj.data || {};
   obj.data = obj.data.constructor.toString().search('FormData') == -1 ? Object.assign({
      pageNum: obj.type ? undefined : that.data.currentPage,
      currentPage: obj.type ? undefined : that.data.currentPage
   }, obj.data || {}) : obj.data;
   obj.binding && (this.$setData({
      ["ajaxStatus." + obj.binding]: "working"
   }));
   return wx.request(
      Object.assign({}, obj, {
         url: config.apiBase + obj.url,
         method: obj.type || 'get',
         dataType: obj.dataType || "json",
         data: (["put", "post", "delete"].indexOf(obj.type ? obj.type.toLowerCase() : "") != -1 && (obj.url != "/oauth/token") && obj.data.constructor.toString().search('FormData') == -1) ? JSON.stringify(obj.data) : obj.data,
         header: Object.assign({
            "Authorization": "Bearer " + wx.getStorageSync("access_token"),
            "Content-Type": (["put", "post", "delete"].indexOf(obj.type ? obj.type.toLowerCase() : "") != -1 && (obj.url != "/oauth/token") && obj.data.constructor.toString().search('FormData') == -1) ? "application/json" : obj.contentType || 'application/x-www-form-urlencoded'
         }, obj.headers),
         success(res) {
            obj.binding && (that.setData({
               ["ajaxStatus." + obj.binding]: (res.data.code === 0 ? "success" : "error")
            }));
            obj.success && obj.success(res.data);
            obj.s && res.data.code === 0 && obj.s(res.data);
            res.data.total !== undefined && (that.setData({
               total: res.data.total
            }));
            res.data.pageSize !== undefined && (that.setData({
               pageSize: res.data.pageSize
            }));
            if (isList) {
               if (res.data.code === 0) {
                  that.setData({
                     "ajaxStatus.loader": "ready"
                  });
               } else {
                  that.setData({
                     "ajaxStatus.loader": "error"
                  });
               }
            }
            if (res.data.code === 1) {
               const err = res;
               wx.showToast({
                  title: res.data.msg || '未知错误',
                  icon: "none",
                  duration: 2000
               })
               obj.binding && (that.setData({
                  ["ajaxStatus." + obj.binding]: "error"
               }));
               switch (err.statusCode) {
                  case 401:
                     wx.clearStorageSync("access_token");
                     setTimeout(() => {
                        wx.redirectTo({
                           url: '/pages/login/index',
                        })
                     }, 100);
                     break;
                  case 403:
                     wx.showToast({
                        title: '权限不足！',
                        icon: "none",
                        duration: 2000
                     })
                     break;
                  case 404:
                     wx.showToast({
                        title: "接口不存在：" + obj.url,
                        icon: "none",
                        duration: 2000
                     })
                     break;
                  case 405:
                     wx.showToast({
                        title: "请求方式不被允许！",
                        icon: "none",
                        duration: 2000
                     })
                     break;
                  case 500:
                     wx.showToast({
                        title: "内部服务器错误！",
                        icon: "none",
                        duration: 2000
                     })
                     break;
                  case 502:
                     wx.showToast({
                        title: "服务器重启中！",
                        icon: "none",
                        duration: 2000
                     })
                     break;
                  case 0:
                     wx.showToast({
                        title: "服务器未响应！",
                        icon: "none",
                        duration: 2000
                     })
                     break;
                  default:
                     wx.showToast({
                        title: err.status + "[" + err.statusText + "]",
                        icon: "none",
                        duration: 2000
                     })
               }
               obj.error && obj.error(err);
            }
            // if (isList) {
            //    if (res.code === 0) {
            //       that.ajaxStatus.getList = "listReady";
            //    } else {
            //       that.ajaxStatus.getList = "listError";
            //    }
            //    $(that.$el).addClass("listReady").removeClass("listWorking").removeClass("listError");
            // }
         },
         fail(err) {

            // if (isList) {
            //    that.ajaxStatus.getList = "listError";
            //    $(that.$el).addClass("listError").removeClass("listWorking").removeClass("listReady");
            // }
         }
      })
   );
}
//合并函数
function mergeFn(a, b) {
   return function() {
      a.call(this);
      b.call(this);
   }
}
//深度合并对象
function deepMerge() {
   var ret = {};
   for (var i in arguments) {
      for (var j in arguments[i]) {
         if (!ret[j]) {
            ret[j] = arguments[i][j]
         } else {
            if (typeof arguments[i][j] == "object") {
               ret[j] = Object.assign(ret[j], arguments[i][j]);
            } else if (typeof arguments[i][j] == "function") {
               ret[j] = mergeFn(ret[j], arguments[i][j]);
            }
         }
      }
   }
   return ret;
}
Page = (obj) => {
   var stock = {
      data: {
         currentPage: 1,
         pages: 0,
         pageSize: 10,
         total: 0,
         ajaxStatus: {}
      },
      firstPage() {
         this.setData({
            currentPage: 1
         });
         this.getList();
      },
      nextPage() {
         this.setData({
            currentPage: this.data.currentPage + 1
         });
         this.getList();
      },
      onShow() {
         if (!wx.getStorageSync("access_token") && getCurrentPages()[getCurrentPages().length - 1].route != 'pages/login/index') {
            wx.redirectTo({
               url: '/pages/login/index',
            })
         }
      },
      onReady() {
         var that = this;
         this.setData({
            app: getApp(),
            page: getCurrentPages()[getCurrentPages().length - 1]
         });
      },
      bindData(e) {
         this.setData({
            [e.target.dataset.bind]: e.detail.value
         });
      },
      ajax: ajax
   };
   nativePage(deepMerge(obj, stock, obj.mixins || {}));

}
Component = (obj) => {
   let stock = {
      ready() {
         this.setData({
            app: getApp(),
            page: getCurrentPages()[getCurrentPages().length - 1]
         });
      },
      ajax: ajax
   };
   nativeComponent(deepMerge(obj, stock, obj.mixins));
}

App({
   onShow: function() {
      this.getUserInfo();
      this.getPermissions();
   },
   data: {},
   globalData: {
      userInfo: {},
      permissions: []
   },
   ajax: ajax.bind(this),
   getUserInfo(success = () => {}, error = () => {}) {
      var that = this;
      return ajax.call(this, {
         url: "/api/user/info",
         s(res) {
            that.globalData.userInfo = res.data
            success();
         },
         error() {
            error();
         }
      });
   },
   getPermissions(success = () => {}, error = () => {}) {
      var that = this;
      return ajax.call(this, {
         url: "/api/user/menu",
         s(res) {
            that.globalData.permissions = res.data;
            // if (!that.hasPermission(that.$route.meta.permission)) {
            //    that.$router.replace("/pages/error/forbidden");
            // }
            success();
         },
         error() {
            error();
         }
      });
   }
})