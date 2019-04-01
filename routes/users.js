var express = require("express");
var https = require("https");
var iconv = require("iconv-lite");
var WXBizDataCrypt = require('./WXBizDataCrypt');
var router = express.Router();
var UserModel = require("../modal/User").UserModel;
const RestResult = require('./RestResult');
var nodemailer = require('nodemailer');
/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

//保存用户初次登录，param为code、school、campus、userInfo,获取openid
router.post('/login', function (req, res, next) {
    var resData = new RestResult();
    var param = req.body;

    var code = param.code;
    var school = param.school;
    var campus = param.campus;
    var userInfo = param.userInfo;
    // var encryptedData = param.encryptedData;
    // var iv = param.iv;
    var session_key = null;
    var openid = null;
    var APPID = "**********************"; //换成你的微信小程序对应的APPID SECRET
    var SECRET = "************************";
    var url = "https://api.weixin.qq.com/sns/jscode2session?appid=" + APPID + "&secret=" + SECRET + "&js_code=" + code + "&grant_type=authorization_code";
    https.get(url, function (response) {
        var datas = [];
        var size = 0;
        response.on('data', function (data) {
            datas.push(data);
            size += data.length;
            //process.stdout.write(data);
        });
        response.on("end", function () {
            var buff = Buffer.concat(datas, size);
            var result = iconv.decode(buff, "utf8");//转码//var result = buff.toString();//不需要转编码,直接tostring

            session_key = JSON.parse(result).session_key;
            openid = JSON.parse(result).openid;

            UserModel.findOne({openId: openid}, function (err, doc) {
                if (err) {
                    resData.code = 5;
                    resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
                    res.send(resData);
                    return;
                }
                if (doc) {
                    console.log(doc);
                    resData.code = 0;
                    resData.returnValue = {userId: doc._id};
                    res.send(resData);
                }
                else {
                    var userEntity;

                    if (userInfo) {
                        userEntity = new UserModel({
                            openId: openid,
                            session_key: session_key,
                            school: school,
                            campus: campus,
                            avatarUrl: userInfo.avatarUrl,
                            nickName: userInfo.nickName,
                            gender: userInfo.gender,
                            city: userInfo.city,
                            province: userInfo.province,
                            country: userInfo.country,
                            language: userInfo.language
                        })
                    }
                    else {
                        userEntity = new UserModel({
                            openId: openid,
                            session_key: session_key,
                            school: school,
                            campus: campus
                        })
                    }

                    userEntity.save(function (err, doc) {
                        if (err) {
                            resData.code = 5;
                            resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
                            res.send(resData);
                        }
                        else {
                            resData.code = 0;
                            resData.returnValue = {userId: doc._id};
                            res.send(resData);
                        }
                    });
                }
            });


            // var pc = new WXBizDataCrypt(APPID, session_key);
            //
            //
            // var data = pc.decryptData(encryptedData , iv);
            //
            // console.log('解密后 data: ', data)
        });
    }).on("error", function (err) {
        Logger.error(err.stack);
        callback.apply(null);
    });
});

//补充用户信息,param 为userInfo,userId
router.post('/addUserInfo', function (req, res, next) {
    var resData = new RestResult();
    var param = req.body;
    var userId = param.userId;
    var userInfo = param.userInfo;
    UserModel.update({_id: userId},
        {
            $set: {
                avatarUrl: userInfo.avatarUrl,
                nickName: userInfo.nickName,
                gender: userInfo.gender,
                city: userInfo.city,
                province: userInfo.province,
                country: userInfo.country,
                language: userInfo.language
            }
        },
        function (err, doc) {
            if (err) {
                resData.code = 5;
                resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
                res.send(resData);
            }
            else {
                resData.code = 0;
                resData.returnValue = "补充用户数据成功。";
                res.send(resData);
            }
        }
    );
});

//修改用户学校校区,param 为school,campus,userId
router.post('/updateUserSchoolCampus', function (req, res, next) {
    var resData = new RestResult();
    var param = req.body;
    var userId = param.userId;
    var school = param.school;
    var campus = param.campus;
    UserModel.update({_id: param.userId},
        {
            $set: {
                school: school,
                campus: campus
            }
        },
        function (err, doc) {
            if (err) {
                resData.code = 5;
                resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
                res.send(resData);
            }
            else {
                resData.code = 0;
                resData.returnValue = "修改用户学校、校区成功。";
                res.send(resData);
            }
        }
    );
});

//发送反馈邮件
router.post('/sendEmailToMe',function (req,res,next) {
    var resData = new RestResult();
    var param = req.body;
    var content = param.content;
    console.log(content);
    var transporter = nodemailer.createTransport({
        service: 'qq',
        auth: {
            user: '********@qq.com',
            pass: '****************'
        }
    });
    var mailOptions = {
        from: '*******@qq.com ', // sender address
        to: '*******@qq.com',
        subject: '红领巾用户反馈',
        text: content
    };
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            resData.code = 5;
            resData.errorReason = "提交失败";
            res.send(resData);
        }else{
            resData.code = 0;
            resData.returnValue = "提交成功！";
            res.send(resData);
        }
    });
});

module.exports = router;
