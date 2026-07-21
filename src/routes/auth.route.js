import { Router } from "express";
import { getMe, googleCallback, login, register } from "../controllers/auth.controller.js";
import { loginValidator, registerValidator } from "../validators/auth.validator.js";
import { authenticateUser } from "../middleware/auth.middleware.js";
import passport from "passport";
import { config } from "../config/config.js";

const router = Router();

/*
@registerapi : /api/auth/register

*/
router.post("/register",registerValidator,register)
router.post("/login",loginValidator,login)
router.get("/getMe",authenticateUser,getMe)


router.get("/google",passport.authenticate("google",{scope:["profile","email"]}))
router.get("/google/callback",passport.authenticate("google",{session:false, failureRedirect:`${config.FRONTEND_URL}/login`}),

googleCallback)

export default router
