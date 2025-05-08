import { Document } from ".../models/user.model.js";

declare global {
    namespace Express {
        interface Request {
            user?: Document;
        }
    }
}
