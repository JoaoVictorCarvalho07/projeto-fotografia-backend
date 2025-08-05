import express from "express";
import * as MakingOffEtapaController from "../controllers/MakingOffEtapaController.js";
import { upload } from "../config/upload.js";

const MakingOffEtapasRouter = express.Router();

MakingOffEtapasRouter.post("/:makingOfId", MakingOffEtapaController.criarEtapa);

MakingOffEtapasRouter.put(
  "/etapa/:etapaId",
  MakingOffEtapaController.editarEtapa
);

MakingOffEtapasRouter.put(
  "/etapa/:etapaId/upload",
  upload.single("file"),
  MakingOffEtapaController.uploadEtapaMedia
);

MakingOffEtapasRouter.delete(
  "/etapa/:etapaId",
  MakingOffEtapaController.deletarEtapa
);
export default MakingOffEtapasRouter;
