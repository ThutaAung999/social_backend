import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const ResetTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    // required: true,// this field does not require because of Date.now
    //expires: 3600, // 1 hour expiration (Optional)s
  },
});
/* 
ResetTokenSchema.pre("save" , async function(next){
          const salt = await bcrypt.genSalt(10);
          if(this.isModified("token")){
                    const hash = await bcrypt.hash(this.token , salt);
                    this.token = hash
          }
          next();
})*/

ResetTokenSchema.pre('save', async function (next) {
  if (!this.isModified('token')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.token = await bcrypt.hash(this.token, salt);
    next();
  } catch (error) {
    next(error);
  }
});
export default mongoose.model('ResetToken', ResetTokenSchema);
