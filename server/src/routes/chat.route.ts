import { Router } from "express";
import { 
    accessOrCreateChat, 
    fetchChats, 
    fetchFriends 
} from "../controllers/chat.controller.js";
import { protectRoute } from "../middlewares/protectRoutes";

const router = Router();

router.use(protectRoute); 

router.route("/").post(accessOrCreateChat).get(fetchChats);
router.route("/friends").get(fetchFriends);

export default router;