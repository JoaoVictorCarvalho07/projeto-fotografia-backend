import db from "../config/db.js";
import path from "path";

// GET /storytelling/:projetoId
export const getStorytelling = async (req, res) => {
  try {
    const { projetoId } = req.params;

    // 1. Busca o storytelling principal do projeto
    const [storyRows] = await db.query(
      "SELECT * FROM storytelling WHERE projeto_id = ?",
      [projetoId]
    );

    if (!storyRows.length) {
      return res.status(404).json({ erro: "Storytelling não encontrado." });
    }

    const storytelling = storyRows[0];

    // 2. Busca as etapas pelo id do storytelling
    const [etapas] = await db.query(
      "SELECT * FROM storytelling_etapa WHERE storytelling_id = ? ORDER BY ordem",
      [storytelling.id]
    );

    // 4. Retorna o storytelling + etapas
    res.json({
      ...storytelling,
      etapas,
    });
  } catch (err) {
    console.error("Erro ao buscar storytelling:", err);
    res.status(500).json({ erro: "Erro ao buscar storytelling." });
  }
};
// GET /storytelling
export const listarStorytellings = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM storytelling ORDER BY criado_em DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao listar storytellings." });
  }
};

// GET /projetos/:projetoId/storytelling
export const listarStorytellingPorProjeto = async (req, res) => {
  try {
    const { projetoId } = req.params;
    const [rows] = await db.query(
      "SELECT * FROM storytelling WHERE projeto_id = ?",
      [projetoId]
    );
    if (!rows.length)
      return res
        .status(404)
        .json({ erro: "Storytelling não encontrado para esse projeto." });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar storytelling do projeto." });
  }
};

// POST /projetos/:projetoId/storytelling
export const criarStorytelling = async (req, res) => {
  try {
    const { projetoId } = req.params;
    const { titulo, resumo } = req.body;

    let capa = null;
    if (req.file) {
      // Salva o caminho relativo do arquivo
      capa = path.join(
        `uploads/projetos/${projetoId}/storytelling/capa/`,
        req.file.filename
      );
    }

    const [result] = await db.query(
      "INSERT INTO storytelling (projeto_id, titulo, resumo, capa) VALUES (?, ?, ?, ?)",
      [projetoId, titulo, resumo, capa]
    );
    res.status(201).json({
      id: result.insertId,
      projeto_id: projetoId,
      titulo,
      resumo,
      capa,
    });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao criar storytelling." });
  }
};

// PUT /storytelling/:projetoId
export const editarStorytelling = async (req, res) => {
  try {
    const { projetoId } = req.params;
    const campos = req.body;

    // Só atualiza os campos permitidos:
    const colunas = [];
    const valores = [];

    if ("titulo" in campos) {
      colunas.push("titulo = ?");
      valores.push(campos.titulo);
    }
    if ("texto" in campos) {
      colunas.push("texto = ?");
      valores.push(campos.texto);
    }
    if ("resumo" in campos) {
      colunas.push("resumo = ?");
      valores.push(campos.resumo);
    }

    if (colunas.length === 0) {
      return res
        .status(400)
        .json({ erro: "Nenhum campo válido enviado para atualização." });
    }

    // Verifica se já existe um storytelling para o projeto
    const [verificar] = await db.query(
      "SELECT * FROM storytelling WHERE projeto_id = ?",
      [projetoId]
    );

    if (!verificar.length) {
      // Não existe, cria um novo registro com os campos fornecidos
      const camposInsert = [
        "projeto_id",
        ...colunas.map((c) => c.split(" = ")[0]),
      ];
      const valoresInsert = [projetoId, ...valores];
      const placeholders = camposInsert.map(() => "?").join(", ");
      const queryInsert = `INSERT INTO storytelling (${camposInsert.join(
        ", "
      )}) VALUES (${placeholders})`;
      const [result] = await db.query(queryInsert, valoresInsert);
      return res
        .status(201)
        .json({ id: result.insertId, projeto_id: projetoId, ...campos });
    } else {
      // Já existe, faz o update
      valores.push(projetoId);
      const query = `UPDATE storytelling SET ${colunas.join(
        ", "
      )} WHERE projeto_id = ?`;
      await db.query(query, valores);
      return res.json({ projetoId, ...campos });
    }
  } catch (err) {
    console.error("Erro ao editar storytelling:", err);
    res.status(500).json({ erro: "Erro ao editar storytelling." });
  }
};

// DELETE /storytelling/:id
export const deletarStorytelling = async (req, res) => {
  try {
    const { projetoId, storyTellingId } = req.params;

    const pasta = path.resolve(`uploads/projetos/${projetoId}/storytelling`);
    // Remove o arquivo antigo do disco (tenta, mas não quebra se não existir)
    fs.rm(pasta, { recursive: true, force: true }, (err) => {
      if (err) {
        console.error("Erro ao remover pasta do storytelling:", err);
      }
    });

    await db.query("DELETE FROM storytelling WHERE id = ?", [storyTellingId]);

    await db.query("INSERT INTO storytelling (projeto_id) VALUES (?)", [
      projetoId,
    ]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao deletar storytelling." });
  }
};

export const getStorytellingCompleto = async (req, res) => {
  const { projetoId } = req.params;

  // 1. Buscar storytelling principal do projeto
  const [storyRows] = await db.query(
    "SELECT * FROM storytelling WHERE projeto_id = ?",
    [projetoId]
  );
  if (!storyRows.length) {
    return res.status(404).json({ erro: "Storytelling não encontrado." });
  }
  const storytelling = storyRows[0];

  // 2. Buscar etapas desse storytelling
  const [etapasRows] = await db.query(
    "SELECT * FROM storytelling_etapa WHERE storytelling_id = ? ORDER BY ordem, id",
    [storytelling.id]
  );

  console.log(etapasRows)

  const etapasList = await Promise.all(
    etapasRows.map(async (etapa) => {
      return { ...etapa };
    })
  );

  // 4. Retornar tudo junto
  res.json({
    ...storytelling,
    etapas: etapasList,
  });
};
