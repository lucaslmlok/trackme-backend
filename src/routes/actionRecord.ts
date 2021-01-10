import express from "express";
import { body } from "express-validator";

import * as actionRecordController from "../controllers/actionRecord";
import { isActionType } from "../entity/Action";
import isAuth from "../middlewares/isAuth";

const router = express.Router();

const actionRecordValidators = [
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
  body("done").trim().isInt(),
  body("color").trim().not().isEmpty(),
  body("icon").trim().not().isEmpty(),
  body("date").trim().not().isEmpty(),
];

router.get("/", isAuth, actionRecordController.getRecords);

router.post(
  "/",
  isAuth,
  [body("id").trim().not().isEmpty(), body("date").trim().not().isEmpty()],
  actionRecordController.doneRecord
);

router.put(
  "/",
  isAuth,
  [body("id").trim().not().isEmpty(), ...actionRecordValidators],
  actionRecordController.updateRecord
);

router.delete(
  "/",
  isAuth,
  [body("ids").isArray()],
  actionRecordController.deleteRecord
);

export default router;
