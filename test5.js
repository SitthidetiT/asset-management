const ExcelJS = require('exceljs');
(async () => {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('test.xlsx');
  const ws = wb.worksheets[0];
  ws.eachRow((row, rowNumber) => {
    console.log('Row ' + rowNumber + ' = ' + JSON.stringify(row.values));
  });
})();
