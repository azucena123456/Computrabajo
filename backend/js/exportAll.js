const { Parser } = require("json2csv");
const XLSX = require("xlsx");
const PDFDocument = require("pdfkit"); 

const generateJsonBuffer = (data) => {
    return Buffer.from(JSON.stringify(data, null, 2), 'utf-8');
};

const generateCsvBuffer = (data) => {
    const fields = Object.keys(data[0] || {});
    const parser = new Parser({ fields });
    return Buffer.from(parser.parse(data), 'utf-8');
};

const generateXlsxBuffer = (data) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Trabajos");
    return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
};

const generatePdfBuffer = (data, searchTerm) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 30 });
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            resolve(Buffer.concat(buffers));
        });
        doc.on('error', reject);

        doc.fontSize(20).text(`Ofertas de Trabajo para "${searchTerm}"`, { align: "center" }).moveDown();
        doc.fontSize(10).text(`Fecha de exportación: ${new Date().toLocaleDateString()}`, { align: "center" }).moveDown();

        data.forEach((t, i) => {
            doc
                .fontSize(12)
                .text(`Trabajo ${i + 1}:`, { underline: true })
                .text(`Título: ${t.titulo || 'N/A'}`)
                .text(`Empresa: ${t.empresa || 'N/A'}`)
                .text(`Ubicación: ${t.ubicacion || 'N/A'}`)
                .text(`Salario: ${t.salario || 'No especificado'}`)
                .text(`Fecha de Publicación: ${t.fechaPublicacion || 'No disponible'}`)
                .text(`Descripción: ${t.descripcion ? t.descripcion.substring(0, 500) + (t.descripcion.length > 500 ? '...' : '') : 'No disponible'}`)
                .text(`URL: ${t.url || 'N/A'}`)
                .moveDown();
        });

        doc.end();
    });
};

module.exports = {
    generateJsonBuffer,
    generateCsvBuffer,
    generateXlsxBuffer,
    generatePdfBuffer
};