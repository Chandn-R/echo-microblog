import { Router } from "express";
import {
    sendMessage,
    fetchMessages
} from "../controllers/message.controller.js";
import { protectRoute } from "../middlewares/protectRoutes.js";

const router = Router();

router.use(protectRoute);

router.route("/").post(sendMessage);
router.route("/:chatId").get(fetchMessages);

export default router;