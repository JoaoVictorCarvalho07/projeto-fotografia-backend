import db from "../config/db.js";

export const ModeloController = {
  async listar(req, res) {
    try {
      const [rows] = await db.query("SELECT * FROM modelos ORDER BY id DESC");
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: "Erro ao listar modelos." });
    }
  },

  async criar(req, res) {
    try {
      const { nome, instagram, email, telefone, observacoes } = req.body;
      const [result] = await db.query(
        `INSERT INTO modelos (nome, instagram, email, telefone, observacoes)
         VALUES (?, ?, ?, ?, ?)`,
        [nome, instagram, email, telefone, observacoes]
      );
      res.status(201).json({ id: result.insertId });
    } catch (err) {
      res.status(500).json({ error: "Erro ao criar modelo." });
    }
  },

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, instagram, email, telefone, observacoes } = req.body;

      const campos = [];
      const valores = [];

      if (nome) {
        campos.push("nome = ?");
        valores.push(nome);
      }
      if (instagram) {
        campos.push("instagram = ?");
        valores.push(instagram);
      }
      if (email) {
        campos.push("email = ?");
        valores.push(email);
      }
      if (telefone) {
        campos.push("telefone = ?");
        valores.push(telefone);
      }
      if (observacoes) {
        campos.push("observacoes = ?");
        valores.push(observacoes);
      }

      if (campos.length === 0) {
        return res.status(400).json({ error: "Nenhum campo para atualizar." });
      }

      const query = `UPDATE modelos SET ${campos.join(", ")} WHERE id = ?`;
      valores.push(id);

      await db.query(query, valores);
      res.sendStatus(204);
    } catch (err) {
      res.status(500).json({ error: "Erro ao atualizar modelo." });
    }
  },

  async deletar(req, res) {
    try {
      const { id } = req.params;
      await db.query("DELETE FROM modelos WHERE id = ?", [id]);
      res.sendStatus(204);
    } catch (err) {
      res.status(500).json({ error: "Erro ao deletar modelo." });
    }
  },
};
