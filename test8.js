const ExcelJS = require('exceljs');
const wb = new ExcelJS.Workbook();
const ws = wb.addWorksheet('Assets');
ws.addRow(['A', 'B']);
console.log(ws.columns);
