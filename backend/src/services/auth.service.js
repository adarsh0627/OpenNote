const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "15m" }
  );

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d" }
  );

  return { accessToken, refreshToken };
};

exports.registerUser = async ({ userName, email, password, education }) => {
  email = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("An account with this email already exists");

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    userName: userName.trim(),
    email,
    password: hashedPassword,
    education: education?.trim(),
  });

  const { accessToken, refreshToken } = generateTokens(user._id);

  await User.findByIdAndUpdate(user._id, {
    $push: { refreshTokens: refreshToken },
  });

  return { user, accessToken, refreshToken };
};

exports.loginUser = async ({ email, password }) => {
  email = email.toLowerCase().trim();

  const user = await User.findOne({ email }).select("+password +refreshTokens");
  if (!user) throw new Error("Invalid email or password");

  if (!user.isActive) throw new Error("Account has been deactivated");

  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) throw new Error("Invalid email or password");

  const { accessToken, refreshToken } = generateTokens(user._id);

  let tokens = user.refreshTokens || [];
  if (tokens.length >= 5) tokens = tokens.slice(-4);
  tokens.push(refreshToken);

  await User.findByIdAndUpdate(user._id, { refreshTokens: tokens });

  return { user, accessToken, refreshToken };
};

exports.refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) throw new Error("Refresh token required");

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new Error("Invalid or expired refresh token");
  }

  const user = await User.findById(decoded.id).select("+refreshTokens");
  if (!user) throw new Error("User not found");

  const tokenIndex = user.refreshTokens.indexOf(refreshToken);
  if (tokenIndex === -1) throw new Error("Refresh token revoked");

  const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
  user.refreshTokens[tokenIndex] = newRefreshToken;
  await user.save();

  return { accessToken, refreshToken: newRefreshToken };
};

exports.logoutUser = async (userId, refreshToken) => {
  await User.findByIdAndUpdate(userId, {
    $pull: { refreshTokens: refreshToken },
  });
};