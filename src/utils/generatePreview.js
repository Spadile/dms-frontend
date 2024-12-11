import * as XLSX from "xlsx";
import mammoth from "mammoth";
import unknownImage from "../assets/other/documents.png";

export const generatePreview = async (file) => {
  if (file?.type.startsWith("image/")) {
    // Preview for images
    return { type: "image", data: URL.createObjectURL(file) };
  } else if (file?.type === "application/pdf") {
    // Preview for PDFs
    return { type: "pdf", data: URL.createObjectURL(file) };
  } else if (
    file?.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || // .xlsx
    file?.type === "application/vnd.ms-excel" || // .xls
    file?.type === "application/vnd.ms-excel.sheet.macroEnabled.12" || // .xlsm
    file?.type === "application/vnd.oasis.opendocument.spreadsheet" || // .ods
    file?.type === "text/csv"
  ) {
    // Parse Excel or CSV files
    const data = await parseExcelOrCSV(file);
    return { type: "table", data }; // Return as table data
  } else if (
    file?.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || // .docx
    file?.type === "application/msword" || // .doc
    file?.type === "text/plain" // .txt
  ) {
    // Parse Word or text files
    const data = await parseDocument(file);
    return { type: "text", data }; // Return as text content
  } else {
    // Fallback for unknown formats
    return { type: "unknown", data: unknownImage };
  }
};

const parseExcelOrCSV = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target.result;
      const workbook = XLSX.read(new Uint8Array(arrayBuffer), {
        type: "array",
      });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // 2D array of data
      resolve(data);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file); // Use ArrayBuffer instead
  });
};

const parseDocument = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      const content = e.target.result;

      // Check if the file is a .docx file
      if (
        file?.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        // Parse .docx files using Mammoth
        const { value } = await mammoth.extractRawText({
          arrayBuffer: content,
        });
        resolve(value); // Extracted text from the .docx file
      } else if (file?.type === "text/plain") {
        // For .txt files, read as text directly
        resolve(content); // Content is a string already
      } else {
        // For other types (like .doc), you can handle them as needed
        resolve(content);
      }
    };

    reader.onerror = () => reject(reader.error);

    // Use readAsText for .txt files and readAsArrayBuffer for .docx files or other formats
    if (file.type === "text/plain") {
      reader.readAsText(file); // Read text files as plain text
    } else {
      reader.readAsArrayBuffer(file); // Read .docx and other files as array buffers
    }
  });
};
