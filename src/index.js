const express = require('express')
require('dotenv').config()
const multer  = require('multer')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
require('./db/mongoose')

const app = express()

app.use(express.json())

// const port = process.env.port || 3000
const port = process.env.PORT

app.use(userRouter)
app.use(taskRouter)

/// const main = async () =>{
//     const user = await User.findById('')
//     await user.populate('tasks')
//     console.log(user.tasks)
// }
// main()

app.listen(port,()=>{
    console.log('server is running')
})