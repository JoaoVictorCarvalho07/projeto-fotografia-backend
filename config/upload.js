import multer from "multer";
import fs from "fs";
import path from "path";
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { projetoId, storytellingId, sessaoId, etapaId, makingOffId } =
      req.params;
    let destDir;

    // capa do projeto
    if (projetoId && sessaoId && req.originalUrl.includes("capa")) {
      console.log("Fazendo upload da capa da sessão upload");
      destDir = path.join(
        "uploads",
        "projetos",
        projetoId,
        "sessoes",
        sessaoId,
        "capa"
      );
    } else if (projetoId && req.originalUrl.includes("capa")) {
      console.log("Fazendo upload da capa do projeto");
      destDir = path.join("uploads", "projetos", projetoId, "capa");
      console.log("Destino da capa do projeto:", destDir);
    }
    // capa da sessão

    // mídia da etapa do storytelling
    else if (storytellingId && etapaId) {
      console.log("Fazendo upload da mídia da etapa do storytelling");
      destDir = path.join(
        "uploads",
        "projetos",
        projetoId,
        "storytelling",
        storytellingId,
        "etapa",
        etapaId
      );
    }
    // mídia das etapas do making off
    else if (sessaoId && makingOffId && etapaId) {
      console.log("Fazendo upload da mídia da etapa do making off");
      destDir = path.join(
        "uploads",
        "projetos",
        projetoId,
        "sessoes",
        sessaoId,
        "makingoff",
        makingOffId,
        "etapas"
      );
    }
    // mídia da sessão
    else if (sessaoId && req.originalUrl.includes("arquivos")) {
      console.log("Fazendo upload da mídia da sessão");
      destDir = path.join(
        "uploads",
        "projetos",
        projetoId,
        "sessoes",
        sessaoId,
        "arquivos"
      );
    }
    // fallback para projeto
    else if (projetoId) {
      console.log("Fazendo upload de mídia do projeto");
      destDir = path.join("uploads", "projetos", projetoId, "outros");
    }
    // fallback final
    else {
      console.log("Fazendo upload de mídia temporária");
      destDir = path.join("uploads", "temporario");
    }

    fs.mkdirSync(destDir, { recursive: true });
    cb(null, destDir);
  },

  filename: (req, file, cb) => {
    const { projetoId, etapaId, sessaoId, storytellingId, makingOffId } =
      req.params;

    //capa da sessao
    if (sessaoId && req.file && req.originalUrl.includes("capa")) {
      cb(null, `sessao-${sessaoId}-capa-${path.extname(file.originalname)}`);
    }
    ///capa do projeto
    else if (projetoId && req.originalUrl.includes("capa")) {
      cb(
        null,
        "projeto-" + projetoId + "-capa" + path.extname(file.originalname)
      );
    }
    //midia da etapa do storytelling
    else if (etapaId && storytellingId) {
      cb(
        null,
        `storytelling-etapa-${etapaId}-media${path.extname(file.originalname)}`
      );
    }

    //midia da sessao do making off
    else if (sessaoId && makingOffId && etapaId) {
      cb(
        null,
        `sessao-etapa-${etapaId}-media${path.extname(file.originalname)}`
      );
    }
    //midia da sessao
    else if (sessaoId && req.file) {
      cb(null, `sessao-${sessaoId}-media${path.extname(file.originalname)}`);
    }
    // Default/fallback
    else if (req.file) {
      cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, "_")}`);
    } else {
      cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, "_")}`);
    }
  },
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB
  },
});

export const upload = multer({ storage });
