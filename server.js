import express from "express";
import cluster from "cluster";
import os from "os";
import indexRoutes from "./src/routes/indexRoutes.js";

const PORT = process.env.PORT || 3000;
const MODO = process.env.MODO || "fork";
const nroCPUs = os.cpus().length;

if (cluster.isPrimary && MODO === "cluster") {
  console.log(
    `Primary PID ${process.pid} is running. On port ${PORT}. 🧑‍💻 MODO: ${MODO}.`
  );
  for (let i = 0; i < nroCPUs; i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
    
  app.use("/", indexRoutes);

  const server = app.listen(PORT, () =>
    console.log(
      `Server started on port ${PORT}. 
       Worker PID: ${process.pid}. 
       MODO: ${MODO}.
       at ${new Date().toLocaleString()}`
    )
  );
  server.on("error", (err) => console.log(err));
}