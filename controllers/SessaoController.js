import db from "../config/db.js";
import fs from "fs";
import path from "path";

// POST /projetos/:projetoId/sessoes
export const criarSessao = async (req, res) => {
  try {
    const { projetoId } = req.params;
    const { titulo, ordem, modelo_id, capa_url } = req.body;
    let query = "projeto_id = ?, ";
    const values = [projetoId];

    if (titulo) {
      query += `titulo = ? `;
      values.push(titulo);
    }

    if (ordem) {
      query += `ordem = ?, `;
      values.push(ordem);
    }

    if (modelo_id) {
      query += `modelo_id = ?, `;
      values.push(modelo_id);
    }

    if (capa_url) {
      query += `capa_url = ?`;
      values.push(capa_url);
    }

    const [result] = await db.query(
      `INSERT INTO sessoes (projeto_id, titulo) VALUES (?, ?)`,
      [projetoId, titulo]
    );

    res.status(201).json({
      id: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao criar sessão." });
  }
};

// PUT /sessoes/:id
export const editarSessao = async (req, res) => {
  try {
    const { sessaoId } = req.params;
    const { titulo } = req.body;
    const resp = await db.query("UPDATE sessoes SET titulo = ? WHERE id = ?", [
      titulo,
      sessaoId,
    ]);

    res.json({ sessaoId, titulo });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao editar sessão." });
  }
};

// DELETE /sessoes/:id
export const deletarSessao = async (req, res) => {
  try {
    const { projetoId, sessaoId } = req.params;
    console.log("projetoId:", projetoId);
    console.log("sessaoId:", sessaoId);

    // Caminho da pasta de uploads da sessão
    const pastaSessao = path.join(
      "uploads",
      "projetos",
      String(projetoId),
      "sessoes",
      String(sessaoId)
    );

    const pathh = "uploads/projetos/" + projetoId + "/sessoes/" + sessaoId;

    console.log("pastaSessao:", pastaSessao);
    // Deletar a pasta e arquivos da sessão, se existir
    console.log(fs.existsSync(pathh));
    if (fs.existsSync(pastaSessao)) {
      console.log("Pasta da sessão deletada:", pastaSessao);
      fs.rmSync(pastaSessao, { recursive: true, force: true });
    }
    console.log("Pasta da sessão deletada:", pastaSessao);

    const resp = await db.query(
      "DELETE FROM sessoes WHERE id = ? and projeto_id = ?",
      [sessaoId, projetoId]
    );
    if (resp.affectedRows === 1) {
      res.status(201).send("Sessão deletada com sucesso.");
    }

    res.status(204).send("sessão deletada com sucesso.");
  } catch (err) {
    res.status(500).json({ erro: "Erro ao deletar sessão." });
  }
};

export const adicionarImagemSessao = async (req, res) => {
  try {
    const { sessaoId } = req.params;
    const files = req.files;

    const paths = files.map((file) => file.path.replace(/\\/g, "/"));
    console.log("paths:", paths);

    paths.forEach(async (path) => {
      await db.query("INSERT INTO fotos (sessao_id, caminho) VALUES (?, ?)", [
        sessaoId,
        path,
      ]);
    });

    res.json({ sessaoId, arquivos: paths });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao adicionar imagem à sessão." });
  }
};

export const uploadCapaSessao = async (req, res) => {
  try {
    const { sessaoId } = req.params;
    console.log("file:", req.file.path);
    const filePath = req.file.path;

    if (!filePath) {
      res.status(400).json({ erro: "Nenhum arquivo enviado." });
      return;
    }
    console.log("passou 1");

    await db.query("UPDATE sessoes SET capa_url = ? WHERE id = ?", [
      filePath,
      sessaoId,
    ]);
    console.log("passou 2");

    res.json({ sessaoId, capa_url: filePath });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao fazer upload da capa da sessão." });
  }
};

export const deletarCapaSessao = async (req, res) => {
  try {
    const { sessaoId } = req.params;

    // Verifica se a capa existe
    const [capa] = await db.query("SELECT capa_url FROM sessoes WHERE id = ?", [
      sessaoId,
    ]);

    if (!capa || !capa.capa_url) {
      return res.status(404).json({ erro: "Capa não encontrada." });
    }

    // Deleta o arquivo da capa
    fs.unlinkSync(capa.capa_url);

    // Atualiza a sessão para remover a capa
    await db.query("UPDATE sessoes SET capa_url = NULL WHERE id = ?", [
      sessaoId,
    ]);

    res.status(204).send("Capa deletada com sucesso.");
  } catch (err) {
    res.status(500).json({ erro: "Erro ao deletar capa da sessão." });
  }
};

export const deletarArquivoSessao = async (req, res) => {
  try {
    const { projetoId, sessaoId, arquivoId } = req.params;

    // Verifica se o arquivo existe
    console.log("sessaoId:", sessaoId);
    const [arquivo] = await db.query(
      "SELECT caminho FROM fotos WHERE id = ? AND sessao_id = ?",
      [arquivoId, sessaoId]
    );
    console.log("arquivo:", arquivo[0]);
    if (!arquivo || !arquivo[0].caminho) {
      return res.status(404).json({ erro: "Arquivo não encontrado." });
    }
    console.log("passou");

    // Deleta o arquivo do sistema de arquivos
    try {
      console.log("Deletando arquivo:", arquivo[0].caminho);
      let arquivoo;
      if (arquivo[0].caminho[0] === "/") {
        // Se o caminho começa com '/', remove o primeiro caractere
        arquivoo = arquivo[0].caminho.slice(1);
      }
      console.log("arquivoo:", arquivoo);
      if (fs.existsSync(arquivoo)) {
        fs.unlinkSync(arquivoo);
        console.log("Arquivo deletado com sucesso.");
      } else {
        console.log("Arquivo não encontrado.");
      }
      console.log("Arquivo deletado com sucesso:", arquivo[0].caminho);
      // Remove o registro do banco de dados
      console.log(arquivoId);
      await db.query("DELETE FROM fotos WHERE id = ?", [arquivoId]);

      console.log("Registro do banco de dados deletado com sucesso.");
    } catch (err) {
      res.status(500).json({ erro: "Erro ao deletar arquivo da sessão." });
      return;
    }

    res.status(204).send("Arquivo deletado com sucesso.");
  } catch (err) {
    res.status(500).json({ erro: "Erro ao deletar arquivo da sessão." });
  }
};
