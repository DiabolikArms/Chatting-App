const mongoose = require("mongoose");

const audioCallSchema = new mongoose.Schema({
  participants: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Declined'], // Add possible status values
        default: 'Pending'
      }
    },
  ],
  from: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  to: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  verdict: {
    type: String,
    enum: ["Accepted", "Denied", "Missed", "Busy"],
  },
  status: {
    type: String,
    enum: ['Initiated', 'InProgress', 'Completed', 'Ongoing'],
    default: 'Initiated'
  },
  startedAt: {
    type: Date,
    default: Date.now(),
  },
  endedAt: {
    type: Date,
  },
});

const AudioCall = new mongoose.model("AudioCall", audioCallSchema);
module.exports = AudioCall;

//CHANGED THE WHOLE FILE (DO ONE TIME ctrl+z TO REVERT BACK TO CORRECT ONE)