
const app = getApp()
const picDefaultWidth = 50;
const picDefaultHeight = 30;
const picTestFileDefaultWidth = 70;

Page({
    onShareAppMessage(res) {
        return {
            title: '我的颜值击败了全国 94% 的用户，不服来战！',
            path: '/pages/index/index',
            imageUrl: '../../asset/img/prview.png'
        }
    },
    data: {
        picSelfAdaptWidth: picDefaultWidth,
        picSelfAdaptHeight: picDefaultHeight,
        testPicFile: '',
        testPicResult: null,
        userInfo: null
    },
    handleGetUserInfo(e) {
        this.setData({
            userInfo: e.detail.userInfo
        });
        this.handleComputePic();
    },
    handleCancelPic() {
        this.setData({
            testPicFile: '',
            testPicResult: null,
            picSelfAdaptHeight: picDefaultHeight,
            picSelfAdaptWidth: picDefaultWidth
        });
    },
    handleUploadPic() {
        let self = this;
        let ret = wx.chooseImage({
            count: 1,
            sizeType: "compressed",
            success: function(res) {
                self.setData({
                    testPicFile: res.tempFiles[0].path
                });
                self.getImageInfo(res.tempFiles[0].path, function(res) {
                    self.setPicAdaptHeight(res.width, res.height);
                });
            }
        });
    },
    handlePlayAgain() {
        this.setData({
            testPicFile: '',
            testPicResult: null,
            picSelfAdaptHeight: picDefaultHeight,
            picSelfAdaptWidth: picDefaultWidth
        });
    },
    handleComputePic() {
        let self = this;
        wx.showLoading({
            title: "颜值计算中",
            mask: true
        });
        wx.uploadFile({
            url: 'https://api-cn.faceplusplus.com/facepp/v3/detect', //仅为示例，非真实的接口地址
            filePath: self.data.testPicFile,
            name: 'image_file',
            formData: {
                'api_key': 'DVc8JblEbcBjgq55TtDW0sheUhBeCaGe',
                'api_secret': 'lMUVhSAg_ruN4PmwgNCk0IiWPNAF2_Sr',
                'return_attributes': 'gender,age,beauty'
            },
            success: function (res) {
                if (res.statusCode != 200) {
                    wx.showToast({
                        title: '服务器被挤爆了，请稍后再试',
                        icon: 'none',
                        duration: 2000
                    });
                    return false;
                }
                let data = JSON.parse(res.data);
                console.log(data)
                console.log(res)
                if (!data.faces || data.faces.length == 0) {
                    wx.showToast({
                        title: '没有识别到人脸，请更换照片重试',
                        icon: 'none',
                        duration: 2000
                    });
                    return false;
                }
                let human = [];
                data.faces.forEach(item => {
                    let beauty = 50;
                    if (item.attributes.gender.value == 'Male') {
                        beauty = item.attributes.beauty.female_score;
                    } else {
                        beauty = item.attributes.beauty.male_score;
                    }
                    human.push(beauty);
                });
                let beautyIndex = human.indexOf(Math.max.apply(null, human));
                let maxBeautyHuman = data.faces[beautyIndex];
                
                let humanAttr = {
                    age: maxBeautyHuman.attributes.age.value,
                    gender: maxBeautyHuman.attributes.gender.value,
                    beauty: 50
                };
                if (humanAttr.gender == 'Male') {
                    humanAttr.beauty = maxBeautyHuman.attributes.beauty.female_score;
                } else {
                    humanAttr.beauty = maxBeautyHuman.attributes.beauty.male_score;
                }

                humanAttr.gender = humanAttr.gender == 'Male' ? "male" : "female";
                humanAttr.beauty = Math.ceil(humanAttr.beauty) + 15;
                humanAttr.beauty = humanAttr.beauty > 97 ? 97 : humanAttr.beauty;
                humanAttr.defeat = self.computeBeautyDefeatRatio(humanAttr.beauty);

                self.setData({
                    testPicResult: humanAttr
                });

                wx.hideLoading();
            },
            fail: function() {
                wx.showToast({
                    title: '网络异常，请稍后再试',
                    icon: 'none',
                    duration: 2000
                });
            }
        })
    },
    getImageInfo(imgSrc, scb, ecb) {
        wx.getImageInfo({
            src: imgSrc,
            success: scb,
            fail: ecb
        });
    },
    setPicAdaptHeight(picWidth, picHeight) {
        let h = (app.globalData.screenWidth * 0.7 / picWidth) * picHeight / app.globalData.screenHeight * 100;
        this.setData({
            picSelfAdaptHeight: h,
            picSelfAdaptWidth: picTestFileDefaultWidth
        });
    },
    computeBeautyDefeatRatio(beauty) {
        return Math.ceil(Math.sqrt(beauty) * 10);
    }
})