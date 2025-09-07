import mongoose from "mongoose";
import users from "../Modals/Auth.js";
import axios from "axios";
import nodemailer from "nodemailer";
import "dotenv/config"
import history from "../Modals/history.js";
import jwt from "jsonwebtoken";
import "dotenv/config"

// Southern states for email OTP
const southernStates = ["Tamil nadu", "Kerala", "Karnataka", "Andhra", "Telangana"];

// Setup nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Unified login endpoint (Google or normal)
export const login = async (req, res) => {
  const { email, name, image, state, mobile } = req.body;
  if (!email || !state) return res.status(400).json({ message: "Email and state are required" });
  const isSouthern = southernStates.map(s => s.toLowerCase()).includes((state || "").toLowerCase());
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationId = Math.floor(Math.random() * 1000000).toString();
  let otpChannel = isSouthern ? "email" : "mobile";

  try {
    let user = await users.findOne({ email });
    if (!user) {
      user = await users.create({
        email,
        name,
        image,
        state,
        mobile: mobile || null,
        otp,
        verificationId,
        otpChannel,
        otpVerified: false,
      });
      // Fetch the created user to ensure 'user' is always a document instance
      user = await users.findOne({ email });
    } else {
      user.name = name || user.name;
      user.image = image || user.image;
      user.state = state;
      user.mobile = mobile || user.mobile;
      user.otp = otp;
      user.verificationId = verificationId;
      user.otpChannel = otpChannel;
      user.otpVerified = false;
      await user.save();
    }

    if (otpChannel === "email") {
      // Send OTP to email
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP code is: ${otp}`,
        html: `<p>Your OTP code is: <b>${otp}</b></p>`
      });
      return res.status(200).json({
        message: "OTP sent to email. Please verify to complete login.",
        channel: "email",
        email,
        verificationId
      });
    } else {
      // Send OTP to mobile
      if (!mobile) return res.status(400).json({ message: "Mobile number required for OTP." });
      // Send OTP using MessageCentral
      const countryCode = "91";
      const customerId = process.env.MESSAGECENTRAL_CUSTOMER_ID;
      const authToken = process.env.MESSAGECENTRAL_AUTH_TOKEN;
      const flowType = "SMS";
      const result = await axios.post(
        `https://cpaas.messagecentral.com/verification/v3/send?countryCode=${countryCode}&customerId=${customerId}&flowType=${flowType}&mobileNumber=${mobile}`,
        {},
        { headers: { authToken } }
      );
      const verificationId = result.data.data.verificationId;
      //Update in db
        user.verificationId = verificationId;
        await user.save();
      return res.status(200).json({
        message: "OTP sent to mobile. Please verify to complete login.",
        channel: "mobile",
        mobile,
        verificationId
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Resend OTP endpoint
export const resendOtp = async (req, res) => {
  const { email, state, mobile } = req.body;
  if (!email || !state) return res.status(400).json({ message: "Email and state are required" });
  const isSouthern = southernStates.map(s => s.toLowerCase()).includes((state || "").toLowerCase());
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationId = Math.floor(Math.random() * 1000000).toString();
  let otpChannel = isSouthern ? "email" : "mobile";
  try {
    let user = await users.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    user.otp = otp;
    user.verificationId = verificationId;
    user.otpChannel = otpChannel;
    user.state = state;
    user.mobile = mobile || user.mobile;
    user.otpVerified = false;
    await user.save();
    if (otpChannel === "email") {
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: "Your OTP Code (Resent)",
        text: `Your OTP code is: ${otp}`,
        html: `<p>Your OTP code is: <b>${otp}</b></p>`
      });
      return res.status(200).json({
        message: "OTP resent to email.",
        channel: "email",
        email,
        verificationId
      });
    } else {
      if (!mobile && !user.mobile) return res.status(400).json({ message: "Mobile number required for OTP." });
      const countryCode = "91";
      const customerId = process.env.MESSAGECENTRAL_CUSTOMER_ID;
      const authToken = process.env.MESSAGECENTRAL_AUTH_TOKEN;
      const flowType = "SMS";
      const result = await axios.post(
        `https://cpaas.messagecentral.com/verification/v3/send?countryCode=${countryCode}&customerId=${customerId}&flowType=${flowType}&mobileNumber=${user.mobile}`,
        {},
        { headers: { authToken } }
      );
      const verificationId = result.data.data.verificationId;
      user.verificationId = verificationId;
      await user.save();
      return res.status(200).json({
        message: "OTP resent to mobile.",
        channel: "mobile",
        mobile: user.mobile,
        verificationId
      });
    }
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Unified OTP verification endpoint
export const verifyOtp = async (req, res) => {
  const { email, verificationId, otp } = req.body;
  if (!email || !verificationId || !otp) return res.status(400).json({ message: "Email, verificationId, and OTP are required" });
  try {
    const user = await users.findOne({ email, verificationId });
    if (!user) return res.status(404).json({ message: "User or verificationId not found" });
    if (user.otpChannel === "mobile") {
      // Validate OTP via MessageCentral
      if (!user.mobile) return res.status(400).json({ message: "Mobile number not found for user" });
      const countryCode = "91";
      const customerId = process.env.MESSAGECENTRAL_CUSTOMER_ID;
      const authToken = process.env.MESSAGECENTRAL_AUTH_TOKEN;
      const validateUrl = `https://cpaas.messagecentral.com/verification/v3/validateOtp?countryCode=${countryCode}&mobileNumber=${user.mobile}&verificationId=${verificationId}&customerId=${customerId}&code=${otp}`;
      try {
        const response = await axios.get(validateUrl, {
          headers: { authToken }
        });
        const data = response.data;
        if (
          data.responseCode === 200 &&
          data.data &&
          data.data.verificationStatus === "VERIFICATION_COMPLETED"
        ) {
          user.otpVerified = true;
          user.otp = null;
          user.verificationId = null;
          await user.save();
          // Generate JWT
          const token = jwt.sign({
            id: user._id,
            email: user.email,
            name: user.name,
            image: user.image,
            state: user.state,
            mobile: user.mobile
          }, process.env.JWT_SECRET, { expiresIn: "7d" });
          return res.status(200).json({ message: "OTP verified. Login successful.", user, token });
        } else {
          return res.status(400).json({ message: data.data?.errorMessage || "Invalid or expired OTP" });
        }
      } catch (err) {
          console.log(err)
          return res.status(400).json({ message: "OTP verification failed (MessageCentral)" });
      }
    } else {
      // Email OTP flow
      if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
      user.otpVerified = true;
      user.otp = null;
      user.verificationId = null;
      await user.save();
      // Generate JWT
      const token = jwt.sign({
        id: user._id,
        email: user.email,
        name: user.name,
        image: user.image,
        state: user.state,
        mobile: user.mobile
      }, process.env.JWT_SECRET, { expiresIn: "7d" });
      return res.status(200).json({ message: "OTP verified. Login successful.", user, token });
    }
  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateprofile = async (req, res) => {
  const { id: _id } = req.params;
  const { channelname, description } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(500).json({ message: "User unavailable..." });
  }
  try {
    const updatedata = await users.findByIdAndUpdate(
      _id,
      {
        $set: {
          channelname: channelname,
          description: description,
        },
      },
      { new: true }
    );
    return res.status(201).json(updatedata);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Get user usage data
export const getUserUsage = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: "User ID required" });
    const user = await users.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    // Downloads today
    const today = new Date();
    today.setHours(0,0,0,0);
    const downloadsToday = (user.downloads || []).filter(d => {
      const dDate = new Date(d.date);
      dDate.setHours(0,0,0,0);
      return dDate.getTime() === today.getTime();
    }).length;
    // Watch time today (sum from history)
    let watchTimeToday = 0;
    const historyToday = await history.find({ viewer: userId, createdAt: { $gte: today } });
    if (historyToday && historyToday.length > 0) {
      watchTimeToday = historyToday.reduce((sum, h) => sum + (h.watchTime || 0), 0);
    }
    res.json({ downloadsToday, watchTimeToday });
  } catch (error) {
    res.status(500).json({ message: "Error fetching usage" });
  }
};

// Get user by email (for AuthContext refresh)
export const getUserByEmail = async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: "Email is required" });
  try {
    const user = await users.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
