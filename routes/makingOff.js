import express from "express";
import * as MakingOffController from "../controllers/MakingOffController.js";

const makingOffRouter = express.Router();

makingOffRouter.get(
  "/sessao/:sessaoId/completo",
  MakingOffController.getMakingOfCompleto
);

makingOffRouter.post("/sessao/:sessaoId", MakingOffController.criar);

export default makingOffRouter;
