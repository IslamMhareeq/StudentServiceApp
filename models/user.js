var mongoose = require('mongoose');
var Schema = mongoose.Schema;

userSchema = new Schema( {
	
	unique_id: Number,
	email: String,
	username: String,
	password: String,
	passwordConf: String,
	role: String,
	isVerified: { type: Boolean, default: false },
	resetPasswordToken: String,
	resetPasswordExpires: Date,
	isAdmin: { type: Boolean, default: false }, 

	

},{ timestamps: true }),
User = mongoose.model('User', userSchema);

module.exports = User;

