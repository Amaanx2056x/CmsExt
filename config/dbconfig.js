const mongoose = require('mongoose')
//mongoose.connect('mongodb+srv://cms-admin:cms-admin@cluster0.ao5hu.mongodb.net/cms?retryWrites=true&w=majority',{useUnifiedTopology: true,useNewUrlParser: true, useFindAndModify: false, useCreateIndex:true})
mongoose.connect('mongodb://localhost:27017/test000x', {
  useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true
})
.then((db)=> {
  console.log('Connected!')
}).catch((e)=> {
  console.log('Error')
})