var express = require("express");
var router = express.Router();
var OrderModel = require("../modal/Order").OrderModel;
var NoticeModel = require("../modal/Notice").NoticeModel;
const RestResult = require('./RestResult');

//保存订单
router.post('/saveOrder',function (req,res,next) {
    var resData = new RestResult();
    var param = req.body;
    var noticeId = param.noticeId;
    var orderEntity = new OrderModel({
        rewardMoney:param.rewardMoney,//赏金
        content:param.content,//订单内容
        orderUserId:param.orderUserId,//订单者信息
        orderAvatarUrl:param.orderAvatarUrl,
        orderNickName:param.orderNickName,
        receiveUserId:param.receiveUserId,//接单者信息
        receiveAvatarUrl:param.receiveAvatarUrl,
        receiveNickName:param.receiveNickName
    });
    orderEntity.save(function (err, doc) {
        if (err) {
            resData.code = 5;
            resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
            res.send(resData);
        }
        else {
            NoticeModel.updateOne({_id:noticeId},{$set:{status:1,isPublish:false}},function (err,doc) {
                if (err) {
                    resData.code = 5;
                    resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
                    res.send(resData);
                }
                else {
                    resData.code = 0;
                    resData.returnValue = "接单成功！";
                    res.send(resData);
                }
            });
        }
    });
});

//按照userId,获取该用户的所有订单信息
router.post('/getOrderList',function (req,res,next) {
    var resData = new RestResult();
    var param = req.body;
    var userId = param.userId;
    OrderModel.find({orderUserId:userId,orderConfirmDelete:false}).sort({date:-1}).exec(function (err,docs) {
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
            resData.errorReason = "该用户没有订单记录";
            res.send(resData);
        }
    });
});

//订单者预定订单
router.post('/saveBookOrder',function (req,res,next) {
    var resData = new RestResult();
    var param = req.body;
    var noticeId = param.noticeId;
    var orderEntity = new OrderModel({
        rewardMoney:param.rewardMoney,//赏金
        content:param.content,//订单内容
        orderUserId:param.orderUserId,//订单者信息
        orderAvatarUrl:param.orderAvatarUrl,
        orderNickName:param.orderNickName,
        receiveUserId:param.receiveUserId,//接单者信息
        receiveAvatarUrl:param.receiveAvatarUrl,
        receiveNickName:param.receiveNickName,
        noticeId:noticeId,
        status:4
    });
    orderEntity.save(function (err, doc) {
        if (err) {
            resData.code = 5;
            resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
            res.send(resData);
        }
        else {
            NoticeModel.updateOne({_id:noticeId},
                {
                    $inc:{status:1}
                },
                function (err,doc) {
                    if (err) {
                        resData.code = 5;
                        resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
                        res.send(resData);
                    }
                    else{
                        resData.code = 0;
                        resData.returnValue = "预定成功！";
                        res.send(resData);
                    }
                });
        }
    });
});

//param：userId,获取该用户的所有接单信息
router.post('/getReceiveList',function (req,res,next) {
    var resData = new RestResult();
    var param = req.body;
    var userId = param.userId;
    OrderModel.find({receiveUserId:userId,receiveConfirmDelete:false}).sort({date:-1}).exec(function (err,docs) {
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
            resData.errorReason = "该用户没有接单记录";
            res.send(resData);
        }
    });
});


//param：orderId,订单者取消订单
router.post('/orderderCancelOrder',function (req,res,next) {
    var resData = new RestResult();
    var param = req.body;
    var orderId = param.orderId;
    OrderModel.updateOne({_id:orderId},{$set:{status:1}},function (err,doc) {
        if (err) {
            resData.code = 5;
            resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
            res.send(resData);
        }
        else {
            resData.code = 0;
            resData.returnValue = "取消订单成功！";
            res.send(resData);
        }
    });
});

//param：orderId,预定者取消预定
router.post('/orderderCancelBook',function (req,res,next) {
    var resData = new RestResult();
    var param = req.body;
    var orderId = param.orderId;
    OrderModel.updateOne({_id:orderId},{$set:{status:5}},function (err,doc) {
        if (err) {
            resData.code = 5;
            resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
            res.send(resData);
        }
        else {
            resData.code = 0;
            resData.returnValue = "取消预定成功！";
            res.send(resData);
        }
    });
});

//param：orderId,接单者取消订单
router.post('/receiverCancelOrder',function (req,res,next) {
    var resData = new RestResult();
    var param = req.body;
    var orderId = param.orderId;
    OrderModel.updateOne({_id:orderId},{$set:{status:2}},function (err,doc) {
        if (err) {
            resData.code = 5;
            resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
            res.send(resData);
        }
        else {
            resData.code = 0;
            resData.returnValue = "取消订单成功！";
            res.send(resData);
        }
    });
});

//param:orderId,订单者删除某条订单记录
router.post('/orderderDeleteOrder',function (req,res,next) {
    var resData = new RestResult();
    var param = req.body;
    OrderModel.findOne({_id:param.orderId},function (err,doc) {
        if(err){
            resData.code = 5;
            resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
            res.send(resData);
        }
        else{
            if(doc.receiveConfirmDelete){//接单者也确认删除
                OrderModel.deleteOne({_id:param.orderId},function (err,doc) {
                    if(err){
                        resData.code = 5;
                        resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
                        res.send(resData);
                    }
                    else{
                        resData.code = 0;
                        resData.returnValue = "删除订单记录成功！";
                        res.send(resData);
                    }
                })
            }
            else{
                OrderModel.updateOne({_id:param.orderId},{$set:{orderConfirmDelete:true}},function (err,doc) {
                    if (err) {
                        resData.code = 5;
                        resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
                        res.send(resData);
                    }
                    else {
                        resData.code = 0;
                        resData.returnValue = "更新删除订单记录成功！";
                        res.send(resData);
                    }
                });
            }
        }
    });
});

//param:orderId,接单者删除某条订单记录
router.post('/receiverDeleteOrder',function (req,res,next) {
    var resData = new RestResult();
    var param = req.body;
    OrderModel.findOne({_id:param.orderId},function (err,doc) {
        if(err){
            resData.code = 5;
            resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
            res.send(resData);
        }
        else{
            if(doc.orderConfirmDelete){//订单者也确认删除
                OrderModel.deleteOne({_id:param.orderId},function (err,doc) {
                    if(err){
                        resData.code = 5;
                        resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
                        res.send(resData);
                    }
                    else{
                        resData.code = 0;
                        resData.returnValue = "删除订单记录成功！";
                        res.send(resData);
                    }
                })
            }
            else{
                OrderModel.updateOne({_id:param.orderId},{$set:{receiveConfirmDelete:true}},function (err,doc) {
                    if (err) {
                        resData.code = 5;
                        resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
                        res.send(resData);
                    }
                    else {
                        resData.code = 0;
                        resData.returnValue = "更新删除订单记录成功！";
                        res.send(resData);
                    }
                });
            }
        }
    });
});

//param:orderId,订单者确认完成某条订单
router.post('/orderderConfirmOrder',function (req,res,next) {
    var resData = new RestResult();
    var param = req.body;
    OrderModel.findOne({_id:param.orderId},function (err,doc) {
        if(err){
            resData.code = 5;
            resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
            res.send(resData);
        }
        else{
            if(doc.receiveConfirm){//接单者也确认完成
                OrderModel.updateOne({_id:param.orderId},{$set:{orderConfirm:true,status: 3}},function (err,doc) {
                    if(err){
                        resData.code = 5;
                        resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
                        res.send(resData);
                    }
                    else{
                        resData.code = 0;
                        resData.returnValue = "完成订单！";
                        res.send(resData);
                    }
                })
            }
            else{
                OrderModel.updateOne({_id:param.orderId},{$set:{orderConfirm:true}},function (err,doc) {
                    if (err) {
                        resData.code = 5;
                        resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
                        res.send(resData);
                    }
                    else {
                        resData.code = 0;
                        resData.returnValue = "更新完成订单记录成功！";
                        res.send(resData);
                    }
                });
            }
        }
    });
});

//param:orderId,接单者确认完成某条订单
router.post('/receiverConfirmOrder',function (req,res,next) {
    var resData = new RestResult();
    var param = req.body;
    OrderModel.findOne({_id:param.orderId},function (err,doc) {
        if(err){
            resData.code = 5;
            resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
            res.send(resData);
        }
        else{
            if(doc.orderConfirm){//订单者也确认完成
                OrderModel.updateOne({_id:param.orderId},{$set:{receiveConfirm:true,status: 3}},function (err,doc) {
                    if(err){
                        resData.code = 5;
                        resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
                        res.send(resData);
                    }
                    else{
                        resData.code = 0;
                        resData.returnValue = "完成订单！";
                        res.send(resData);
                    }
                })
            }
            else{
                OrderModel.updateOne({_id:param.orderId},{$set:{receiveConfirm:true}},function (err,doc) {
                    if (err) {
                        resData.code = 5;
                        resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
                        res.send(resData);
                    }
                    else {
                        resData.code = 0;
                        resData.returnValue = "更新完成订单记录成功！";
                        res.send(resData);
                    }
                });
            }
        }
    });
});


//按照noticeId,获取该notice的详情
router.post('/getNoticeDetail',function (req,res,next) {
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
            resData.code = 0;
            resData.returnValue = docs;
            res.send(resData);
        }
        else{
            resData.code = 2;
            resData.errorReason = "该公告还没有人预定";
            res.send(resData);
        }
    });
});

//param：orderId,接单者拒绝接单
router.post('/refuceTakeOrder',function (req,res,next) {
    var resData = new RestResult();
    var param = req.body;
    var orderId = param.orderId;
    OrderModel.updateOne({_id:orderId},{$set:{status:6}},function (err,doc) {
        if (err) {
            resData.code = 5;
            resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
            res.send(resData);
        }
        else {
            resData.code = 0;
            resData.returnValue = "拒绝接单成功！";
            res.send(resData);
        }
    });
});

//param：orderId,接单者确认接单
router.post('/confirmTakeOrder',function (req,res,next) {
    var resData = new RestResult();
    var param = req.body;
    var orderId = param.orderId;
    OrderModel.updateOne({_id:orderId},{$set:{status:0}},function (err,doc) {
        if (err) {
            resData.code = 5;
            resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
            res.send(resData);
        }
        else {
            resData.code = 0;
            resData.returnValue = "接单成功！";
            res.send(resData);
        }
    });
});


//param：noticeId,查看有没有未处理的与该待命公告有关的预定信息，即该待命公告是否可以删除
router.post('/getIsAllDeal',function (req,res,next) {
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
            var IsAllDeal = true;
            for(var i=0;i<docs.length;i++){
                if(docs[i].status==4){
                    IsAllDeal = false;
                    break;
                }
            }
            if(IsAllDeal){
                resData.code = 0;
                resData.returnValue = {IsAllDeal : true};
                res.send(resData);
            }
            else {
                resData.code = 0;
                resData.returnValue = {IsAllDeal: false};
                res.send(resData);
            }
        }
        else{
            resData.code = 0;
            resData.returnValue = {IsAllDeal: true};
            res.send(resData);
        }
    });
});



module.exports = router;