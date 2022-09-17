import { Router } from "express";
import { fork } from "child_process";
import compression from "compression";
import logger from "../utils/logger.js";
import os from "os";
const nroCPUs = os.cpus().length;
const router = Router();

const info = {
  "Node version": process.version,
  Platform: process.platform,
  "Directorio de ejecución": process.cwd(),
  "ID del proceso": process.pid,
  "Uso de la memoria": process.memoryUsage(),
  "Memoria total reservada (rss)": process.memoryUsage().rss,
  "path de ejecución": process.execPath,
  "Argumentos de entrada": process.argv,
  CPUs: nroCPUs,
};

router.get("/", (req, res) => {
  res.redirect("/info");
});

router.get("/info", (req, res) => {
  res.send(info);
});

router.get("/info-gzip", compression(), (req, res) => {
  logger.info("Route: /info-gzip Method: GET ");
  res.send(info);
})

router.get("/api/randoms", (req, res) => {
  //http://localhost:3000/api/randoms?cant=1000
  
  if (!req.query.cant) {
    logger.error(
      "Route: /api/randoms Method: GET Error: cantidad no especificada"
    );
    res.status(400).send("Debe indicar la cantidad de números a generar");
  }
  else{
    const cant = req.query.cant;
    const child = fork("./src/utils/getRandoms.js");
    child.send(cant);
    child.on("message", (msg) => {
      res.send(msg);
    })
    child.on("exit", (code) => {
      console.log("Se ha cerrado el proceso", code);
    })
  }
});

router.get("*", compression(), (req, res) => {
  logger.warn("Route: 404 Not Found Method: GET ");
  res.send("Sorry 404 Not Found");
});

export default router;