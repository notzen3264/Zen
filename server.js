import { ChemicalServer } from "chemicaljs";
import express from "express";
import cors from "cors";
import path from "node:path";
import { hostname } from "node:os";
import chalk from "chalk";
import compression from "compression";
import RateLimit from "express-rate-limit";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const [app, listen] = new ChemicalServer({
    default: "uv",
    uv: true,
    rammerhead: true,
    experimental: {
        scramjet: true,
    }
});

const PORT = process.env.PORT || 3000;
const viteDistPath = path.join(__dirname, "dist");
const publicPath = path.join(__dirname, "public");

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(compression());

app.disable("x-powered-by");

/*app.use(
    RateLimit({
        windowMs: 15 * 60 * 1000,
        max: 1000,
    })
);*/

app.serveChemical();
app.use(express.static(viteDistPath));
app.use(express.static(publicPath));

app.get("*", (_req, res) => {
    res.sendFile(path.join(viteDistPath, "index.html"));
});

app.use((_req, res) => {
    res.status(404).send("404 Error!");
});

listen(PORT, () => {
    const theme = chalk.hex("#89b4fa");
    const host = chalk.hex("0d52bd");

    console.log(chalk.bold(theme(`
███████╗███████╗███╗░░██╗
╚════██║██╔════╝████╗░██║
░░███╔═╝█████╗░░██╔██╗██║
██╔══╝░░██╔══╝░░██║╚████║
███████╗███████╗██║░╚███║
╚══════╝╚══════╝╚═╝░░╚══╝
    `)));
    console.log(`${chalk.bold(host("Local System:"))} http://localhost:${chalk.bold(PORT)}`);

    try {
        console.log(`${chalk.bold(host("On Your Network:"))} http://${hostname()}:${chalk.bold(PORT)}`);
    } catch { }

    if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
        console.log(`${chalk.bold(host("Replit:"))} https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
    }

    if (process.env.HOSTNAME && process.env.GITPOD_WORKSPACE_CLUSTER_HOST) {
        console.log(`${chalk.bold(host("Gitpod:"))} https://${PORT}-${process.env.HOSTNAME}.${process.env.GITPOD_WORKSPACE_CLUSTER_HOST}`);
    }

    if (process.env.CODESPACE_NAME && process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN) {
        console.log(
            `${chalk.bold(host("Github Codespaces:"))} https://${process.env.CODESPACE_NAME}-${PORT}.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`
        );
    }
});