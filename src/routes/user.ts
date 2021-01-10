import express from "express";
import { body } from "express-validator";
import { getRepository } from "typeorm";

import * as userController from "../controllers/user";
import { User } from "../entity/User";
import isAuth from "../middlewares/isAuth";

const router = express.Router();

router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Plase enter a valid email.")
      .normalizeEmail()
      .custom(async (email: string) => {
        const user = await getRepository(User).findOne({ email });
        if (user) return Promise.reject("Email address already exists.");
      }),
    body("password").trim().isLength({ min: 4 }),
    body("firstName").trim().not().isEmpty(),
    body("lastName").trim().not().isEmpty(),
  ],
  userController.signup
);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Plase enter a valid email.")
      .normalizeEmail(),
    body("password").not().isEmpty(),
  ],
  userController.login
);

router.get("/token-login", isAuth, userController.tokenLogin);

router.put(
  "/change-info",
  isAuth,
  [
    body("firstName").trim().not().isEmpty(),
    body("lastName").trim().not().isEmpty(),
  ],
  userController.changeInfo
);

router.put(
  "/change-password",
  isAuth,
  [body("password").trim().isLength({ min: 8 })],
  userController.changePassword
);

export default router;
