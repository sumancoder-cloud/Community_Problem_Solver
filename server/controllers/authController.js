import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Problem from "../models/Problem.js";
import Solution from "../models/Solution.js";
import Discussion from "../models/Discussion.js";
import { sendOTP, verifyOTP } from '../utils/otp.js'


export const register = async (req, res) => {
    try {
        const {name, email, password, city} = req.body;
        if(!name || !email || !password) {
            return res.status(400).json({message : "All fields are mandatory"})
        }
        const existinguser = await User.findOne({email})
        if(existinguser) {
            return res.status(400).json({message : "User already exists. Try logging in"})
        }
        const salt=await bcrypt.genSalt(10);
        const hashedpassword = await bcrypt.hash(password,salt);
        const newuser = new User({name, email, password : hashedpassword, city: city || "", role: "user", volunteerStatus: "none"})
        await newuser.save()

        const result = await sendOTP(email);

        if (!result.sent) {
            await User.deleteOne({ _id: newuser._id });
            return res.status(503).json({ message: "Unable to send OTP email. Please check mail settings and try again." });
        }

        return res.status(201).json({
            message : "User registered successfully. OTP sent to your email.",
            user : { id: newuser._id, name: newuser.name, email: newuser.email, role: newuser.role, city: newuser.city, volunteerStatus: newuser.volunteerStatus },
            otpSent: result.sent
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({message : "Internal server Error"})
    }
}

export const login = async (req, res) => {
    try {
        const {email, password} = req.body;
        if(!email || !password) {
            return res.status(400).json({message : "Both Email and password are required"});
        }
        const user = await User.findOne({email});
        if(!user) {
            return res.status(404).json({message : "User not Found. Try registering"})
        }
        if(!await bcrypt.compare(password, user.password)) {
            return res.status(400).json({message : "Invalid password"})
        }

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

        return res.status(200).json({
            message : "Login successful",
            user: { id: user._id, name: user.name, email: user.email, role: user.role, city: user.city, volunteerStatus: user.volunteerStatus },
            token
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({message : "Internal server Error"})
    }
}

export const verifyLoginOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }

        const otpResult = await verifyOTP(email, otp);
        if (!otpResult.valid) {
            return res.status(400).json({ message: otpResult.message });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

        return res.status(200).json({
            message: "Login successful",
            user: { id: user._id, name: user.name, email: user.email, role: user.role, city: user.city, volunteerStatus: user.volunteerStatus },
            token
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server Error" });
    }
};

export const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        const result = await sendOTP(email);

        if (!result.sent) {
            return res.status(503).json({ message: "Unable to send OTP email. Please check mail settings and try again." });
        }

        return res.status(200).json({
            message: "OTP sent successfully",
            otpSent: result.sent
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server Error" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { id } = req.user;
        const { name, email, city } = req.body;

        if (!name && !email && !city) {
            return res.status(400).json({ message: "At least one field is required to update" });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: "Email already in use" });
            }
            user.email = email;
        }

        if (name) {
            user.name = name;
        }

        if (city !== undefined) {
            user.city = city || "";
        }

        await user.save();

        return res.status(200).json({
            message: "Profile updated successfully",
            user: { id: user._id, name: user.name, email: user.email, role: user.role, city: user.city, volunteerStatus: user.volunteerStatus }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server Error" });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("name email role city volunteerStatus");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "User profile fetched",
            user: { id: user._id, name: user.name, email: user.email, role: user.role, city: user.city, volunteerStatus: user.volunteerStatus }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server Error" });
    }
};

export const getProfileStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [problems, solutions, discussions] = await Promise.all([
      Problem.find({ user: userId }),
      Solution.find({ user: userId }),
      Discussion.find({ user: userId }),
    ]);

    const totalProblems = problems.length;
    const activeSolutions = solutions.length;

    const totalVotes = solutions.reduce(
      (sum, sol) => sum + (sol.votes || 0),
      0
    );

    const discussionsMade = discussions.length;

    res.json({
      totalProblems,
      activeSolutions,
      totalVotes,
      discussionsMade,
      contributions: totalProblems + activeSolutions,
    });

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile stats" });
  }
};

export const registerVolunteer = async (req, res) => {
    try {
        const { name, email, password, city } = req.body;
        if (!name || !email || !password || !city) {
            return res.status(400).json({ message: "Name, email, password, and city are mandatory" });
        }

        const existinguser = await User.findOne({ email });
        if (existinguser) {
            return res.status(400).json({ message: "User already exists. Please log in and apply as a volunteer." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedpassword = await bcrypt.hash(password, salt);
        const newuser = new User({
            name,
            email,
            password: hashedpassword,
            role: "user",
            volunteerStatus: "pending",
            city
        });

        await newuser.save();

        const result = await sendOTP(email);
        if (!result.sent) {
            await User.deleteOne({ _id: newuser._id });
            return res.status(503).json({ message: "Unable to send OTP email. Please check mail settings and try again." });
        }

        return res.status(201).json({
            message: "Volunteer application submitted. OTP sent to your email.",
            user: {
                id: newuser._id,
                name: newuser.name,
                email: newuser.email,
                role: newuser.role,
                city: newuser.city,
                volunteerStatus: newuser.volunteerStatus
            },
            otpSent: result.sent
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server Error" });
    }
};

export const applyVolunteerForExistingUser = async (req, res) => {
    try {
        const { city } = req.body;
        if (!city) {
            return res.status(400).json({ message: "State is required" });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role === "volunteer" && user.volunteerStatus === "approved") {
            return res.status(400).json({ message: "You are already an approved volunteer" });
        }

        if (user.volunteerStatus === "pending") {
            return res.status(400).json({ message: "Your volunteer application is already pending" });
        }

        user.volunteerStatus = "pending";
        user.city = city;
        await user.save();

        return res.status(200).json({
            message: "Volunteer application submitted",
            user: { id: user._id, name: user.name, email: user.email, role: user.role, city: user.city, volunteerStatus: user.volunteerStatus }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server Error" });
    }
};
