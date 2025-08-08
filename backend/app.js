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

app.get("/", (req, res) => {
    res.status(200).send({
        message: "Server funcionando",
    });
});

app.post("/buscar", async (req, res) => {
    const { cargo } = req.body;
    let browser;

    try {
        const baseURL = `https://mx.computrabajo.com/trabajo-de-${encodeURIComponent(cargo)}`;

        console.log(`:::::::: Buscando trabajos de "${cargo}" ::::::::::`);

        browser = await puppeteer.launch({
            args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        });

    
        const listPage = await browser.newPage();
        await listPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await listPage.setExtraHTTPHeaders({
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

            await listPage.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));

            const noResults = await listPage.evaluate(() => {
                return document.querySelector('p.h1.fs32') && document.querySelector('p.h1.fs32').innerText.includes('Sin resultados');
            });

            if (noResults) {
                console.log("No more results found. Stopping search.");
                break;
            }

            const enlaces = await listPage.evaluate(() => {
                const links = Array.from(document.querySelectorAll('a.js-o-link'));
                return links.map((link) => link.href);
            });

            if (enlaces.length === 0) {
                console.log(`No links found on page ${pagina}. Stopping search.`);
                break;
            }

            allEnlaces.push(...enlaces);
            pagina++;
        }

        await listPage.close(); 
        console.log(`Enlaces totales para extraer: ${allEnlaces.length}`);

        const trabajos = [];
        const concurrencyLimit = 5; 

        
        const scrapeDetailPage = async (browser, url) => {
            const detailPage = await browser.newPage();
            try {
                await detailPage.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
                const datos = await detailPage.evaluate(() => {
                    const getText = (selector) =>
                        document.querySelector(selector)?.innerText.trim() || "No disponible";

                    const ubicacionTexto = getText("main.detail_fs > div.container > p.fs16");
                    const [empresa, location] = ubicacionTexto.split(" - ").map(s => s.trim());

                    const descripcion = getText("div.container > div.box_detail.fl.w100_m > div.mb40.pb40.bb1 > p.mbB").replace(/\n/g, " ").trim();

                    const salarioMatch = document.body.innerText.match(/\$\s*[\d.,]+\s*(?:a\s*|por\s*)?(?:mes|año|hora)?/i);
                    const salario = salarioMatch ? salarioMatch[0].trim() : "No especificado";

                    let fechaPublicacion = "No disponible";
                    const dateElement = document.querySelector('p.fs13.fc.aux_mt15') ||
                                        document.querySelector('div.box_detail.fl.w100_m > div.mbB.fs16') ||
                                        document.querySelector('span.date');

                    if (dateElement) {
                        fechaPublicacion = dateElement.innerText.trim();
                    } else {
                        const pageText = document.body.innerText;
                        const dateRegex = /(hace\s+\d+\s+(?:hora|horas|día|días|mes|meses|año|años))|(\d{1,2}\/\d{1,2}\/\d{2,4})|(\d{1,2}\s+de\s+\w+\s+de\s+\d{4})/i;
                        const match = pageText.match(dateRegex);
                        if (match && match[0]) {
                            fechaPublicacion = match[0].trim();
                        }
                    }

                    return {
                        titulo: getText("h1"),
                        empresa: empresa || "No disponible",
                        ubicacion: location || "No disponible",
                        salario: salario,
                        descripcion: descripcion,
                        url: window.location.href,
                        fechaPublicacion: fechaPublicacion,
                    };
                });
                return datos;
            } catch (err) {
                console.warn(`Error al extraer datos de ${url}: ${err.message}`);
                return null; 
            } finally {
                await detailPage.close();
            }
        };

       
        const promises = allEnlaces.map(enlace => scrapeDetailPage(browser, enlace));
        const allJobs = await Promise.all(promises);
        const validJobs = allJobs.filter(job => job !== null);

        res.status(200).send({
            offers: validJobs,
            totalResultsCount: validJobs.length,
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
        console.error(`Error al generar o enviar el archivo ${format}:`, error);
        res.status(500).send(`Error al generar el archivo ${format}.`);
    }
});

app.listen(port, () => {
    console.log(`Server running in http://localhost:${port}`);
});
