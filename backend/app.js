const puppeteer = require("puppeteer-extra"); 
const StealthPlugin = require("puppeteer-extra-plugin-stealth"); 
const { generateJsonBuffer, generateCsvBuffer, generateXlsxBuffer, generatePdfBuffer } = require("./js/exportAll"); 

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

puppeteer.use(StealthPlugin());

const app = express();
const port = process.env.PORT || 3001;

const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'];

const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
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

        const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath();
        
        browser = await puppeteer.launch({
            headless: true, 
            executablePath: executablePath,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-gpu',
                '--no-first-run',
                '--no-zygote',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-features=site-per-process',
                '--disable-site-isolation-trials',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process',
                '--blink-settings=imagesEnabled=false',
                '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                '--disable-cache'
            ],
            dumpio: true,
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

        let trabajos = [];
        let pagina = 1;
        const maxPagesToScrape = 5;

        while (pagina <= maxPagesToScrape) {
            const url = pagina === 1 ? baseURL : `${baseURL}?p=${pagina}`;
            console.log(`Visitando página de listados: ${url}`);

            try {
                await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 }); 
                await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));

                await page.waitForSelector("article a", { timeout: 10000 });
            } catch (navigationOrSelectorError) {
                console.warn(`No más páginas o selector no encontrado en ${url}: ${navigationOrSelectorError.message}`);
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
                console.log(
                    "No hay más ofertas en esta página o los enlaces no fueron detectados, fin del scraping."
                );
                break;
            }

            for (const enlace of enlaces) {
                console.log(`Extrayendo datos de: ${enlace}`);
                
                try {
                    await page.goto(enlace, {
                        waitUntil: "domcontentloaded",
                        timeout: 30000,
                    });
                    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

                    const datos = await page.evaluate(() => {
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

                    trabajos.push(datos);

                } catch (err) {
                    console.warn(
                        `Error al extraer datos de ${enlace}: ${err.message}`
                    );
                }
            }

            pagina++;
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
