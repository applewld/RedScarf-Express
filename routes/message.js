var express = require("express");
var router = express.Router();
var async = require("async");
var MessageModel = require("../modal/Message").MessageModel;
var UserModel = require("../modal/User").UserModel;

const RestResult = require('./RestResult');

//保存消息数据,并把对方发过来的消息设为已读
router.post('/saveMessage',function (req,res,next) {
    var msgs = JSON.parse(req.body.msgs);
    var userId = req.body.userId;
    var toUserId = req.body.toUserId;
    var resData = new RestResult();
    async.series({
        one:function (callback) {
            MessageModel.create(msgs,function (err) {
                if(err){
                    console.log("保存消息失败")
                }
                else{
                    callback();
                }
            });
        },
        two:function (callback) {
            MessageModel.where({fromUserId:toUserId,toUserId:userId})
                .updateMany({$set:{toHaveRead:true}})
                .exec(function (err) {
                   if(err){
                       console.log("把对方发过来的消息设为已读操作失败")
                   }
                   else{
                       callback();
                   }
                });
        }
    },function (err,value) {
        if(err){
            resData.code = 5;
            resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
            res.send(resData);
        }
        else{
            resData.code = 0;
            resData.returnValue = "操作成功";
            res.send(resData);
        }
    });

});

//获取消息数据
router.post('/getMessage',function (req,res,next) {
    var fromUserId = req.body.fromUserId;
    var toUserId = req.body.toUserId;
    var resData = new RestResult();
    MessageModel.find({
        $or:[
            { $and: [{fromUserId:fromUserId},{toUserId : toUserId},{fromDelete:false}]},
            { $and:[{fromUserId:toUserId},{toUserId : fromUserId},{toDelete:false}]}
        ]
        }).sort({date:1}).exec(function (err,docs) {
        if(err){
            resData.code = 5;
            resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
            res.send(resData);
            return;
        }
        if(docs.length>0){
            resData.code = 0;
            resData.returnValue = JSON.stringify(docs);
            res.send(resData);
        }
        else{
            resData.code = 2;
            resData.returnValue = "没有消息记录";
            res.send(resData);
        }
    });
});

//判断是否有新消息
router.post('/haveNotRead',function (req,res,next) {
    var userId = req.body.userId;
    var resData = new RestResult();
    MessageModel.find({
        toUserId : userId,
        toHaveRead:false
    }).exec(function (err,docs) {
        if(err){
            resData.code = 5;
            resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
            res.send(resData);
            return;
        }
        if(docs.length>0){
            resData.code = 0;
            resData.returnValue = "有新消息";
            res.send(resData);
        }
        else{
            resData.code = 2;
            resData.returnValue = "无新消息";
            res.send(resData);
        }
    });
});

//获取消息列表
router.post('/getMsgList',function (req,res,next) {
    var userId = req.body.userId;
    var resData = new RestResult();
    async.series({
        one:function (callback) {
            MessageModel.find({fromUserId:userId,fromDelete:false}).distinct('toUserId').exec(function (err,docs) {
                callback(err,docs);
            })
        },
        two:function (callback) {
            MessageModel.find({toUserId:userId,toDelete:false}).distinct('fromUserId').exec(function (err,docs) {
                callback(err,docs);
            })
        }
    },function (err,result) {
        if(err){
            resData.code = 5;
            resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
            res.send(resData);
        }
        else{
            var toUser=[];
            for(var i=0;i<result.one.length;i++){
                toUser.push(result.one[i]);
            }
            for(var j=0;j<result.two.length;j++){
                var f=1;
                for(var k=0;k<result.one.length;k++){
                    if(result.one[k].toString() === result.two[j].toString()){
                        f=0;
                        break;
                    }
                }
                if(f){
                    toUser.push(result.two[j]);
                }
            }
            if(toUser.length>0){
                    var results = [];
                    async.each(toUser,function (toUserId,callback) {
                        async.series({
                            touserInfo:function (innercallback) {
                                UserModel.findOne({_id:toUserId},'nickName avatarUrl',function (err,doc) {
                                    if(err){
                                        console.log('err:'+ toUserId + " "+ "获取头像、昵称失败！");
                                    }
                                    else{
                                        // result.push(doc);
                                        innercallback(null,doc);
                                    }
                                });
                            },
                            content:function (innercallback) {
                                MessageModel.find({
                                    $or:[
                                        { $and: [{fromUserId:userId},{toUserId : toUserId},{fromDelete:false}]},
                                        { $and:[{fromUserId:toUserId},{toUserId : userId},{toDelete:false}]}
                                    ]
                                }).sort({date:-1}).limit(1).exec(function (err,doc) {
                                    if(err){
                                        console.log('err:'+ toUserId + " "+ "读取最后一条信息失败");
                                    }
                                    else{
                                        var data = {
                                            msg:doc[0].content,
                                            date:doc[0].date
                                        };
                                        innercallback(null,data);
                                    }
                                });
                            },
                            count:function (innercallback) {
                                MessageModel.count({fromUserId:toUserId,toHaveRead:false},function (err,count) {
                                    if(err){
                                        console.log('err:'+ toUserId+ " "+ "计算未读消息个数失败");
                                    }
                                    else{
                                        innercallback(null,count);
                                    }
                                });
                            }
                        },function (err,result) {
                            if(err){
                                callback(err);
                            }
                            else{
                                results.push(result);
                                callback();
                            }
                        })
                    },function (err) {
                        if(err){
                            resData.code = 5;
                            resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
                            res.send(resData);
                        }
                        else{
                            var  values = [];
                            for(var q=0;q<results.length;q++){
                                values.push({
                                    content:results[q].content.msg,
                                    date:results[q].content.date,
                                    count:results[q].count,
                                    avatarUrl:results[q].touserInfo.avatarUrl,
                                    nickName:results[q].touserInfo.nickName,
                                    toUserId:results[q].touserInfo._id
                                });
                            }
                            var compare= function (obj1,obj2) {
                                return obj2.date - obj1.date;
                            };
                            values.sort(compare);
                            resData.code = 0;
                            resData.returnValue = values;
                            res.send(resData);
                        }
                    });
            }
            else{
                resData.code = 2;
                resData.errorReason = "暂无消息记录";
                res.send(resData);
            }
        }
    })
});
module.exports = router;

