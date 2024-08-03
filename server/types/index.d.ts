import 'passport';
import { Types } from 'mongoose';

declare global {
  namespace Express {
    interface User {
      userId: Types.ObjectId;
      username: string;
      email: string;
      isVerified: boolean;
    }
  }
}

declare module 'passport' {
  namespace Express {
    interface User {
      userId: Types.ObjectId;
      username: string;
      email: string;
      isVerified: boolean;
    }
  }
}

declare module 'express-session' {
  export interface SessionData {
    passport: { [key: string]: any };
  }
}
