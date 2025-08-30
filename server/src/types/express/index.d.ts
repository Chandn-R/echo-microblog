import { IUserData } from ".../models/user.model";

declare global {
    namespace Express {
        interface Request {
            user?: IUserData;
        }
    }
}
