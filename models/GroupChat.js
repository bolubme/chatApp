const mongoose = require('mongoose');

const groupChatSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  messages: [
    {
      sender: String,
      message: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});


module.exports = mongoose.model('GroupChat', groupChatSchema);
