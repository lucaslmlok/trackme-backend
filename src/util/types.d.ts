import { Request } from "express";

import { User } from "../entity/User";

export interface IError extends Error {
  statusCode?: number;
  data?: any;
}

export interface IRequest extends Request {
  user?: User;
  token?: string;
}

export interface jwtObj {
  userId: string;
  email: string;
}
