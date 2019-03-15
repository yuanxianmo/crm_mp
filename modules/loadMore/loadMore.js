// modules/loadMore/loadMore.js
Component({
   /**
    * 组件的属性列表
    */
   properties: {
      status: {
         type: String,
         value: "ready"
      }
   },

   /**
    * 组件的初始数据
    */
   data: {

   },

   /**
    * 组件的方法列表
    */
   methods: {
      emmit() {
         this.triggerEvent("emmit");
      }
   }
})