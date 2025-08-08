const chromium = require('@sparticuz/chromium');
const puppeteer = require("puppeteer-core");
const { generateJsonBuffer, generateXlsxBuffer, generatePdfBuffer, generateCsvBuffer } = require("./js/exportAll");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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

        console.log(`:::::::: Buscando trabajos de "${cargo}" ::::::::::`);

        browser = await puppeteer.launch({
            args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setExtraHTTPHeaders({
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-US,en;q=0.9',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Referer': 'https://www.google.com/',
        });

        let allEnlaces = [];
        let pagina = 1;
        const maxPagesToScrape = 5;

        while (pagina <= maxPagesToScrape) {
            const url = pagina === 1 ? baseURL : `${baseURL}?p=${pagina}`;
            console.log(`Visitando página de listados: ${url}`);

            try {
                await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
                await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));

                const noResults = await page.evaluate(() => {
                    return document.querySelector('p.h1.fs32') && document.querySelector('p.h1.fs32').innerText.includes('Sin resultados');
                });
                if (noResults) {
                    console.log("No se encontraron más resultados. Deteniendo el raspado.");
                    break;
                }

                const enlaces = await page.evaluate(() => {
                    const links = Array.from(document.querySelectorAll('div.js-job-item > header > h2 > a'));
                    return links.map(a => a.href);
                });

                if (enlaces.length === 0) {
                    console.log(`No se encontraron enlaces en la página ${pagina}. Deteniendo el raspado.`);
                    break;
                }

                allEnlaces.push(...enlaces);
                pagina++;
            } catch (err) {
                console.warn(`Error al ir a la página de listados ${url}: ${err.message}`);
                break;
            }
        }

        await page.close();

        console.log(`Enlaces totales para extraer: ${allEnlaces.length}`);

        const trabajos = [];
        const concurrencyLimit = 5;

        const scrapeDetailPage = async (url) => {
            const detailPage = await browser.newPage();
            try {
                await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
                await detailPage.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

                const datos = await detailPage.evaluate(() => {
                    const textoSelector = (sel) =>
                        document.querySelector(sel)?.innerText.trim() ||
                        "No disponible";

                    const titulo = textoSelector('div.box_detail_fs > h1');
                    const empresa = textoSelector('div.box_detail_fs > p.fs18');
                    const ubicacion = textoSelector('div.box_detail_fs > p.fs16');
                    const descripcionElement = document.querySelector('div.mbB.fs16');
                    const descripcion = descripcionElement ? descripcionElement.innerText.trim() : "";
                    const descrip = descripcion.replace(/\n/g, " ").trim();

                    const salarioElement = document.querySelector('span.salario');
                    const salario = salarioElement ? salarioElement.innerText.trim() : "No especificado";
                    
                    const fechaElement = document.querySelector('p.fs13.fc.aux_mt15');
                    const fechaPublicacion = fechaElement ? fechaElement.innerText.trim() : "No disponible";
                
                    return {
                        titulo,
                        empresa,
                        ubicacion,
                        salario,
                        descripcion: descrip,
                        url: window.location.href,
                        fechaPublicacion,
                    };
                });
                return datos;
            } catch (err) {
                console.warn(`Error al extraer datos de ${url}: ${err.message}`);
                return null;
            } finally {
                if (detailPage && !detailPage.isClosed()) {
                    await detailPage.close();
                }
            }
        };

        const chunks = [];
        for (let i = 0; i < allEnlaces.length; i += concurrencyLimit) {
            chunks.push(allEnlaces.slice(i, i + concurrencyLimit));
        }

        for (const chunk of chunks) {
            const pagePromises = chunk.map(enlace => scrapeDetailPage(enlace));
            const results = await Promise.all(pagePromises);
            trabajos.push(...results.filter(Boolean));
        }

        res.status(200).send({
            offers: trabajos,
            totalResultsCount: trabajos.length,
            message: "::::::::::::: Scrapeo realizado con exito ::::::::::::::",
        });
    } catch (error) {
        console.error("Error global durante el scraping:", error);
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
                res.setHeader('Content-Type', contentType);
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                res.send(buffer);
                break;
            case 'csv':
                contentType = 'text/csv';
                res.setHeader('Content-Type', contentType);
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                buffer = generateCsvBuffer(offers);
                res.send(buffer);
                break;
            case 'xlsx':
                contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                res.setHeader('Content-Type', contentType);
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                buffer = generateXlsxBuffer(offers);
                res.send(buffer);
                break;
            case 'pdf':
                buffer = await generatePdfBuffer(offers, searchTerm);
                contentType = 'application/pdf';
                res.setHeader('Content-Type', contentType);
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                res.send(buffer);
                break;
            default:
                return res.status(400).send('Formato de exportación no soportado.');
        }

    } catch (error) {
        console.error(`Error al generar o enviar el archivo ${format}:`, error);
        res.status(500).send(`Error al generar el archivo ${format}.`);
    }
});

app.listen(port, () => {
    console.log(`Server running in http://localhost:${port}`);
});
