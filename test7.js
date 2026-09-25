const ExcelJS = require('exceljs');
const fs = require('fs');
(async () => {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('test6.xlsx');
  await wb.csv.writeFile('test6.csv');
  console.log(fs.readFileSync('test6.csv', 'utf8'));
})();
