var mongoose = require("../db/mongodb").mongoose;
var ObjectId = mongoose.Schema.Types.ObjectId;
var MessageSchema = new mongoose.Schema({
    fromUserId:ObjectId,
    toUserId:ObjectId,
    content:String,
    date:Date,
    fromHaveRead:{type:Boolean,default:true},
    toHaveRead:{type:Boolean,default:false},
    fromDelete:{type:Boolean,default:false},
    toDelete:{type:Boolean,default:false}
});

var MessageModel = mongoose.model('Message', MessageSchema);

exports.MessageModel = MessageModel;