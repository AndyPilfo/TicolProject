import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { articlesRouter } from "./articles.routes.js";
import { favoritesRouter } from "./favorites.routes.js";
import { conversationsRouter } from "./conversations.routes.js";
import { chatRouter } from "./chat.routes.js";
import { userRouter } from "./user.routes.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/articles", articlesRouter);
apiRouter.use("/favorites", favoritesRouter);
apiRouter.use("/conversations", conversationsRouter);
apiRouter.use("/chat", chatRouter);
apiRouter.use("/user", userRouter);
