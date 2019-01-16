var mongoose = require("../db/mongodb").mongoose;

var UserSchema = new mongoose.Schema({
    openId:String,
    school:String,
    campus:String,
    session_key:String,
    avatarUrl: {type: String,default:null},
    nickName:  {type: String,default:null},
    gender: {type: String,default:null},
    city:{type: String,default:null},
    province:{type: String,default:null},
    country:{type: String,default:null},
    language:{type: String,default:null},
    date: { type: Date, default: Date.now }
});

var UserModel = mongoose.model('User', UserSchema);

exports.UserModel = UserModel;