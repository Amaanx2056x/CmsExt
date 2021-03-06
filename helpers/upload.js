const path = require('path')
const cloudinary = require("cloudinary").v2;
require('./cloudConf')
module.exports = {
  uploadsDir: path.join(__dirname, '../public/uploads/'),
  isEmpty: function (obj) {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        return false
      }
    }
    return true
  },
  UploadImage: async function  UploadImage(image) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(image, (err, resUrl)=> {
        if (err) return reject(err);
        return resolve(resUrl)
      });

    })
  }
}