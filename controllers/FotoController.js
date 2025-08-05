import FotoModel from "../models/FotoModel.js";
import { uploadFoto, removerFoto } from "../utils/fileService.js";

export default {
  // Listar fotos da sessão
  async listar(req, res) {
    try {
      const { sessaoId } = req.params;
      const fotos = await FotoModel.getBySessao(sessaoId);
      res.json(fotos);
    } catch (err) {
      res.status(500).json({ erro: "Erro ao buscar fotos." });
    }
  },

  // Upload de foto(s) para a sessão
  async upload(req, res) {
    try {
      const { sessaoId } = req.params;
      if (!req.files || req.files.length === 0)
        return res.status(400).json({ erro: "Nenhuma imagem enviada." });
      const fotos = [];
      for (const file of req.files) {
        const foto = await uploadFoto(sessaoId, file.path);
        fotos.push(foto);
      }
      res.status(201).json(fotos);
    } catch (err) {
      res.status(500).json({ erro: "Erro ao fazer upload das fotos." });
    }
  },

  // Deletar foto
  async deletar(req, res) {
    try {
      const { sessaoId, fotoId } = req.params;
      await removerFoto(sessaoId, fotoId);
      res.sendStatus(204);
    } catch (err) {
      res.status(500).json({ erro: "Erro ao deletar foto." });
    }
  },
};
