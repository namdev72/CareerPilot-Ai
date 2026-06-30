import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import tokenBlackListModel from "../models/blacklist.model.js";

async function registerUserController(req, res) {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide the username , email , password" });
  }
  //checking if user exit with this
  const isUserAlreadyExit = await userModel.findOne({
    $or: [{ username }, { email }],
  });
  if (isUserAlreadyExit) {
    return res
      .status(400)
      .json({ message: "Account already exists with this email or username" });
  }
  //before registering the we hash the password
  const hash = await bcrypt.hash(password, 10);

  //creating the user with this hash password
  const user = await userModel.create({
    username,
    email,
    password: hash,
  });

  //method to generate access and refresh token for user we created///
  //generaly we generte the token in user model
  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );

  // send the token in cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  //respone user registerted
  res.status(201).json({
    message: "User is Registerd Successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}

async function loginUserController(req, res) {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid email or password" });
  }
  //checking the password user entered
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: "Inavlid email or password" });
  }
  //if password correct then generate token
  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );
  // set token in cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  res.status(200).json({
    message: "User is logedin successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}

async function logoutUserController(req, res) {
  const token = req.cookies?.token;
  if (token) {
    await tokenBlackListModel.create({ token });
  }
  res.clearCookie("token");
  res.status(200).json({
    message: "user is logout successfully",
  });
}

async function getMeController(req,res){
    const user = await userModel.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
        message: "user fetched successfuly",
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
        },
    });
}

export { registerUserController
    , loginUserController
    , logoutUserController
    , getMeController
 };
