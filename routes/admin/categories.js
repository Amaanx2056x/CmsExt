const express=require('express')
const Category=require('../../models/Category')
const Post=require('../../models/Post')
const {isEmpty,uploadsDir}=require('../../helpers/upload')
const fs=require('fs')
const {userAuth}=require('../../helpers/auth')
const router=express.Router()


router.all('/*', userAuth,(req,res,next)=>{
  next()
})
router.get('/',(req,res)=>{
    Category.find({}).then((categories)=>{
      if (categories.length==0){
        res.render('layouts/admin/categories/allcategories',{message: "No categories available, Please create one."})
      }
      else{
  res.render('layouts/admin/categories/allcategories',{categories})
      }
  })
})

router.post('/create',(req,res)=>{
  if(req.body.name.trim().length<=0){
    req.flash('error_msg','Category name cannot be Empty!')
    res.redirect('/admin/categories/')
  }else{
  const newCategory=new Category({
    name:req.body.name
  })
  newCategory.save().then((saved)=>{
    req.flash('success_msg',`Category ${saved.name} was created successfully!`)
    res.redirect('/admin/categories/')
  }).catch((e)=>{
    req.flash('error_msg',`Unknown error while creating category!`)
    res.redirect('/admin/categories/')
  })
  }
})

router.get('/update/:id',(req,res)=>{
    Category.findOne({_id:req.params.id}).then((category)=>{
  res.render('layouts/admin/categories/update',{category})
  })
})

router.put('/update/:id',(req, res)=>{
  Category.findOne({_id:req.params.id}).then((category)=>{
    if(req.body.name.trim().length<=0){
    req.flash('error_msg','Category name cannot be Empty!')
    res.redirect('/admin/categories/')
    }
    else{
    category.name=req.body.name
    category.save().then((saved)=>{
      req.flash('success_msg',`Category ${category.name} was updated successfully!`)
    res.redirect('/admin/categories/')
    }).catch((e)=>{
      req.flash('error_msg',`Unknown error while creating category!`)
      res.redirect('/admin/categories/')
    })
    }
  })
})

router.delete('/:id',(req, res)=>{
  Category.findOne({_id:req.params.id}).then((category)=>{
    Post.find({category: req.params.id})
    .populate({path: 'comments', populate: {path: 'user',models: 'users'}})
    .populate('user')
    .then((posts)=>{
        posts.forEach((post)=>{
        fs.unlink(uploadsDir + post.file ,(err)=>{
        if(post.comments.length>0){
        post.comments.forEach((comment)=>{
          comment.deleteOne()
        })
      }
          post.deleteOne()
        })
      })
      })
      category.deleteOne()
      req.flash('success_msg',`Category ${category.name} was deleted successfully!`)
      res.redirect('/admin/categories/')
    })
  })
  

module.exports=router