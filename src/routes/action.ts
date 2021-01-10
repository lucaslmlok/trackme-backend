import express from "express";
import { body } from "express-validator";

import * as actionController from "../controllers/action";
import { isActionType } from "../entity/Action";
import isAuth from "../middlewares/isAuth";

const router = express.Router();

const actionValidators = [
  body("name").trim().not().isEmpty(),
  body("type")
    .trim()
    .custom((type: string) => {
      if (!isActionType(type)) {
        throw new Error("Invalid action type.");
      }
      return true;
    }),
  body("target").trim().isInt(),
  body("unit").trim().not().isEmpty(),
  body("increment").trim().isInt(),
  body("color").trim().not().isEmpty(),
  body("icon").trim().not().isEmpty(),
  body("startDate").trim().not().isEmpty(),
  body("endDate").trim(),
  body("weekdays").isArray({ max: 7 }),
];

router.get("/", isAuth, actionController.getActions);

router.post("/", isAuth, actionValidators, actionController.createAction);

router.put(
  "/",
  isAuth,
  [body("id").trim().not().isEmpty(), ...actionValidators],
  actionController.updateAction
);

router.delete(
  "/",
  isAuth,
  [body("ids").isArray()],
  actionController.deleteAction
);

export default router;
