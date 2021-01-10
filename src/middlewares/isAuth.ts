import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getRepository } from "typeorm";

import config from "../util/config";
import { IRequest, jwtObj } from "../util/types";
import { getError } from "./errorHandler";
import { User } from "../entity/User";

export default async (req: IRequest, res: Response, next: NextFunction) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    return next(getError("Not authenticated.", 401));
  }

  const token = authHeader.split(" ")[1];
  let decodedToken: jwtObj;
  try {
    decodedToken = jwt.verify(token, config.jwtSecret) as jwtObj;
  } catch (error) {
    error.statusCode = 500;
    return next(error);
  }

  if (!decodedToken) {
    return next(getError("Not authenticated.", 401));
  }

  const user = await getRepository(User).findOne(decodedToken.userId);
  if (!user) {
    return next(getError("Not authenticated.", 401));
  }

  req.user = user;
  req.token = token;
  next();
};
