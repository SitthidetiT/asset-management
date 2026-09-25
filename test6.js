const ExcelJS = require('exceljs');

async function generateExact() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Assets");

  worksheet.mergeCells('A1:L1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = "AUTO - TECH SYSTEMS CO.,LTD";
  titleCell.font = { name: 'Arial', size: 24, bold: true, italic: true, color: { argb: 'FFFF0000' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells('A2:L2');
  const addressCell = worksheet.getCell('A2');
  addressCell.value = "Manufacturing : 58/2,58/71 Moo 9 T.Raikhing A.Samphran Nakornpathom 73210 Thailand (Head Office)";
  addressCell.font = { name: 'Arial', size: 10, bold: true };
  addressCell.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells('A3:L3');
  const contactCell = worksheet.getCell('A3');
  contactCell.value = "Tel : 065 789 5226 E-Mail : ats@auto-techsystems.com Mobile : (081 777 1669) TAX: 0735556004823";
  contactCell.font = { name: 'Arial', size: 10, bold: true };
  contactCell.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.getRow(1).height = 30;
  worksheet.getRow(2).height = 20;
  worksheet.getRow(3).height = 20;

  worksheet.addRow([]);
  worksheet.addRow([]); // Blank rows for spacing

  const headers = ["รหัสทรัพย์สิน", "ชื่อทรัพย์สิน", "หมวดหมู่"];
  const headerRow = worksheet.addRow(headers);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } };
    cell.border = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' }
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  const rowData = ["MEA-F1-001", "Vernier", "Measuring"];
  const row = worksheet.addRow(rowData);
  row.eachCell((cell) => {
    cell.border = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' }
    };
  });

  await workbook.xlsx.writeFile('test6.xlsx');
  console.log("Done test6");
}
generateExact();
