const AudioCall = require("../models/audioCall");
const FriendRequest = require("../models/friendRequest");
const User = require("../models/user");
const VideoCall = require("../models/videoCall");
const catchAsync = require("../utils/catchAsync");
const filterObj = require("../utils/filterObj");
const mongoose = require('mongoose');

const { generateToken04 } = require("./zegoServerAssistant");

// Please change appID to your appId, appid is a number
// Example: 1234567890
const appID = process.env.ZEGO_APP_ID; // type: number

// Please change serverSecret to your serverSecret, serverSecret is string
// Example：'sdfsdfsd323sdfsdf'
const serverSecret = process.env.ZEGO_SERVER_SECRET; // type: 32 byte length string

exports.getMe = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: "success",
    data: req.user,
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(
    req.body,
    "firstName",
    "lastName",
    "about",
    "avatar"
  );

  const userDoc = await User.findByIdAndUpdate(req.user._id, filteredBody);

  res.status(200).json({
    status: "success",
    data: userDoc,
    message: "User Updated successfully",
  });
});

exports.getUsers = catchAsync(async (req, res, next) => {
  const all_users = await User.find({
    verified: true,
  }).select("firstName lastName _id");

  const this_user = req.user;

  const remaining_users = all_users.filter(
    (user) =>
      !this_user.friends.includes(user._id) &&
      user._id.toString() !== req.user._id.toString()
  );

  res.status(200).json({
    status: "success",
    data: remaining_users,
    message: "Users found successfully!",
  });
});

exports.getAllVerifiedUsers = catchAsync(async (req, res, next) => {
  const all_users = await User.find({
    verified: true,
  }).select("firstName lastName _id");

  const remaining_users = all_users.filter(
    (user) => user._id.toString() !== req.user._id.toString()
  );

  res.status(200).json({
    status: "success",
    data: remaining_users,
    message: "Users found successfully!",
  });
});

exports.getRequests = catchAsync(async (req, res, next) => {
  const requests = await FriendRequest.find({ recipient: req.user._id })
    .populate("sender")
    .select("_id firstName lastName");

  res.status(200).json({
    status: "success",
    data: requests,
    message: "Requests found successfully!",
  });
});

exports.getFriends = catchAsync(async (req, res, next) => {
  const this_user = await User.findById(req.user._id).populate(
    "friends",
    "_id firstName lastName"
  );
  res.status(200).json({
    status: "success",
    data: this_user.friends,
    message: "Friends found successfully!",
  });
});

/**
 * Authorization authentication token generation
 */

exports.generateZegoToken = catchAsync(async (req, res, next) => {
  try {
    const { userId, room_id } = req.body;

    console.log(userId, room_id, "from generate zego token");

    const effectiveTimeInSeconds = 3600; //type: number; unit: s; token expiration time, unit: second
    const payloadObject = {
      room_id, // Please modify to the user's roomID
      // The token generated allows loginRoom (login room) action
      // The token generated in this example allows publishStream (push stream) action
      privilege: {
        1: 1, // loginRoom: 1 pass , 0 not pass
        2: 1, // publishStream: 1 pass , 0 not pass
      },
      stream_id_list: null,
    }; //
    const payload = JSON.stringify(payloadObject);
    // Build token
    const token = generateToken04(
      appID * 1, // APP ID NEEDS TO BE A NUMBER
      userId,
      serverSecret,
      effectiveTimeInSeconds,
      payload
    );
    res.status(200).json({
      status: "success",
      message: "Token generated successfully",
      token,
    });
  } catch (err) {
    console.log(err);
  }
});

exports.startAudioCall = catchAsync(async (req, res, next) => {
  const from = req.user._id;
  const to = req.body.id;

  const from_user = await User.findById(from);
  const to_user = await User.findById(to);

  // Update audio call status for participants
  const audioCall = await AudioCall.create({
    participants: [
      { user: mongoose.Types.ObjectId(from), status: 'Accepted' },
      { user: mongoose.Types.ObjectId(to), status: 'Pending' },
    ],
    from,
    to,
    status: 'Initiated',
  });
  

  // Emit 'audioCall:initiate' event to the recipient when starting an audio call
  io.to(to).emit('audioCall:initiate', {
    callId: audioCall._id,
    from: from_user,
  });

  // Send necessary data to the client
  res.status(200).json({
    data: {
      from: from_user,
      roomID: audioCall._id,
      streamID: to,
      userID: from,
      userName: from_user.firstName,
    },
  });
});

exports.startVideoCall = catchAsync(async (req, res, next) => {
  const from = req.user._id;
  const to = req.body.id;

  const from_user = await User.findById(from);
  const to_user = await User.findById(to);

  // Update video call status for participants
  const videoCall = await VideoCall.create({
    participants: [
      { user: from, status: 'Accepted' },
      { user: to, status: 'Pending' }, // Initially set to pending for the recipient
    ],
    from,
    to,
    status: 'Initiated',
  });

  // Emit 'videoCall:initiate' event to the recipient when starting a video call
  io.to(to).emit('videoCall:initiate', {
    callId: videoCall._id,
    from: from_user,
  });

  // Send necessary data to the client
  res.status(200).json({
    data: {
      from: from_user,
      roomID: videoCall._id,
      streamID: to,
      userID: from,
      userName: from_user.firstName,
    },
  });
});

//CHANGED THE WHOLE FUNCTION (DO FEW TIMES ctrl+z TO REVERT BACK TO CORRECT ONE)


exports.getCallLogs = catchAsync(async (req, res, next) => {
  const user_id = req.user._id;

  const call_logs = [];

  const audio_calls = await AudioCall.find({
    participants: { $all: [user_id] },
  }).populate("from to");

  const video_calls = await VideoCall.find({
    participants: { $all: [user_id] },
  }).populate("from to");

  console.log(audio_calls, video_calls);

  for (let elm of audio_calls) {
    const missed = elm.verdict !== "Accepted";
    if (elm.from._id.toString() === user_id.toString()) {
      const other_user = elm.to;

      // outgoing
      call_logs.push({
        id: elm._id,
        img: other_user.avatar,
        name: other_user.firstName,
        online: true,
        incoming: false,
        missed,
      });
    } else {
      // incoming
      const other_user = elm.from;

      // outgoing
      call_logs.push({
        id: elm._id,
        img: other_user.avatar,
        name: other_user.firstName,
        online: true,
        incoming: false,
        missed,
      });
    }
  }

  for (let element of video_calls) {
    const missed = element.verdict !== "Accepted";
    if (element.from._id.toString() === user_id.toString()) {
      const other_user = element.to;

      // outgoing
      call_logs.push({
        id: element._id,
        img: other_user.avatar,
        name: other_user.firstName,
        online: true,
        incoming: false,
        missed,
      });
    } else {
      // incoming
      const other_user = element.from;

      // outgoing
      call_logs.push({
        id: element._id,
        img: other_user.avatar,
        name: other_user.firstName,
        online: true,
        incoming: false,
        missed,
      });
    }
  }

  res.status(200).json({
    status: "success",
    message: "Call Logs Found successfully!",
    data: call_logs,
  });
});



//ADDING NEW FILES:
exports.acceptAudioCall = catchAsync(async (req, res, next) => {
  const callId = req.body.callId;
  const userId = req.user._id;

  const audioCall = await AudioCall.findById(callId);

  if (!audioCall) {
    return res.status(404).json({
      status: 'error',
      message: 'Audio call not found.',
    });
  }

  // Check if the user is one of the participants in the call
  const participant = audioCall.participants.find((participant) =>
    participant.user.equals(userId)
  );

  if (!participant) {
    return res.status(403).json({
      status: 'error',
      message: 'You are not a participant in this call.',
    });
  }

  // Update the call status to 'Accepted' for the user
  participant.status = 'Accepted';
  await audioCall.save();

  // Emit a 'audioCallAccepted' event to the caller
  global.io.to(audioCall._id).emit('audioCallAccepted', { acceptedUserId: userId });

  res.status(200).json({
    status: 'success',
    message: 'Audio call accepted.',
  });
});


exports.rejectAudioCall = catchAsync(async (req, res, next) => {
  const callId = req.body.callId;
  const userId = req.user._id;

  const audioCall = await AudioCall.findById(callId);

  if (!audioCall) {
    return res.status(404).json({
      status: 'error',
      message: 'Audio call not found.',
    });
  }

  // Check if the user is one of the participants in the call
  const participant = audioCall.participants.find((participant) =>
    participant.user.equals(userId)
  );

  if (!participant) {
    return res.status(403).json({
      status: 'error',
      message: 'You are not a participant in this call.',
    });
  }

  // Update the call status to 'Rejected' for the user
  participant.status = 'Rejected';
  await audioCall.save();

  res.status(200).json({
    status: 'success',
    message: 'Audio call rejected.',
  });
});


exports.acceptVideoCall = catchAsync(async (req, res, next) => {
  const callId = req.body.callId;
  const userId = req.user._id;

  const videoCall = await VideoCall.findById(callId);

  if (!videoCall) {
    return res.status(404).json({
      status: 'error',
      message: 'Video call not found.',
    });
  }

  // Check if the user is one of the participants in the call
  const participant = videoCall.participants.find((participant) =>
    participant.user.equals(userId)
  );

  if (!participant) {
    return res.status(403).json({
      status: 'error',
      message: 'You are not a participant in this call.',
    });
  }

  // Update the call status to 'Accepted' for the user
  participant.status = 'Accepted';
  await videoCall.save();

  res.status(200).json({
    status: 'success',
    message: 'Video call accepted.',
  });
});

exports.rejectVideoCall = catchAsync(async (req, res, next) => {
  const callId = req.body.callId;
  const userId = req.user._id;

  const videoCall = await VideoCall.findById(callId);

  if (!videoCall) {
    return res.status(404).json({
      status: 'error',
      message: 'Video call not found.',
    });
  }

  // Check if the user is one of the participants in the call
  const participant = videoCall.participants.find((participant) =>
    participant.user.equals(userId)
  );

  if (!participant) {
    return res.status(403).json({
      status: 'error',
      message: 'You are not a participant in this call.',
    });
  }

  // Update the call status to 'Rejected' for the user
  participant.status = 'Rejected';
  await videoCall.save();

  res.status(200).json({
    status: 'success',
    message: 'Video call rejected.',
  });
});

