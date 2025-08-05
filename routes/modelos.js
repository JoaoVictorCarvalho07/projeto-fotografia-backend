// routes/modelos.js
import { Router } from "express";
import { ModeloController } from "../controllers/ModeloController.js";
import { autenticar } from "../middlewares/auth.js";

const router = Router();

// Listar todos os modelos (público)
router.get("/", ModeloController.listar);

// Criar novo modelo (protegido)
router.post("/", autenticar, ModeloController.criar);

// Atualizar um modelo existente (protegido)
router.put("/:id", autenticar, ModeloController.atualizar);

// Deletar um modelo (protegido)
router.delete("/:id", autenticar, ModeloController.deletar);

export default router;
