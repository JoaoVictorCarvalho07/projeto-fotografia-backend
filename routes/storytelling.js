import express from "express";
import * as StorytellingController from "../controllers/StorytellingController.js";

const StorytellingRouter = express.Router();

StorytellingRouter.get(
  "/:projetoId",
  StorytellingController.getStorytellingCompleto
);

export default StorytellingRouter;
