import fs from "fs/promises";
import path from "path";

// Caminho base das imagens no projeto
const BASE_UPLOADS = path.resolve("uploads", "projetos");

// Garante que diretório existe
export async function garantirDiretorio(destino) {
  try {
    await fs.mkdir(destino, { recursive: true });
  } catch (err) {
    // Se já existir, ignora
    if (err.code !== "EEXIST") throw err;
  }
}

// Move arquivo do Multer para destino final
export async function moverArquivo(origem, destino) {
  await garantirDiretorio(path.dirname(destino));
  await fs.rename(origem, destino);
}

// Upload da capa do projeto
export async function uploadCapaProjeto(projetoId, origem) {
  const destino = path.join(BASE_UPLOADS, String(projetoId), "capaProjeto.jpg");
  await moverArquivo(origem, destino);
  return destino;
}

// Upload da capa da sessão
export async function uploadCapaSessao(sessaoId, origem) {
  const destino = path.join(
    BASE_UPLOADS,
    "*",
    String(sessaoId),
    "capaSessao.jpg"
  );
  // * Você pode adaptar para pegar o projetoId se tiver fácil acesso
  await garantirDiretorio(path.dirname(destino));
  await moverArquivo(origem, destino);
  return destino;
}

// Upload de foto comum da sessão
export async function uploadFoto(sessaoId, origem) {
  // O ideal é passar projetoId, mas usando só sessaoId como exemplo:
  const destinoDir = path.join(BASE_UPLOADS, "*", String(sessaoId));
  await garantirDiretorio(destinoDir);

  // Gera nome único (timestamp + original) para evitar sobrescrever
  const ext = path.extname(origem);
  const nomeArquivo = `foto_${Date.now()}${ext}`;
  const destino = path.join(destinoDir, nomeArquivo);

  await moverArquivo(origem, destino);
  return destino;
}

// Remove uma foto (ou capa)
export async function removerArquivo(caminho) {
  try {
    await fs.unlink(caminho);
  } catch (err) {
    if (err.code !== "ENOENT") throw err; // Ignora se já não existir
  }
}
