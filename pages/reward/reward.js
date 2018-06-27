// pages/reward/reward.js
Page({
    handleRewardQr() {
        wx.previewImage({
            urls: ["https://raw.githubusercontent.com/dreamans/dreamans.github.io/master/reward.png"]
        })
    }
})