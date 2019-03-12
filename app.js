//app.js
let native = Page;
const config = {
   // 58:9090,161:8082,72:8082
   apiBase: "http://192.168.1.72:8082"
}
Page = (obj) => {
   let stock = {
      onLoad() {
         if (!wx.getStorageSync("access_token") && getCurrentPages()[0].route != 'pages/login/index') {
            wx.redirectTo({
               url: '/pages/login/index',
            })
         }
      },
      bindData(e) {
         this.setData({
            [e.target.dataset.bind]: e.detail.value
         });
      },
      ajax: getApp().ajax
   };
   native(Object.assign(obj, stock, obj.mixins));
}
App({
   onLaunch: function() {},
   globalData: {
      userInfo: null
   },
   ajax(obj) {
      console.log(obj.contentType);
      var that = this;
      obj.data = obj.data || {};
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
               "Content-Type": (["put", "post", "delete"].indexOf(obj.type ? obj.type.toLowerCase() : "") != -1 && (obj.url != "/oauth/token") && obj.data.constructor.toString().search('FormData') == -1) ? "application/json" : obj.contentType ||'application/x-www-form-urlencoded'
            }, obj.headers),
            success(res) {
               obj.binding && (that.setData({
                  ["ajaxStatus." + obj.binding]: (res.code === 0 ? "success" : "error")
               }));
               obj.success && obj.success(res);
               obj.s && res.code === 0 && obj.s(res);

               if (!obj.pager) {
                  res.total !== undefined && (that.setData({
                     total: res.total
                  }));
                  res.total !== undefined && (that.setData({
                     pageSize: res.pageSize
                  }));
               }
               if (res.code === 1) {
                  wx.showToast({
                     title: res.msg || '未知错误',
                     duration: 2000
                  })
                  console.warn(res);
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
               obj.binding && (that.setData({
                  ["ajaxStatus." + obj.binding]: "error"
               }));
               switch (err.status) {
                  case 401:
                     if (getCurrentPages()[0].route != "pages/login/index") {
                        wx.redirectTo({
                           url: 'pages/login/index',
                        })
                     }
                     break;
                  case 403:
                     wx.showToast({
                        title: '权限不足！',
                     })
                     break;
                  case 404:
                     wx.showToast({
                        title: "接口不存在：" + obj.url,
                     })
                     break;
                  case 405:
                     wx.showToast({
                        title: "请求方式不被允许！",
                     })
                     break;
                  case 500:
                     wx.showToast({
                        title: "内部服务器错误！",
                     })
                     break;
                  case 502:
                     wx.showToast({
                        title: "服务器重启中！",
                     })
                     break;
                  case 0:
                     wx.showToast({
                        title: "服务器未响应！",
                     })
                     break;
                  default:
                     wx.showToast({
                        title: err.status + "[" + err.statusText + "]",
                     })
               }
               obj.error && obj.error(err);
               // if (isList) {
               //    that.ajaxStatus.getList = "listError";
               //    $(that.$el).addClass("listError").removeClass("listWorking").removeClass("listReady");
               // }
            }
         })
      );
   },
   getUserInfo(success = () => {}, error = () => {}) {
      var that = this;
      return this.ajax({
         url: "/api/user/info",
         s(res) {
            that.setData({
               userInfo: res.data
            });
            success();
         },
         error() {
            error();
         }
      });
   },
   getPermissions(success = () => {}, error = () => {}) {
      var that = this;
      return this.ajax({
         url: "/api/user/menu",
         s(res) {
            that.setData({
               userPermissions: res.data
            });
            // if (!that.hasPermission(that.$route.meta.permission)) {
            //    that.$router.replace("/pages/error/forbidden");
            // }
            success();
         },
         error() {
            error();
         }
      });
   },

})