//logs.js
const util = require('../../utils/util.js')
const date = require('@root/utils/common/date')

Page({
  data: {
    logs: []
  },
  onLoad: function () {
    console.log(date.print())
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map(log => {
        return util.formatTime(new Date(log))
      })
    })
  }
})
