import express from "express";
const router = express.Router();
import { upload } from "../config/upload.js";
import * as ProjetoController from "../controllers/ProjetoController.js";
import * as SessaoController from "../controllers/SessaoController.js";
import * as MakingOffController from "../controllers/MakingOffController.js";
import * as MakingOffEtapaController from "../controllers/MakingOffEtapaController.js";
import * as StorytellingController from "../controllers/StorytellingController.js";
import * as StorytellingEtapaController from "../controllers/StorytellingEtapaController.js";
import { autenticar } from "../middlewares/auth.js";

// Projetos
router.get("/projetos", ProjetoController.listarProjetosCompletos);
router.post(
  "/projetos",
  autenticar,
  upload.none(),
  ProjetoController.criarProjeto
);
router.put(
  "/projetos/:projetoId",
  autenticar,
  upload.none(),
  ProjetoController.editarProjeto
);
router.delete("/projetos/:projetoId", ProjetoController.deletarProjeto);
router.put(
  "/projetos/:projetoId/capa",
  upload.single("capa"),
  ProjetoController.uploadCapa
);
// Delete capa do projeto
router.delete(
  "/projetos/:projetoId/capa/:url",
  ProjetoController.deletarCapaProjeto
);

// Sessoes
router.post(
  "/projetos/:projetoId/sessoes",
  autenticar,
  upload.none(),
  SessaoController.criarSessao
);

router.put(
  "/projetos/:projetoId/sessoes/:sessaoId",
  autenticar,
  upload.none(),
  SessaoController.editarSessao
);
router.delete(
  "/projetos/:projetoId/sessoes/:sessaoId",
  SessaoController.deletarSessao
);
router.put(
  "/projetos/:projetoId/sessoes/:sessaoId/capa",
  upload.single("capa"),
  SessaoController.uploadCapaSessao
);
// Delete capa da sessão
router.delete(
  "/projetos/:projetoId/sessoes/:sessaoId/capa/:capaId",
  SessaoController.deletarCapaSessao
);
router.post(
  "/projetos/:projetoId/sessoes/:sessaoId/arquivos",
  upload.array("arquivos"),
  SessaoController.adicionarImagemSessao
);
// Delete arquivo da sessão
router.delete(
  "/projetos/:projetoId/sessoes/:sessaoId/arquivos/:arquivoId",
  SessaoController.deletarArquivoSessao
);
// MakingOff
router.get(
  "/projetos/:projetoId/sessoes/:sessaoId/makingoff",
  MakingOffController.getMakingOffCompleto
);
router.post(
  "/projetos/:projetoId/sessoes/:sessaoId/makingoff",
  MakingOffController.criar
);
router.put(
  "/projetos/:projetoId/sessoes/:sessaoId/makingoff",
  MakingOffController.editar
);
router.delete(
  "/projetos/:projetoId/sessoes/:sessaoId/makingoff",
  MakingOffController.deletar
);

router.get(
  "/projetos/:projetoId/sessoes/:sessaoId/makingoff/etapas",
  (req, res) => {
    res.status(501).send("Not implemented");
  }
);
router.post(
  "/projetos/:projetoId/sessoes/:sessaoId/makingoff/etapas",
  MakingOffEtapaController.criarEtapa
);
router.put(
  "/projetos/:projetoId/sessoes/:sessaoId/makingoff/etapas/:etapaId",
  MakingOffEtapaController.editarEtapa
);
router.delete(
  "/projetos/:projetoId/sessoes/:sessaoId/makingoff/etapas/:etapaId",
  MakingOffEtapaController.deletarEtapa
);
router.post(
  "/projetos/:projetoId/sessoes/:sessaoId/makingoff/etapas/:etapaId/upload",
  upload.single("media"),
  MakingOffEtapaController.uploadEtapaMedia
);
// Delete arquivo da etapa do makingoff
router.delete(
  "/projetos/:projetoId/sessoes/:sessaoId/makingoff/etapas/:etapaId/media/:mediaId",
  MakingOffEtapaController.deletarEtapaMedia
);

// Storytelling
router.get(
  "/projetos/:projetoId/storytelling",
  StorytellingController.getStorytellingCompleto
);
router.post(
  "/projetos/:projetoId/storytelling",
  StorytellingController.criarStorytelling
);
router.put(
  "/projetos/:projetoId/storytelling",
  autenticar,
  StorytellingController.editarStorytelling
);
router.delete(
  "/projetos/:projetoId/storytelling",
  StorytellingController.deletarStorytelling
);

router.get("/projetos/:projetoId/storytelling/etapas", (req, res) => {
  res.status(501).send("Not implemented");
});
router.post(
  "/projetos/:projetoId/storytelling/etapas",
  upload.none(),
  StorytellingEtapaController.criarEtapa
);
router.put(
  "/projetos/:projetoId/storytelling/etapas/:etapaId",
  StorytellingEtapaController.editarEtapa
);
router.delete(
  "/projetos/:projetoId/storytelling/etapas/:etapaId",
  StorytellingEtapaController.deletarEtapa
);
router.post(
  "/projetos/:projetoId/storytelling/etapas/:etapaId/upload",
  upload.single("media"),
  StorytellingEtapaController.uploadEtapaMedia
);
// Delete arquivo da etapa do storytelling
router.delete(
  "/projetos/:projetoId/storytelling/etapas/:etapaId/media/:mediaId",
  StorytellingEtapaController.deletarEtapaMedia
);

export default router;
