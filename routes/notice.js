var express = require("express");
var router = express.Router();
var async = require("async");
var NoticeModel = require("../modal/Notice").NoticeModel;
var OrderModel = require("../modal/Order").OrderModel;
const RestResult = require('./RestResult');

//按照学校school、校区campus，获取所有该学校、校区当前正发布的悬赏列表（只包括待接单）
router.post('/getRewardNoticeList',function (req,res,next) {
    var resData = new RestResult();
    var param = req.body;
    var school = param.school;
    var campus = param.campus;
   NoticeModel.find({school:school,campus:campus,type:0,isPublish:true}).sort({date:-1}).exec(function (err,docs) {
      if(err){
          resData.code = 5;
          resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
          res.send(resData);
          return;
      }
      if(docs.length > 0){
          resData.code = 0;
          resData.returnValue = docs;
          res.send(resData);
      }
      else{
          resData.code = 2;
          resData.errorReason = "该学校、校区暂无数据";
          res.send(resData);
      }
   });
});


//按照学校school、校区campus，获取所有该学校、校区当前正发布的待命列表
router.post('/getWaitOrderNoticeList',function (req,res,next) {
    var resData = new RestResult();
    var param = req.body;
    var school = param.school;
    var campus = param.campus;
    NoticeModel.find({school:school,campus:campus,type:1,isPublish:true}).sort({date:-1}).exec(function (err,docs) {
        if(err){
            resData.code = 5;
            resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
            res.send(resData);
            return;
        }
        if(docs.length > 0){
            resData.code = 0;
            resData.returnValue = docs;
            res.send(resData);
        }
        else{
            resData.code = 2;
            resData.errorReason = "该学校、校区暂无数据";
            res.send(resData);
        }
    });
});


//按照userId,获取该用户的所有悬赏列表（包括已接单，待接单）
router.post('/getRewardList',function (req,res,next) {
    var resData = new RestResult();
    var param = req.body;
    var userId = param.userId;
    NoticeModel.find({userId:userId,type:0}).sort({date:-1}).exec(function (err,docs) {
        if(err){
            resData.code = 5;
            resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
            res.send(resData);
            return;
        }
        if(docs.length > 0){
            resData.code = 0;
            resData.returnValue = docs;
            res.send(resData);
        }
        else{
            resData.code = 2;
            resData.errorReason = "该用户没有悬赏发布记录";
            res.send(resData);
        }
    });
});

//按照userId,获取该用户的所有待命列表
router.post('/getWaitOrderList',function (req,res,next) {
    var resData = new RestResult();
    var param = req.body;
    var userId = param.userId;
    NoticeModel.find({userId:userId,type:1}).sort({date:-1}).exec(function (err,docs) {
        if(err){
            resData.code = 5;
            resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
            res.send(resData);
            return;
        }
        if(docs.length > 0){
            resData.code = 0;
            resData.returnValue = docs;
            res.send(resData);
        }
        else{
            resData.code = 2;
            resData.errorReason = "该用户没有待命发布记录";
            res.send(resData);
        }
    });
});

//保存悬赏发布记录
router.post('/saveRewardNotice',function (req,res,next) {
    var resData = new RestResult();
    var param = req.body;
    NoticeEntity = new NoticeModel({
        userId: param.userId,
        type: 0,
        school:param.school,
        campus:param.campus,
        avatarUrl: param.avatarUrl,
        nickName:  param.nickName,
        rewardMoney:param.rewardMoney,
        content:param.content
    });
    NoticeEntity.save(function (err,doc) {
       if(err){
           resData.code = 5;
           resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
           res.send(resData);
       }
       else{
           resData.code = 0;
           resData.returnValue = "发布悬赏成功！";
           res.send(resData);
       }
    });
});

//保存待命发布记录
router.post('/saveWaitOrderNotice',function (req,res,next) {
    var resData = new RestResult();
    var param = req.body;
    NoticeEntity = new NoticeModel({
        userId: param.userId,
        type:1,
        school:param.school,
        campus:param.campus,
        avatarUrl: param.avatarUrl,
        nickName:  param.nickName,
        rewardMoney:param.rewardMoney,
        content:param.content
    });
    NoticeEntity.save(function (err,doc) {
        if(err){
            resData.code = 5;
            resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
            res.send(resData);
        }
        else{
            resData.code = 0;
            resData.returnValue = "发布待命成功！";
            res.send(resData);
        }
    });
});

//param:noticeId,删除悬赏某条发布记录
router.post('/deleteRewardNotice',function (req,res,next) {
    var resData = new RestResult();
    var param = req.body;
    NoticeModel.deleteOne({_id:param.noticeId},function (err,doc) {
        if(err){
            resData.code = 5;
            resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
            res.send(resData);
        }
        else{
            resData.code = 0;
            resData.returnValue = "删除成功！";
            res.send(resData);
        }
    });
});

//param：noticeId,取消发布待命
router.post('/cancelPublish',function (req,res,next) {
    var resData = new RestResult();
    var param = req.body;
    var noticeId = param.noticeId;
    NoticeModel.updateOne({_id:noticeId},{$set:{isPublish:false}},function (err,doc) {
        if (err) {
            resData.code = 5;
            resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
            res.send(resData);
        }
        else {
            resData.code = 0;
            resData.returnValue = "取消发布成功！";
            res.send(resData);
        }
    });
});

//param：noticeId 删除待命公告
router.post('/deleteWaitOrderNotice',function (req,res,next) {
    var resData = new RestResult();
    var param = req.body;
    var noticeId = param.noticeId;
        OrderModel.find({noticeId:noticeId},function (err,docs) {
            if(err){
                resData.code = 5;
                resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
                res.send(resData);
                return;
            }
            if(docs.length > 0){

                async.each(docs,function (doc,callback) {
                    if ((doc.status == 5 && doc.orderConfirmDelete)||(doc.status == 6 && doc.orderConfirmDelete) ){
                        OrderModel.deleteOne({_id:doc._id},function (err,doc) {
                            if(err){
                                resData.code = 5;
                                resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
                                res.send(resData);
                            }
                            else{
                                callback();
                            }
                        })
                    }
                    else if ((doc.status == 5 && !doc.orderConfirmDelete)||(doc.status == 6 && !doc.orderConfirmDelete)) {
                        OrderModel.updateOne({_id:doc._id},{$set:{receiveConfirmDelete:true}},function(err,doc){
                            if(err){
                                resData.code = 5;
                                resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
                                res.send(resData);
                            }
                            else{
                                callback();
                            }
                        });
                    }
                    else{
                        callback();
                    }
                },function (err) {
                    if(err){
                        console.log("err is:err");
                    }
                    else{
                        NoticeModel.deleteOne({_id:noticeId},function (err,doc) {
                            if(err){
                                resData.code = 5;
                                resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
                                res.send(resData);
                            }
                            else{
                                resData.code = 0;
                                resData.returnValue = "删除成功！";
                                res.send(resData);
                            }
                        });
                    }
                });
        }
    });
});

//param：content  搜索包含指定字符串的悬赏公告
router.post('/searchRewardNotice',function (req,res,next) {
    var resData = new RestResult();
    var param = req.body;
    var content = param.content;
    var re = new RegExp(content);
    async.series({
        RewardNotice:function (callback) {
            NoticeModel.find({content:re,school:param.school,campus:param.campus,isPublish:true,type:0}).sort({date:-1}).exec(function (err,docs) {
                callback(null,docs);
            });
        },
        WaitOrderNotice:function (callback) {
            NoticeModel.find({content:re,school:param.school,campus:param.campus,isPublish:true,type:1}).sort({date:-1}).exec(function (err,docs) {
                callback(null,docs);
            });
        }
    },function (err,results) {
        if(err){
            resData.code = 5;
            resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
            res.send(resData);
        }
        else{
            resData.code = 0;
            resData.returnValue = results;
            res.send(resData);
        }

    });

});
module.exports = router;