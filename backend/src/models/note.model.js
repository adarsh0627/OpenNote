const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title: {
        type: String, 
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    tags: {
        type:[String], 
        required:true,
    },
    price: {
        type:Number, 
        required:true,
        min: 0,
    },
    thumbnail: {
        type:String, 
        required:true
    },
    file: {
        type:String, 
        required:true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
},{
    timestamps:true,
});

module.exports = mongoose.model('Note', noteSchema);