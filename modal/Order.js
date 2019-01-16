var mongoose = require("../db/mongodb").mongoose;
var ObjectId = mongoose.Schema.Types.ObjectId;

var OrderSchema = new mongoose.Schema({
    rewardMoney:Number,//赏金
    content:String,//订单内容
    date: { type: Date, default: Date.now},//接单时间
    orderUserId:ObjectId,//订单者信息
    orderAvatarUrl:String,
    orderNickName:String,
    orderConfirmDelete:{type:Boolean,default:false},//订单者删除订单
    orderConfirm:{type:Boolean,default:false},//订单者确认完成订单  false 表示未完成
    receiveUserId:ObjectId,//接单者信息
    receiveAvatarUrl:String,
    receiveNickName:String,
    receiveConfirmDelete:{type:Boolean,default:false},//接单者删除订单
    receiveConfirm:{type:Boolean,default:false},//接单者确认完成订单
    status:{type:Number,default:0},//订单状态,4:待接单,5:未接单状态时,订单者取消订单,6:接单者拒绝接单,0:服务中,1:接单状态时,订单者取消订单,2:接单状态时,接单者取消订单,3:完成接单
    noticeId:{type:ObjectId,default:null}
});

var OrderModel = mongoose.model('Order', OrderSchema);

exports.OrderModel = OrderModel;