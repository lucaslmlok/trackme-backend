import { Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { getRepository } from "typeorm";
import moment from "moment";

import { IRequest } from "../util/types";
import { getError, invalidInputError } from "../middlewares/errorHandler";
import { Action } from "../entity/Action";

export const getActions = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const actionRepo = getRepository(Action);
    const actions = await actionRepo.find({ where: { user: req.user.id } });
    res.send(actions);
  } catch (error) {
    next(error);
  }
};

export const createAction = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(invalidInputError(errors.array()));
  }

  const body = req.body;
  if (!body.endDate) body.endDate = null;
  body.user = req.user;

  const actionRepo = getRepository(Action);
  const action = actionRepo.create(body);

  try {
    const newAction = await actionRepo.save(action);
    newAction["userId"] = newAction["__user__"].id;
    delete newAction["__user__"];

    res.status(201).json({
      message: "Action created.",
      data: { ...newAction },
    });
  } catch (error) {
    next(error);
  }
};

export const updateAction = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(invalidInputError(errors.array()));
  }

  try {
    const actionRepo = getRepository(Action);
    const action = await actionRepo.findOne(req.body.id);
    if (!action) {
      return next(getError("Invalid action id."));
    }
    const { id: userId } = await action.user;
    if (req.user.id !== userId) {
      return next(getError("Not authenticated.", 401));
    }

    if (!req.body.endDate) req.body.endDate = null;
    actionRepo.merge(action, req.body);
    const newAction = await actionRepo.save(action);
    newAction["userId"] = newAction["__user__"].id;
    delete newAction["__user__"];

    res.json({ message: "Action updated.", data: { ...newAction } });
  } catch (error) {
    next(error);
  }
};

export const deleteAction = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(invalidInputError(errors.array()));
  }

  try {
    const actionRepo = getRepository(Action);
    const results = await actionRepo.softDelete(req.body.ids);
    res.json({
      message: "Actions deleted.",
      data: { changedRows: results.raw.changedRows },
    });
  } catch (error) {
    next(error);
  }
};
