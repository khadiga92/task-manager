const express = require('express')
const Task = require('../models/task')
const router = new express.Router()
const auth = require('../middelware/auth')



router.post('/task',auth,async(req,res)=>{
    try{
        const task = new Task({...req.body,owner:req.user._id})
        await task.save()
        res.status(201).send(task)
    }
    catch(e){
        res.status(400).send(e.message)
    }
})

router.get('/task',auth,async(req,res)=>{
    try{
        //const tasks = await Task.find({})
        await req.user.populate('tasks')
        res.send(req.user.tasks)
    }
    catch(e){
        res.status(500).send(e.message)
    }
})

router.get('/task/:id',auth,async(req,res)=>{
    try{
        const _id = req.params.id
        // 
        const task = await Task.findOne({_id,owner:req.user._id})
        if(!task){
            return res.status(404).send('Unable to find task')
        }
        res.status(200).send(task)
    }
    catch(e){
        res.status(500).send(e.message)
    }
})



router.patch('/task/:id',auth,async(req,res)=>{
    console.log(req.user)
    try{
        const updates = Object.keys(req.body)
        const allowedUpdates = ['description','completed']
        const isValid = updates.every((update)=> allowedUpdates.includes(update))
        //console.log(isValid)
        if(!isValid){
            return res.status(400).send("can't update")
        }
        const _id = req.params.id
        //console.log(updates)
        const task = await Task.findOne({_id,owner:req.user._id})
        if(!task){
            return res.status(404).send("No task is found")
        }
        updates.forEach((update)=>task[update]= req.body[update])
        await task.save()
        res.status(200).send(task)
    }
    catch(e){
        res.status(200).send(e.message)
    }
    
})

router.delete('/task/:id',auth,async(req,res)=>{
    try{
        const _id = req.params.id
        const task = await Task.findOneAndDelete({_id,owner:req.user._id})
        if(!task){
            return res.status(404).send('No task is found')
        }
        res.status(200).send(task)
    }
    catch(error){
        res.status(500).send(error.message)
    }
})

module.exports = router