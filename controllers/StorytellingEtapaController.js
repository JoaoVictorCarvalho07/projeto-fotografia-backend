import db from "../config/db.js";
import fs from "fs";
import path from "path";

export const criarEtapa = async (req, res) => {
  const { projetoId } = req.params;
  const { titulo, media_type, texto, comentario_admin } = req.body;

  const resp = await db.query(
    "select id from storytelling where projeto_id = ?",
    [projetoId]
  );
  const storytellingId = resp[0][0].id;
  const respOrdem = await db.query(
    "select max(ordem) as max_ordem from storytelling_etapa where storytelling_id = ?",
    [storytellingId]
  );
  const ordem = respOrdem[0][0].max_ordem + 1;

  console.log(storytellingId);
  // console.log(titulo, media_type, texto, comentario_admin, ordem,);
  // Monta os campos dinamicamente
  const campos = [];
  const valores = [];

  if (titulo) {
    campos.push("titulo");
    valores.push(`"${titulo}"`);
  }

  if (media_type) {
    campos.push("media_type");
    valores.push(`"${media_type}"`);
  }

  if (texto) {
    campos.push("texto");
    valores.push(`"${texto}"`);
  }

  if (comentario_admin) {
    campos.push("comentario_admin");
    valores.push(`"${comentario_admin}"`);
  }
  if (ordem) {
    campos.push("ordem");
    valores.push(ordem);
  }

  campos.push("storytelling_id");
  valores.push(storytellingId);

  const query = `INSERT INTO storytelling_etapa (${campos.join(
    ", "
  )}) VALUES (${valores.join(", ")})`;
  console.log(query);
  const [result] = await db.query(query);

  res.status(201).json({ id: result.insertId });
};

export const uploadEtapaMedia = async (req, res) => {
  try {
    const { etapaId } = req.params;
    const fileUrl = req.file.path;

    if (!req.file) {
      return res.status(400).json({ erro: "Nenhum arquivo enviado." });
    }

    const media_src = await db.query(
      "UPDATE storytelling_etapa SET media_src = ? WHERE id = ?",
      [fileUrl, etapaId]
    );

    res.status(200).json({ media_src: fileUrl });
  } catch (err) {
    console.error("Erro ao fazer upload da mídia da etapa:", err);
  }
};

export const deletarEtapaMedia = async (req, res) => {
  try {
    const { etapaId } = req.params;
    const [rows] = await db.query(
      "SELECT media_src FROM storytelling_etapa WHERE id = ?",
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
  } catch (err) {
    console.error("Erro ao remover mídia da etapa:", err);
    res.status(500).json({ erro: "Erro ao remover mídia da etapa." });
  }
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
        "SELECT media_src FROM storytelling_etapa WHERE id = ?",
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
      // Salva o novo caminho
      media_src = path.join(
        `uploads/projetos/${projetoId}/storytelling/}`,
        req.file.filename
      );
      campos.media_src = media_src;
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
// DELETE
export const deletarEtapa = async (req, res) => {
  try {
    const { etapaId } = req.params;
    const [rows] = await db.query(
      "SELECT media_src FROM storytelling_etapa WHERE id = ?",
      [etapaId]
    );

    const etapa = rows[0];
    if (etapa && etapa.media_src) {
      const antigoPath = path.resolve(etapa.media_src);
      if (fs.existsSync(antigoPath)) {
        // Remove o arquivo antigo do disco (tenta, mas não quebra se não existir)
        fs.unlink(antigoPath, (err) => {
          if (err) {
            console.log(
              "Arquivo antigo não encontrado ou erro ao remover:",
              err.message
            );
          }
        });
      } else {
        console.log(
          "Arquivo antigo não encontrado ou já removido:",
          antigoPath
        );
      }
    }
    await db.query("DELETE FROM storytelling_etapa WHERE id = ?", [etapaId]);
    res.status(200).json({ id: etapaId });
  } catch (err) {
    console.error("Erro ao deletar etapa:", err);
    res.status(500).json({ erro: "Erro ao deletar etapa." });
    err.message;
  }
};
