import { Router } from "express";
import {
    accessOrCreateChat,
    getSidebarData
} from "../controllers/chat.controller.js";
import { protectRoute } from "../middlewares/protectRoutes";

const router = Router();

router.use(protectRoute);

router.route("/").post(accessOrCreateChat)
router.route("/sidebar").get(getSidebarData);

export default router;