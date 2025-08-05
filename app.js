// backend/app.js
import db from "./config/db.js";

import express from "express";
import cors from "cors";
import { autenticar } from "./middlewares/auth.js";
// import projetosRoutes from "./routes/projetos.js";
// import SessoesRouter from "./routes/sessoes.js";
import authRoutes from "./routes/auth.js";
// import StorytellingRouter from "./routes/storytelling.js";
// import StorytellingEtapaRouter from "./routes/storytellingEtapa.js";
// import MakingOffEtapasRouter from "./routes/makingOffEtapas.js";
// // import StorytellingEtapaRouter from "./routes/storytellingEtapa.js";
// import MakingOffRouter from "./routes/MakingOff.js";

import router from "./routes/rotas.js";

// Testa conexão com o banco
db.query("SELECT 1")
  .then(() => {
    console.log("✅ Banco conectado com sucesso!");
  })
  .catch((err) => {
    console.error("❌ Erro ao conectar com o banco:", err);
  });

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/", router);

// // Rotas com prefixo (boa prática)
// app.use("/projetos", projetosRoutes);
// app.use("/sessoes", SessoesRouter);
app.use("/auth", authRoutes);
// app.use("/storytelling", StorytellingRouter);
// // app.use("/etapas", StorytellingEtapaRouter);
// app.use("/makingoff/etapas", MakingOffEtapasRouter);
// app.use("/makingoff", MakingOffRouter);
// app.use("/storyTellingEtapas", StorytellingEtapaRouter);

export default app;
