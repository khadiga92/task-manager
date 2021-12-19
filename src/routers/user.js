//1
const express = require('express')
const res = require('express/lib/response')
//2
const router = new express.Router()

const User = require('../models/user')
const auth = require('../middelware/auth')
const req = require('express/lib/request')
const multer  = require('multer')

// router.post('/users',(req,res)=>{
//     const user = new User(req.body)
//     user.save().then(()=>{
//         res.status(200).send(user)
//     }).catch((error)=>{
//         res.status(400).send(error)
//     })
// })

router.post('/users',async(req,res) =>{
    try{
        const user = new User(req.body)
        const token = await user.generateToken()
        // await user.save()
        res.status(200).send({user,token})
    }
    catch(error){
        res.status(400).send(error.message)
    }
})

router.post('/login',async(req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateToken()
        res.status(200).send({user,token})
    }catch(error){
        res.status(500).send(error.message)
    }
})

router.get('/users',auth,(req,res)=>{
    User.find({}).then((users)=>{
        res.status(200).send(users)
    }).catch((e)=>{
        res.status(500).send(e)
    })
})

router.get('/profile',auth,(req,res)=>{
    res.send(req.user)
})

router.get('/users/:id',auth,(req,res)=>{
    const _id = req.params.id
    User.findById(_id).then((user)=>{
        if(!user){
            return res.status(404).send('Unable to find user')
        }
        res.status(200).send(user)
    }).catch((error)=>{
        res.status(500).send(error)
    })
})

router.delete('/logout',auth,async(req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((el)=>{
            return el !== req.token
        })
        await req.user.save()
        res.status(200).send('Logout successfully')
    }catch(e){
        res.status(500).send(e.message)
    }
})

router.delete('/logoutall',auth,async(req,res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.status(200).send('Logout all success')

    }
    catch(e){
        res.status(500).send(e.message)
    }
})

// router.patch('/users/:id',async(req,res)=>{
//     const updates = Object.keys(req.body)
//     const allowedUpdates = ['name','age','password']
//     let isValid = updates.every((el)=> allowedUpdates.includes(el))
//     console.log(isValid)
//     if(!isValid){
//         return res.status(400).send("can't update")
//     }
//     console.log(updates)
//     try{
//         const _id = req.params.id
//         const user = await User.findByIdAndUpdate(_id,req.body,{
//             new:true,
//             runValidators:true
//         })
//         if(!user){
//             return res.status(404).send('No user is found')
//         }
//         res.status(200).send(user)
//     }
//     catch(error){
//         res.status(500).send(error.message)
//     }
// })


router.patch('/users/:id',auth,async(req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name','age','password']
    let isValid = updates.every((el)=> allowedUpdates.includes(el))
    console.log(isValid)
    if(!isValid){
        return res.status(400).send("can't update")
    }
    console.log(updates)
    try{
        const _id = req.params.id
        const user = await User.findById(_id)
        if(!user){
            return res.status(404).send('No user is found')
        }
        updates.forEach((el)=>(user[el]= req.body[el]))
        await user.save()
        res.status(200).send(user)
    }
    catch(error){
        res.status(500).send(error.message)
    }
})

router.delete('/users/:id',auth, async(req,res)=>{
    try{
        const _id = req.params.id
        const user = await User.findByIdAndDelete(_id)
        if(!user){
            return res.status(404).send('No user is found')
        }
        res.status(200).send(user)
    }
    catch(error){
        res.status(500).send(error)
    }
})

const uploads = multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png|jfif)$/)){
            cb(new Error('Please upload image'))
        }
        cb(null,true)
    }
})

router.post('/profile/avatar',auth,uploads.single('avatar'),async(req,res)=>{
    try {
        req.user.avatar = req.file.buffer
        await req.user.save()
        res.status(200).send()
    } catch (error) {
        res.status(400).send(error)
    }
})
module.exports = router