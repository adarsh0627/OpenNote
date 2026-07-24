const {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
} = require("../services/auth.service");
const User = require("../models/user.model");

exports.signUpController = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await registerUser(req.body);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        education: user.education,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.signInController = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await loginUser(req.body);

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        education: user.education,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.refreshTokenController = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await refreshAccessToken(refreshToken);
    res.status(200).json({ success: true, ...tokens });
  } catch (error) {
    next(error);
  }
};

exports.logoutController = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await logoutUser(req.user.id, refreshToken);
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

exports.getProfileController = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password -refreshTokens");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.updateProfileController = async (req, res, next) => {
  try {
    const allowedFields = ["userName", "education"];
    const updates = {};
    allowedFields.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password -refreshTokens");

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};