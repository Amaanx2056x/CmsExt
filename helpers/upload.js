const path=require('path')
module.exports={
  uploadsDir:path.join(__dirname,'../public/uploads/'),
  isEmpty: function (obj){
    for (let key in obj){
      if(obj.hasOwnProperty(key)){
        return false
      }
    }
    return true
  }
}