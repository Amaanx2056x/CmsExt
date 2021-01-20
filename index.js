//projecr added to GIT
require('./config/dbconfig')
const express = require('express')
const path = require('path')
const hbs = require('hbs')
const bodyParser = require('body-parser')
const upload = require('express-fileupload')
const methodOverride = require('method-override')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')



const port = process.env.PORT || 2000
const app = express()

app.use(upload())
app.use(express.static(path.join(__dirname, './public')))
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())
app.use(methodOverride('_method'))



const {
  select,
  dateFormat,
  paginate,
  counter,
  readmore,
  StrEqual
} = require('./helpers/utils')
app.set('views', path.join(__dirname, './views'))
app.set('view engine', 'hbs')
hbs.registerPartials(__dirname + '/views/partials');
hbs.registerHelper('select', select)
hbs.registerHelper('dateFormat', dateFormat)
hbs.registerHelper('paginate', paginate)
hbs.registerHelper('counter', counter)
hbs.registerHelper('readmore', readmore)
hbs.registerHelper('StrEqual', StrEqual)

app.use(session({
  secret: 'thisiscms',
  resave: true,
  saveUninitialized: true
}))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())

app.use((req, res, next)=> {
  res.locals.user = req.user || null
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.error = req.flash('error')
  next()
})


const home = require('./routes/home/main')
const admin = require('./routes/admin/main')
const posts = require('./routes/admin/posts')
const categories = require('./routes/admin/categories')
const comments = require('./routes/admin/comments')
app.use('/', home)
app.use('/admin', admin)
app.use('/admin/posts', posts)
app.use('/admin/categories', categories)
app.use('/admin/comments', comments)


app.listen(port, ()=> {
  console.log(`Server is up and running on port ${port}`)
})