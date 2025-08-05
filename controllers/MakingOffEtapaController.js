import db from "../config/db.js";

// POST /makingoff/etapa/:projetoId/:sessaoId/:makingoffId
export const criarEtapa = async (req, res) => {
  const { projetoId, sessaoId, makingoffId } = req.params;
  const { ordem, titulo, media_type, texto, comentario_admin } = req.body;

  // Monta os campos dinamicamente
  const campos = [];
  const valores = [];

  if (ordem !== undefined) {
    campos.push("ordem, ");
    valores.push(ordem);
  }
  if (titulo !== undefined) {
    campos.push("titulo, ");
    valores.push(titulo);
  }
  if (media_type !== undefined) {
    campos.push("media_type, ");
    valores.push(media_type);
  }

  if (texto !== undefined) {
    campos.push("texto, ");
    valores.push(texto);
  }
  if (comentario_admin !== undefined) {
    campos.push("comentario_admin, ");
    valores.push(comentario_admin);
  }

  campos.push("making_off_id");
  valores.push(makingoffId);

  const query = `INSERT INTO making_off_etapa (${campos.join(
    ", "
  )}) VALUES (${campos.map(() => "?").join(", ")})`;
  const [result] = await db.query(query, valores);

  res.status(201).json({ id: result.insertId });
};

export const editarEtapa = async (req, res) => {
  try {
    const { projetoId, id } = req.params;
    const campos = req.body;
    let media_src;

    // 1. Se veio arquivo novo, busca o caminho do arquivo antigo e remove:
    if (req.file) {
      // Busca o antigo no banco
      const [rows] = await db.query(
        "SELECT media_src FROM making_off_etapa WHERE making_off_id = ?",
        [id]
      );
      const etapa = rows[0];
      if (etapa && etapa.media_src) {
        const antigoPath = path.resolve(etapa.media_src);
        // Remove o arquivo antigo do disco (tenta, mas não quebra se não existir)
        fs.unlink(antigoPath, (err) => {
          if (err) {
            console.log(
              "Arquivo antigo não encontrado ou erro ao remover:",
              err.message
            );
          }
        });
      }
    }
    // Loga para debug
    console.log("Campos recebidos para update (etapa):", campos);

    // Monta query dinâmica para atualizar só os campos enviados
    const colunas = [];
    const valores = [];

    if ("ordem" in campos)
      colunas.push("ordem = ?"), valores.push(campos.ordem);
    if ("titulo" in campos)
      colunas.push("titulo = ?"), valores.push(campos.titulo);
    if ("media_type" in campos)
      colunas.push("media_type = ?"), valores.push(campos.media_type);
    if ("media_src" in campos)
      colunas.push("media_src = ?"), valores.push(campos.media_src);
    if ("texto" in campos)
      colunas.push("texto = ?"), valores.push(campos.texto);

    if ("comentario_admin" in campos)
      colunas.push("comentario_admin = ?"),
        valores.push(campos.comentario_admin);

    if (colunas.length === 0) {
      return res
        .status(400)
        .json({ erro: "Nenhum campo válido enviado para atualização." });
    }

    valores.push(id);
    const query = `UPDATE storytelling_etapa SET ${colunas.join(
      ", "
    )} WHERE id = ?`;
    await db.query(query, valores);

    res.json({ id, ...campos });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao editar etapa." });
  }
};

// PUT /makingoff/etapa/:id/upload
export const uploadEtapaMedia = async (req, res) => {
  try {
    const { etapaId } = req.params;
    const fileUrl = req.file.path;

    if (!req.file) {
      return res.status(400).json({ erro: "Nenhum arquivo enviado." });
    }
    const media_src = await db.query(
      "UPDATE making_off_etapa SET media_src = ? WHERE id = ?",
      [fileUrl, etapaId]
    );
    res.status(200).json({ media_src: fileUrl });
  } catch (err) {
    console.error("Erro ao fazer upload da mídia da etapa:", err);
  }
};

// PUT /makingoff/etapa/:id/remove
export const deletarEtapaMedia = async (req, res) => {
  try {
    const { etapaId } = req.params;
    const [rows] = await db.query(
      "SELECT media_src FROM making_off_etapa WHERE id = ?",
      [etapaId]
    );
    const etapa = rows[0];
    if (etapa && etapa.media_src) {
      const antigoPath = path.resolve(etapa.media_src);
      // Remove o arquivo antigo do disco (tenta, mas não quebra se não existir)
      fs.unlink(antigoPath, (err) => {
        if (err) {
          console.log(
            "Arquivo antigo não encontrado ou erro ao remover:",
            err.message
          );
        }
      });
    }
    await db.query(
      "UPDATE making_off_etapa SET media_src = NULL WHERE id = ?",
      [etapaId]
    );
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Erro ao remover mídia da etapa:", err);
    res.status(500).json({ erro: "Erro ao remover mídia da etapa." });
  }
};

// DELETE
export const deletarEtapa = async (req, res) => {
  try {
    const { makingoffId, etapaId } = req.params;
    const [rows] = await db.query(
      "SELECT media_src FROM making_off_etapa WHERE id = ?",
      [etapaId]
    );
    const etapa = rows[0];
    if (etapa && etapa.media_src) {
      const antigoPath = path.resolve(etapa.media_src);
      // Remove o arquivo antigo do disco (tenta, mas não quebra se não existir)
      fs.unlink(antigoPath, (err) => {
        if (err) {
          console.log(
            "Arquivo antigo não encontrado ou erro ao remover:",
            err.message
          );
        }
      });
    }
    await db.query("DELETE FROM making_off_etapa WHERE id = ?", [etapaId]);
    res.json({ success: true });
  } catch (err) {
    console.error("Erro ao deletar etapa:", err);
    res.status(500).json({ erro: "Erro ao deletar etapa." });
  }
};
