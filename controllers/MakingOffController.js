import db from "../config/db.js";

// GET /makingof/sessao/:sessaoId/completo
export const getMakingOffCompleto = async (req, res) => {
  const { projetoId, sessaoId } = req.params;

  // 1. Buscar making_off principal
  const [makingRows] = await db.query(
    "SELECT * FROM making_off WHERE sessao_id = ?",
    [sessaoId]
  );
  ("");
  if (!makingRows.length) {
    return res.status(404).json({ erro: "Making Of não encontrado." });
  }
  const makingOf = makingRows[0];

  // 2. Buscar etapas
  const [etapasRows] = await db.query(
    "SELECT * FROM making_off_etapa WHERE making_off_id = ? ORDER BY ordem, id",
    [makingOf.id]
  );

  // 3. Para cada etapa, buscar galeria
  const etapasComGaleria = await Promise.all(
    etapasRows.map(async (etapa) => {
      const [galeriaRows] = await db.query(
        "SELECT * FROM making_off_galeria WHERE etapa_id = ? ORDER BY ordem, id",
        [etapa.id]
      );
      return { ...etapa, galeria: galeriaRows };
    })
  );

  // 4. Retornar tudo organizado
  res.json({
    ...makingOf,
    etapas: etapasComGaleria,
  });
};

// POST /sessoes/:sessaoId/makingof
export const criar = async (req, res) => {
  try {
    const { sessaoId } = req.params;
    const { descricao } = req.body;

    const [result] = await db.query(
      "INSERT INTO making_off (sessao_id, descricao) VALUES (?,?)",
      [sessaoId, descricao]
    );
    res.status(201).json({
      id: result.insertId,
      sessao_id: sessaoId,
      descricao,
    });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao criar making of." });
  }
};

// PUT /makingof/:id
export const editar = async (req, res) => {
  try {
    const { id } = req.params;
    const campos = req.body;
    console.log("Campos para update making of:", campos);

    const colunas = [];
    const valores = [];

    if ("descricao" in campos) {
      colunas.push("descricao = ?"), valores.push(campos.descricao);
    }
    if ("galeria" in campos) {
      const galeriaStr = Array.isArray(campos.galeria)
        ? JSON.stringify(campos.galeria)
        : campos.galeria;
      colunas.push("galeria = ?");
      valores.push(galeriaStr);
    }

    if (colunas.length === 0) {
      return res
        .status(400)
        .json({ erro: "Nenhum campo válido enviado para atualização." });
    }

    valores.push(id);
    const query = `UPDATE making_off SET ${colunas.join(", ")} WHERE id = ?`;
    await db.query(query, valores);

    res.json({ id, ...campos });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao editar making of." });
  }
};

// DELETE /makingof/:id
export const deletar = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM making_off WHERE id = ?", [id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao deletar making of." });
  }
};
