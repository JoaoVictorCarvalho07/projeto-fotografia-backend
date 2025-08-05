// controllers/ProjetoController.js
import db from "../config/db.js";
import fs from "fs";

// // GET /projetos
// export const listarProjetos = async (req, res) => {
//   try {
//     const [projetos] = await db.query(
//       "SELECT * FROM projetos ORDER BY criado_em DESC where visivel = 1"
//     );
//     res.json(projetos);
//   } catch (err) {
//     res.status(500).json({ erro: "Erro ao listar projetos." });
//   }
// };

// GET /projetos/:id
export const detalharProjeto = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM projetos WHERE id = ?", [id]);
    if (!rows.length)
      return res.status(404).json({ erro: "Projeto não encontrado." });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar projeto." });
  }
};

// POST /projetos
export const criarProjeto = async (req, res) => {
  try {
    const { titulo, descricao, em_andamento } = req.body;

    const [result] = await db.query(
      "INSERT INTO projetos (titulo, descricao, em_andamento) VALUES (?, ?, ? )",
      [titulo, descricao, em_andamento]
    );
    const [result2] = await db.query(
      "INSERT INTO storytelling (projeto_id, texto) VALUES (?, ?)",
      [result.insertId, ""]
    );
    res
      .status(201)
      .json({ id: result.insertId, titulo, descricao, em_andamento });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao criar projeto." });
  }
};

// PUT /projetos/:id
export const editarProjeto = async (req, res) => {
  try {
    const { projetoId } = req.params;
    const { titulo, descricao, em_andamento } = req.body;
    let query = "UPDATE projetos SET ";
    let parans = [];
    if (titulo) {
      query += "titulo = ?, ";
      parans.push(titulo);
    }

    if (descricao) {
      query += "descricao = ?, ";
      parans.push(descricao);
    }

    if (em_andamento) {
      query += "em_andamento = ? ";
      parans.push(em_andamento);
    }

    query += "WHERE id = ?";
    parans.push(projetoId);

    const [result] = await db.query(query, parans);

    res.json({ id: projetoId, titulo, descricao, em_andamento });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao editar projeto." });
  }
};

// DELETE /projetos/:id
export const deletarProjeto = async (req, res) => {
  try {
    const { projetoId } = req.params;
    const query = "DELETE FROM projetos WHERE id = ?";
    const [rows] = await db.query(query, [projetoId]);

    res.status(204).send("Projeto deletado com sucesso.");
  } catch (err) {
    res.status(500).json({ erro: "Erro ao deletar projeto." });
  }
};

export const listarProjetosCompletos = async (req, res) => {
  try {
    // 1. Buscar todos os projetos
    const [projetos] = await db.query(
      "SELECT id, titulo, descricao,capa_url, em_andamento, criado_em FROM projetos ORDER BY criado_em DESC"
    );
    if (!projetos.length) return res.json([]);

    const projs = projetos.map((p) => ({
      ...p,
      capa_url: p.capa_url ? p.capa_url.replace(/\\/g, "/") : null,
    }));

    // 2. Buscar storytellings
    const projetoIds = projetos.map((p) => p.id);
    const [storytellings] = await db.query(
      "SELECT * FROM storytelling WHERE projeto_id IN (?)",
      [projetoIds]
    );

    // 3. Buscar sessoes
    const [sessoes] = await db.query(
      "SELECT * FROM sessoes WHERE projeto_id IN (?) ORDER BY projeto_id, ordem, criado_em",
      [projetoIds]
    );

    const sessaoIds = sessoes.map((s) => s.id);

    // 4. Buscar making_of
    let makingOfs = [];
    if (sessaoIds.length > 0) {
      const [makingOfsRaw] = await db.query(
        "SELECT * FROM making_off WHERE sessao_id IN (?)",
        [sessaoIds]
      );
      makingOfs = makingOfsRaw;
    }

    // 5. Buscar fotos
    let fotos = [];
    if (sessaoIds.length > 0) {
      const [fotosRaw] = await db.query(
        "SELECT * FROM fotos WHERE sessao_id IN (?)",
        [sessaoIds]
      );
      fotos = fotosRaw;
    }

    // 6. Montar sessoes com making_off e fotos
    const sessoesCompletas = sessoes.map((sessao) => ({
      ...sessao,
      making_of: makingOfs.find((m) => m.sessao_id === sessao.id) || null,
      fotos: fotos.filter((f) => f.sessao_id === sessao.id),
    }));

    // 7. Montar resposta final com storytellings e sessoes
    const projetosCompletos = projs.map((proj) => ({
      ...proj,
      storytelling: storytellings.find((s) => s.projeto_id === proj.id) || null,
      sessoes: sessoesCompletas.filter(
        (sessao) => sessao.projeto_id === proj.id
      ),
    }));

    res.json(projetosCompletos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao buscar projetos completos" });
  }
};

export const uploadCapa = async (req, res) => {
  try {
    const { projetoId } = req.params;
    if (!req.file) {
      return res.status(400).json({ erro: "Arquivo não enviado." });
    }

    const urlPath = req.file.path;
    const capa_url = urlPath.replace(/\\/g, "/"); // <-- importante para Windows

    // Atualiza a capa do projeto
    await db.query("UPDATE projetos SET capa_url = ? WHERE id = ?", [
      capa_url,
      projetoId,
    ]);

    res.json({ projetoId, capa_url });
  } catch (err) {
    console.error("Erro ao fazer upload da capa:", err);
    res.status(500).json({ erro: "Erro ao fazer upload da capa." });
  }
};

export const deletarCapaProjeto = async (req, res) => {
  try {
    const { projetoId } = req.params;

    const [projeto] = await db.query(
      "SELECT capa_url FROM projetos WHERE id = ?",
      [projetoId]
    );

    if (!projeto || !projeto.capa_url) {
      return res.status(404).json({ erro: "Capa não encontrada." });
    }

    if (projeto.capa_url) {
      // Deletar o arquivo da cap
      fs.unlinkSync(projeto.capa_url);
    }

    // Atualizar a URL da capa para NULL
    await db.query("UPDATE projetos SET capa_url = NULL WHERE id = ?", [
      projetoId,
    ]);

    res.status(204).send("Capa deletada com sucesso.");
  } catch (err) {
    console.error("Erro ao deletar capa:", err);
    res.status(500).json({ erro: "Erro ao deletar capa." });
  }
};
