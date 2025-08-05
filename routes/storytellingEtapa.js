import express from "express";
import * as StorytellingEtapaController from "../controllers/StorytellingEtapaController.js";
import { upload } from "../config/upload.js";

const StorytellingEtapaRouter = express.Router();

StorytellingEtapaRouter.post("/", StorytellingEtapaController.criarEtapa);

StorytellingEtapaRouter.delete(
  "/:id",
  StorytellingEtapaController.deletarEtapa
);

StorytellingEtapaRouter.put("/:id", StorytellingEtapaController.editarEtapa);

StorytellingEtapaRouter.put(
  "/:id/:storytellingId/upload",
  upload.array("files"),
  StorytellingEtapaController.uploadEtapaMedia
);

StorytellingEtapaRouter.put("/:id", StorytellingEtapaController.editarEtapa);

StorytellingEtapaRouter.delete(
  "/:idProjeto/:idEtapa",
  StorytellingEtapaController.deletarEtapa
);

export default StorytellingEtapaRouter;
