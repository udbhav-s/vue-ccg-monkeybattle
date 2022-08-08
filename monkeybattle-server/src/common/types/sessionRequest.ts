import { Request } from 'express';
import { UserModel } from 'src/database/models/user.model';

export interface SessionRequest extends Request {
  user: UserModel;
}
