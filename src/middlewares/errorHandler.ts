import { Request, Response, NextFunction } from "express";

import { IError } from "../util/types";

export default (
  error: IError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { statusCode, message, data } = error;
  res.status(statusCode || 500).json({ message, data });
};

export const getError = (message: string, statusCode = 400, data = null) => {
  const error = new Error(message) as IError;
  error.statusCode = statusCode;
  if (data) error.data = data;
  return error;
};

export const invalidInputError = (errorsArr: any[]) => {
  return getError("Invalid input.", 422, errorsArr);
};
