// middlewares/auth.js
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "segredo_super_secreto";

export function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ erro: "Token ausente" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    console.log("Autenticando usuário...");
    console.log("Usuário autenticado:", req.usuario);
    next();
  } catch {
    return res.status(403).json({ erro: "Token inválido" });
  }
}
