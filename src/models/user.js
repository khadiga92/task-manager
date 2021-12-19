const mongoose = require('mongoose')

const validator = require('validator')

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const multer  = require('multer')
const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('invalid')
            }
        }
    },

    age: {
        type: Number,
        default: 20,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be positive')
            }
        }
    },

    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6
    },

    tokens: [{
        type: String,
        required: true
    }],
    avatar:{
        type:Buffer
    }

})

userSchema.virtual('tasks',{
    //from const Task = mongoose.model('Task',taskSchema)
    ref:'Task',
    localField:"_id",
    foreignField:"owner"
})

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({
        email
    })
    if (!user) {
        throw new Error('No user is found')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    console.log(isMatch)
    if (!isMatch) {
        throw new Error('Unable to login')
    }
    return user
}

userSchema.pre('save', async function (next) {
    const user = this
    console.log(user)
    if (user.isModified('password'))
        user.password = await bcrypt.hash(user.password, 8)
    next()
})

userSchema.methods.generateToken = async function () {
    const user = this
    const token = jwt.sign({
        _id: user._id.toString()
    },process.env.JWT_SECRET)
    user.tokens = user.tokens.concat(token)
    await user.save()
    return token
}

userSchema.methods.toJson = function(){
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    return userObject
}


const User = mongoose.model('User', userSchema)

module.exports = User