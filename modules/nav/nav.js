// modules/nav/nav.js
Component({
   /**
    * 组件的属性列表
    */
   properties: {

   },

   /**
    * 组件的初始数据
    */
   data: {
      allowMove: false, //是否允许左右滑动
      x: 0, //菜单偏移量
      startX: 0, //触摸开始X坐标
      startY: 0, //触摸开始Y坐标
      currentX: 0, //触摸当前X坐标
      endX: 0, //触摸结束坐标
      lastX: 0, //上一次坐标
      totalX: 0, //总计手指偏移量
      offsetX: 0, //偏移坐标
      expectedX: 0, //预算坐标
      transition: false, //是否启用过渡
      speed: 0, //手指滑动速度
      startTime: 0, //事件开始时间
      endTime: 0 //事件结束时间
   },

   /**
    * 组件的方法列表
    */
   methods: {
      change(e) {
         this.setData({
            x: e.detail.x
         });
      },
      hide() {
         this.setData({
            x: 0
         });
      },
      prevent(e) {},
      touchStart(e) {
         const pageX = parseInt(e.touches[0].pageX);
         this.setData({
            startX: pageX,
            lastX: pageX,
            currentX: pageX,
            transition: false,
            startTime: e.timeStamp
         });
      },
      touchMove(e) {
         var that = this;
         const pageX = parseInt(e.touches[0].pageX);
         var lastX = this.data.currentX;
         var currentX = pageX;
         var offsetX = pageX - lastX;
         var expectedX = this.data.x + offsetX;
         if (expectedX < 200 && expectedX > 0) {
            this.setData({
               x: expectedX
            });
         } else if (expectedX >= 200) {
            this.setData({
               x: 200
            });
         } else if (expectedX <= 0) {
            this.setData({
               x: 0
            });
         }
      },
      touchEnd(e) {
         this.setData({
            endX: parseInt(e.changedTouches[0].pageX),
            transition: true,
            endTime: e.timeStamp
         });
         this.setData({
            totalX: this.data.endX - this.data.startX
         });
         this.setData({
            speed: this.data.totalX / (this.data.endTime - this.data.startTime)
         });
         if (Math.abs(this.data.totalX > 20)) {
            if (this.data.speed > 0.3) {
               this.setData({
                  x: 200
               });
               return;
            } else if (this.data.speed < -0.3) {
               this.setData({
                  x: 0
               });
               return;
            }
         }
         if (this.data.x < 200 && this.data.x >= 100) {
            this.setData({
               x: 200
            });
         } else if (this.data.x < 100 && this.data.x > 0) {
            this.setData({
               x: 0
            });
         }
         console.log(this.data);
      }
   },
   ready() {}
})