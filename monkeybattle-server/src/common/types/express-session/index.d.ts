import { UserModel } from 'src/database/models/user.model';

declare module 'express-session' {
  interface SessionData {
    user: UserModel;
  }
}
