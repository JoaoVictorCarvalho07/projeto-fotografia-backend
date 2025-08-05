import express from "express";
import * as SessaoController from "../controllers/SessaoController.js";


const SessoesRouter = express.Router();

SessoesRouter.post("/projeto/:projetoId", SessaoController.criarSessao);

SessoesRouter.put("/projeto/:projetoId/:id/uploadCapa", SessaoController.uploadCapaSessao);



// Endpoints diretos
SessoesRouter.put("/projeto/:projetoId/:id", SessaoController.editarSessao);
SessoesRouter.delete("/projeto/:projetoId/:id", SessaoController.deletarSessao);

export default SessoesRouter;
