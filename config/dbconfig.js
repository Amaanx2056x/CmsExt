const mongoose = require('mongoose')
mongoose.connect(process.env.DB_URL, {
  useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true
})
/*mongoose.connect('mongodb://localhost:27017/test000x', {
  useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true
})*/
.then((db)=> {
  console.log('Connected!')
}).catch((e)=> {
  console.log('Error', e)
})