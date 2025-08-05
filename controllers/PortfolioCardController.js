import path from "path";
import { fileURLToPath } from "url";
import db from "../config/db.js";
import {
  moverArquivo,
  deletarArquivo,
  deletarDiretorio,
  gerarNomeUnico,
} from "../utils/fileService.js";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PortfolioCardController = {
  async listar(req, res) {
    try {
      const [rows] = await db.query(
        "SELECT * FROM portfolio_cards ORDER BY id DESC"
      );

      for (let card of rows) {
        const imagemPath = path.join(
          "uploads",
          "portfolio-cards",
          `${card.id}.jpg`
        );
        const absPath = path.join(__dirname, "..", imagemPath);
        try {
          await fs.access(absPath);
          card.imagem = `/${imagemPath}`;
        } catch {
          card.imagem = null;
        }
      }

      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: "Erro ao listar cards." });
    }
  },

  async criar(req, res) {
    try {
      const { titulo, link } = req.body;
      const [result] = await db.query(
        "INSERT INTO portfolio_cards (titulo, link) VALUES (?, ?)",
        [titulo, link || null]
      );
      res.status(201).json({ id: result.insertId });
    } catch (err) {
      res.status(500).json({ error: "Erro ao criar card." });
    }
  },

  async atualizar(req, res) {
    const { id } = req.params;
    const { titulo, link } = req.body;

    // Monta query e params dinamicamente
    const fields = [];
    const params = [];

    if (titulo !== undefined) {
      fields.push("titulo = ?");
      params.push(titulo);
    }
    if (link !== undefined) {
      fields.push("link = ?");
      params.push(link || null);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "Nenhum campo para atualizar." });
    }

    params.push(id);

    const query = `UPDATE portfolio_cards SET ${fields.join(
      ", "
    )} WHERE id = ?`;

    try {
      await db.query(query, params);
      res.sendStatus(204);
    } catch (err) {
      res.status(500).json({ error: "Erro ao atualizar card." });
    }
  },

  async deletar(req, res) {
    const { id } = req.params;
    try {
      await db.query("DELETE FROM portfolio_cards WHERE id = ?", [id]);

      const imagemPath = path.join("uploads", "portfolio-cards", `${id}.jpg`);
      await deletarArquivo(path.join(__dirname, "..", imagemPath));

      res.sendStatus(204);
    } catch (err) {
      res.status(500).json({ error: "Erro ao deletar card." });
    }
  },

  async uploadImagem(req, res) {
    const { id } = req.params;
    const file = req.file;

    const destino = path.join("uploads", "portfolio-cards", `${id}.jpg`);
    try {
      await moverArquivo(file.path, path.join(__dirname, "..", destino));
      res.sendStatus(200);
    } catch (err) {
      res.status(500).json({ error: "Erro ao fazer upload da imagem." });
    }
  },

  async deletarImagem(req, res) {
    const { id } = req.params;
    const imagemPath = path.join("uploads", "portfolio-cards", `${id}.jpg`);
    try {
      await deletarArquivo(path.join(__dirname, "..", imagemPath));
      res.sendStatus(204);
    } catch (err) {
      res.status(500).json({ error: "Erro ao deletar imagem." });
    }
  },
};
