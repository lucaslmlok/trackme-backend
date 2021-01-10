import { Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { getRepository } from "typeorm";
import moment from "moment";

import { IRequest } from "../util/types";
import { getError, invalidInputError } from "../middlewares/errorHandler";
import { Action } from "../entity/Action";
import { ActionRecord } from "../entity/ActionRecord";

export const getRecords = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  let date = moment().format("yyyy-MM-DD");
  const queryDate = req.query.date as string;
  if (queryDate) {
    const momentDate = moment(queryDate, "yyyy-MM-DD");
    if (momentDate.isValid()) {
      date = momentDate.format("yyyy-MM-DD");
    }
  }

  try {
    const actionRepo = getRepository(Action);
    const query = actionRepo
      .createQueryBuilder("action")
      .leftJoinAndSelect("action.records", "record", "record.date = :date", {
        date,
      })
      .where(`action.userId = :userId`, { userId: req.user.id })
      .andWhere(`action.startDate <= :date`, { date })
      .andWhere(`(action.endDate IS NULL OR action.endDate >= :date)`, {
        date,
      });

    const actions = await query.getMany();

    actions.forEach((action) => {
      action["done"] = action["__records__"][0]
        ? action["__records__"][0]["done"]
        : 0;
    });
    res.send(actions);
  } catch (error) {
    next(error);
  }
};

export const doneRecord = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(invalidInputError(errors.array()));
  }

  const body = req.body;
  const { date, type } = body;

  try {
    const actionRepo = getRepository(Action);
    const action = await actionRepo.findOne(req.body.id);
    if (!action) {
      return next(getError("Invalid action id."));
    }
    const { id: userId } = await action.user;
    if (req.user.id !== userId) {
      return next(getError("Invalid action id."));
    }

    const recordRepo = getRepository(ActionRecord);
    const record = await recordRepo.findOne({
      where: { actionId: action.id, date },
    });

    let newRecord: any;
    if (!record) {
      const data = {
        ...action,
        done: type === "done-all" ? action.target : action.increment,
        date,
        actionId: action.id,
      };
      delete data.id;
      newRecord = await recordRepo.save(data);
    } else {
      let newDone: number;

      if (type === "undo") {
        newDone = record.done - record.increment;
        if (newDone < 0) newDone = 0;
      } else if (type === "undo-all") {
        newDone = 0;
      } else if (type === "done-all") {
        newDone = record.target;
      } else {
        newDone = record.done + record.increment;
        if (newDone > record.target) newDone = record.target;
      }

      recordRepo.merge(record, { done: newDone });
      newRecord = await recordRepo.save(record);
    }

    res.json({ message: "Action record updated.", data: { ...newRecord } });
  } catch (error) {
    next(error);
  }
};

export const updateRecord = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(invalidInputError(errors.array()));
  }

  try {
    const recordRepo = getRepository(ActionRecord);
    const actionRecord = await recordRepo.findOne(req.body.id);
    if (!actionRecord) {
      return next(getError("Invalid action record id."));
    }
    // const { id: userId } = await actionRecord.user;
    // if (req.user.id !== userId) {
    //   return next(getError("Not authenticated.", 401));
    // }

    recordRepo.merge(actionRecord, req.body);
    const newRecord = await recordRepo.save(actionRecord);
    newRecord["userId"] = newRecord["__user__"].id;
    delete newRecord["__user__"];

    res.json({ message: "Action record updated.", data: { ...newRecord } });
  } catch (error) {
    next(error);
  }
};

export const deleteRecord = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(invalidInputError(errors.array()));
  }

  try {
    const recordRepo = getRepository(ActionRecord);
    const results = await recordRepo.softDelete(req.body.ids);
    res.json({
      message: "Action records deleted.",
      data: { changedRows: results.raw.changedRows },
    });
  } catch (error) {
    next(error);
  }
};
