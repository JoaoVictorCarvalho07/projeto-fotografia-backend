// controllers/AuthController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/db.js";
import dotenv from "dotenv";
dotenv.config();

const ADMIN_SENHA = process.env.ADMIN_SENHA;
const JWT_SECRET = process.env.JWT_SECRET;

export async function login(req, res) {
  const { senha } = req.body;

  console.log("Tentativa de login com senha:", senha);
  console.log("Senha do admin:", ADMIN_SENHA);
  console.log("comparacao:" + (senha === ADMIN_SENHA));
  // Checa usuário e senha fixos
  if (senha == ADMIN_SENHA) {
    // Gera o token
    const token = jwt.sign({ role: "admin" }, JWT_SECRET, {
      expiresIn: "12h",
    });

    return res.json({ token, admin: true });
  }

  return res.status(401).json({ erro: "Credenciais inválidas" });
}
