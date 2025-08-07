const chromium = require('@sparticuz/chromium');
const puppeteer = require("puppeteer");
const { generateJsonBuffer, generateCsvBuffer, generateXlsxBuffer, generatePdfBuffer } = require("./js/exportAll");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/119.0',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
];

app.get("/", (req, res) => {
    res.status(200).send({
        message: "Server funcionando",
    });
});

app.post("/buscar", async (req, res) => {
    let { cargo } = req.body;

    let browser;
    try {
        const baseURL = `https://mx.computrabajo.com/trabajo-de-${encodeURIComponent(
            cargo
        )}`;

        browser = await puppeteer.launch({
            args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--no-zygote', '--single-process'],
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        });

        const page = await browser.newPage();
        await page.setUserAgent(userAgents[Math.floor(Math.random() * userAgents.length)]);
        await page.setExtraHTTPHeaders({
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Referer': 'https://www.google.com/',
        });

        let trabajos = [];
        let pagina = 1;
        const maxPagesToScrape = 5;

        while (pagina <= maxPagesToScrape) {
            const url = pagina === 1 ? baseURL : `${baseURL}?p=${pagina}`;
            
            try {
                await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
                await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000)); // Increased and randomized delay

                const noResults = await page.evaluate(() => {
                    return document.querySelector('p.h1.fs32') && document.querySelector('p.h1.fs32').innerText.includes('Sin resultados');
                });

                if (noResults) {
                    break;
                }

                await page.waitForSelector("article a", { timeout: 15000 }); // Increased timeout
            } catch (navigationOrSelectorError) {
                break;
            }

            const enlaces = await page.$$eval("article a", (links) =>
                Array.from(
                    new Set(
                        links
                            .map((link) => link.href)
                            .filter((href) => href.includes("/ofertas-de-trabajo/"))
                    )
                )
            );

            if (enlaces.length === 0) {
                break;
            }

            const processLinks = async (links) => {
                const CONCURRENCY_LIMIT = 5;
                const results = [];
                const pages = [];
            
                for (let i = 0; i < links.length; i += CONCURRENCY_LIMIT) {
                    const batch = links.slice(i, i + CONCURRENCY_LIMIT);
                    const batchPromises = batch.map(async (enlace) => {
                        const newPage = await browser.newPage();
                        pages.push(newPage);
                        try {
                            await newPage.setUserAgent(userAgents[Math.floor(Math.random() * userAgents.length)]);
                            await newPage.goto(enlace, {
                                waitUntil: "domcontentloaded",
                                timeout: 45000, // Increased timeout
                            });
                            await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000)); // Increased and randomized delay
            
                            const datos = await newPage.evaluate(() => {
                                const textoSelector = (sel) =>
                                    document.querySelector(sel)?.innerText.trim() ||
                                    "No disponible";
            
                                const ubicacionTexto = textoSelector(
                                    "main.detail_fs > div.container > p.fs16"
                                );
                                const empresa_ubi = ubicacionTexto.split(" - ");
                                const location = empresa_ubi[1] ? empresa_ubi[1].trim() : "No disponible";
                                const empresa = empresa_ubi[0] ? empresa_ubi[0].trim() : "No disponible";
            
                                const descripcion = textoSelector(
                                    "div.container > div.box_detail.fl.w100_m > div.mb40.pb40.bb1 > p.mbB"
                                );
                                const descrip = descripcion.replace(/\n/g, " ").trim();
            
                                const salarioMatch = document.body.innerText.match(/\$\s*[\d.,]+\s*(?:a\s*|por\s*)?(?:mes|año|hora)?/i);
                                const salario = salarioMatch ? salarioMatch[0].trim() : "No especificado";
            
                                let fechaPublicacion = "No disponible";
                                const dateElement1 = document.querySelector('p.fs13.fc.aux_mt15');
                                const dateElement2 = document.querySelector('div.box_detail.fl.w100_m > div.mbB.fs16');
                                const dateElement3 = document.querySelector('span.date');
            
                                if (dateElement1) {
                                    fechaPublicacion = dateElement1.innerText.trim();
                                } else if (dateElement2) {
                                    fechaPublicacion = dateElement2.innerText.trim();
                                } else if (dateElement3) {
                                    fechaPublicacion = dateElement3.innerText.trim();
                                } else {
                                    const pageText = document.body.innerText;
                                    const dateRegex = /(hace\s+\d+\s+(?:hora|horas|día|días|mes|meses|año|años))|(\d{1,2}\/\d{1,2}\/\d{2,4})|(\d{1,2}\s+de\s+\w+\s+de\s+\d{4})/i;
                                    const match = pageText.match(dateRegex);
                                    if (match && match[0]) {
                                        fechaPublicacion = match[0].trim();
                                    }
                                }
            
                                return {
                                    titulo: textoSelector("h1"),
                                    empresa: empresa,
                                    ubicacion: location,
                                    salario: salario,
                                    descripcion: descrip,
                                    url: window.location.href,
                                    fechaPublicacion: fechaPublicacion,
                                };
                            });
                            return datos;
            
                        } catch (err) {
                            return null;
                        } finally {
                            await newPage.close();
                        }
                    });
            
                    const batchResults = await Promise.all(batchPromises);
                    results.push(...batchResults.filter(result => result !== null));
                }
            
                // Removed the extra page close loop as it's now in the finally block
                return results;
            };

            const newJobs = await processLinks(enlaces);
            trabajos.push(...newJobs);

            pagina++;
        }

        res.status(200).send({
            offers: trabajos,
            totalResultsCount: trabajos.length,
            message: "Scrapeo realizado con exito",
        });
    } catch (error) {
        res.status(500).send({
            message: `Error en el scraping: ${error.message || error}`,
        });
    } finally {
        if (browser) {
            await browser.close();
        }
    }
});

app.post('/export/:format', async (req, res) => {
    const { format } = req.params;
    const { offers, searchTerm } = req.body;

    if (!offers || !Array.isArray(offers) || offers.length === 0) {
        return res.status(400).send('No se proporcionaron datos válidos para exportar.');
    }

    const cleanedSearchTerm = searchTerm
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_.-]/g, "");
    const filename = `ofertas_${cleanedSearchTerm}_${new Date().toISOString().split('T')[0]}.${format}`;

    try {
        let buffer;
        let contentType;

        switch (format) {
            case 'json':
                buffer = generateJsonBuffer(offers);
                contentType = 'application/json';
                break;
            case 'csv':
                buffer = generateCsvBuffer(offers);
                contentType = 'text/csv';
                break;
            case 'xlsx':
                buffer = generateXlsxBuffer(offers);
                contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                break;
            case 'pdf':
                buffer = await generatePdfBuffer(offers, searchTerm);
                contentType = 'application/pdf';
                break;
            default:
                return res.status(400).send('Formato de exportación no soportado.');
        }

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(buffer);

    } catch (error) {
        res.status(500).send(`Error al generar el archivo ${format}.`);
    }
});

app.listen(port, () => {
});
