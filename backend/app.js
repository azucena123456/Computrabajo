const puppeteer = require("puppeteer");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const { generateJsonBuffer, generateCsvBuffer, generateXlsxBuffer, generatePdfBuffer } = require("./js/exportAll");

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/scrape", async (req, res) => {
  const { puesto } = req.body;

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const enlaces = [];

  for (let pageIndex = 1; pageIndex <= 5; pageIndex++) {
    const url = `https://mx.computrabajo.com/trabajo-de-${puesto}?p=${pageIndex}`;
    await page.goto(url, { waitUntil: "domcontentloaded" });

    try {
      await page.waitForSelector("a.js-o-link", { timeout: 10000 });
    } catch {
      break;
    }

    const nuevosEnlaces = await page.$$eval("a.js-o-link", (links) =>
      Array.from(new Set(
        links.map((link) => link.href).filter((href) => href.includes("/ofertas-de-trabajo/"))
      ))
    );

    if (nuevosEnlaces.length === 0) break;

    enlaces.push(...nuevosEnlaces);
  }

  const ofertas = [];

  for (const enlace of enlaces) {
    try {
      await page.goto(enlace, { waitUntil: "domcontentloaded" });

      const titulo = await page.$eval("h1", (el) => el.innerText.trim());
      const empresa = await page.$eval("div[data-qa='job-detail-company']", (el) => el.innerText.trim());
      const salario = await page.$eval("div[data-qa='salary-label']", (el) => el.innerText.trim());
      const ubicacion = await page.$eval("div[data-qa='location-label']", (el) => el.innerText.trim());

      ofertas.push({ titulo, empresa, salario, ubicacion, enlace });
    } catch {}
  }

  await browser.close();

  const jsonBuffer = generateJsonBuffer(ofertas);
  const csvBuffer = generateCsvBuffer(ofertas);
  const xlsxBuffer = await generateXlsxBuffer(ofertas);
  const pdfBuffer = await generatePdfBuffer(ofertas);

  fs.writeFileSync("ofertas.json", jsonBuffer);
  fs.writeFileSync("ofertas.csv", csvBuffer);
  fs.writeFileSync("ofertas.xlsx", xlsxBuffer);
  fs.writeFileSync("ofertas.pdf", pdfBuffer);

  res.json({ success: true, message: "Scraping completado", count: ofertas.length });
});

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
