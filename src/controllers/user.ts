import { Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { getRepository } from "typeorm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import config from "../util/config";
import { getError, invalidInputError } from "../middlewares/errorHandler";
import { User } from "../entity/User";
import { IRequest } from "../util/types";

export const signup = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(invalidInputError(errors.array()));
  }

  const { email, firstName, lastName, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, +config.hashSalt);

  const userRepo = getRepository(User);
  const user = userRepo.create({
    email,
    password: hashedPassword,
    firstName,
    lastName,
  });

  try {
    const newUser = await userRepo.save(user);
    const token = jwt.sign({ email, userId: newUser.id }, config.jwtSecret, {
      expiresIn: config.jwtExpire,
    });

    res.status(201).json({
      message: "User created.",
      data: {
        userId: newUser.id,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(invalidInputError(errors.array()));
  }

  try {
    const { email, password } = req.body;
    const userRepo = getRepository(User);
    const user = await userRepo.findOne({ email });
    const pwdIsEqual = user
      ? await bcrypt.compare(password, user.password)
      : false;

    if (!user || !pwdIsEqual) {
      return next(getError("Invalid email or password.", 401));
    }

    const token = jwt.sign({ email, userId: user.id }, config.jwtSecret, {
      expiresIn: config.jwtExpire,
    });

    res.status(200).json({
      data: {
        userId: user.id,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const tokenLogin = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { user, token } = req;
  res.status(200).json({
    message: "Token login successfully.",
    data: {
      userId: user.id,
      token,
    },
  });
};

export const changeInfo = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(invalidInputError(errors.array()));
  }

  try {
    const userRepo = getRepository(User);
    const user = await userRepo.findOne(req.user.id);
    if (!user) {
      return next(getError("Not authenticated.", 401));
    }

    const { firstName, lastName } = req.body;
    userRepo.merge(user, { firstName, lastName });
    const newUser = await userRepo.save(user);
    delete newUser.password;

    res
      .status(200)
      .json({ message: "User info updated.", data: { ...newUser } });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(invalidInputError(errors.array()));
  }

  try {
    const userRepo = getRepository(User);
    const user = await userRepo.findOne(req.user.id);
    if (!user) {
      return next(getError("Not authenticated.", 401));
    }

    const hashedPassword = await bcrypt.hash(
      req.body.password,
      +config.hashSalt
    );
    userRepo.merge(user, { password: hashedPassword });
    const newUser = await userRepo.save(user);
    delete newUser.password;

    res
      .status(200)
      .json({ message: "User password updated.", data: { ...newUser } });
  } catch (error) {
    next(error);
  }
};
