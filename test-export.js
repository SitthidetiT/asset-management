const ExcelJS = require('exceljs');
const fs = require('fs');

async function testExport() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Assets");

  const headers = ["A", "B", "C"];
  
  worksheet.mergeCells('A1:L1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = "AUTO - TECH SYSTEMS CO.,LTD";

  worksheet.mergeCells('A2:L2');
  const addressCell = worksheet.getCell('A2');
  addressCell.value = "Manufacturing...";

  worksheet.mergeCells('A3:L3');
  const contactCell = worksheet.getCell('A3');
  contactCell.value = "Tel : 065 789 5226...";

  worksheet.addRow([]);
  worksheet.addRow([]);

  const headerRow = worksheet.addRow(headers);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
  });

  const rowData = ["Val1", "Val2", "Val3"];
  worksheet.addRow(rowData);

  await workbook.xlsx.writeFile('test.xlsx');
  console.log("Done");
}

testExport();
