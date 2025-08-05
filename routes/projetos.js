// routes/projetos.js
import { Router } from "express";
import * as ProjetoController from "../controllers/ProjetoController.js";
import { upload } from "../config/upload.js";

// import { getStorytelling } from "../controllers/StorytellingController.js";

const ProjetoRouter = Router();

ProjetoRouter.get("/allProjetos", ProjetoController.listarProjetosCompletos);


ProjetoRouter.put(
  "/projeto/:projetoId/capa",
  upload.single("capa"),
  ProjetoController.uploadCapa
);

ProjetoRouter.post("/", ProjetoController.criarProjeto);
ProjetoRouter.put(
  "/:projetoId/capa",
  upload.single("capa"),
  ProjetoController.uploadCapa
);
ProjetoRouter.put("/:id", ProjetoController.editarProjeto);
ProjetoRouter.delete("/:id", ProjetoController.deletarProjeto);

// ProjetoRouter.get("/sessoes/:projetoId", ProjetoController.listarSessoes);
// ProjetoRouter.get("/sessao/:projetoId/:sessaoId", ProjetoController.listarSessao);
// ProjetoRouter.get("/fotosportfolio", ProjetoController.portfolio);
// ProjetoRouter.get("/:id", ProjetoController.listarPorId);

// ProjetoRouter.post("/", ProjetoController.criar);
// ProjetoRouter.put("/:id", ProjetoController.atualizar);
// ProjetoRouter.delete("/:id", ProjetoController.deletar);

// ProjetoRouter.post(
//   "/upload/:id/capa",
//   upload.single("imagem"),
//   ProjetoController.uploadCapaProjeto
// );

// ProjetoRouter.post(
//   "/upload/:id/imagens",
//   upload.array("imagens"),
//   ProjetoController.uploadImagens
// );
// ProjetoRouter.delete("/:id/imagens/:filename", ProjetoController.deletarImagem);

export default ProjetoRouter;
