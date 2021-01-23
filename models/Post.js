const mongoose = require('mongoose')
const Schema = mongoose.Schema
const PostSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'categories'
  },
  title: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'public'
    },
    lastEdited: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    },
    allowComments: {
      type: Boolean,
      required: true
    },
    body: {
      type: String,
      required: true
    },
    file: {
      type: String
    },
    date: {
      type: Date,
      default: Date.now()
      },
      comments: [{
        type: Schema.Types.ObjectId,
        ref: 'comments'
      }]
    }, {
      usePushEach: true
    })
  module.exports = mongoose.model('posts', PostSchema)