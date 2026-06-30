import { Router } from "express";
import {loginUserController, registerUserController,logoutUserController,getMeController} from "../controllers/auth.controller.js"
import authUser from "../middlewares/auth.middleware.js";

const authRouter=Router()

/**
 * @route POST /api/auth/register
 * @description register the user
 * @access public
 */

authRouter.route("/register").post(registerUserController)

/**
 * @route POST /api/auth/login
 * @description login the user wiht email and password
 * @access public
 */
authRouter.route("/login").post(loginUserController)

/**
 * @route GET /api/auth/lgout
 * @description logout the user and clear cookie and add to blacklist
 * @access public
 */
authRouter.route("/logout").get(logoutUserController)

/**
 * @route GET /api/auth/get-me
 * @description get the current logged in user details
 * @access private
 */
//middleware check the jsi user me req, ki hai vo authented hai
authRouter.route("/get-me").get(authUser,getMeController)


export default authRouter