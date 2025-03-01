import * as XLSX from "xlsx";
import mammoth from "mammoth";
import unknownImage from "../assets/other/documents.png";
import eml from "../assets/other/eml.jpg";
import mbox from "../assets/other/mbox.png";
import msg from "../assets/other/msg.png";
import pst from "../assets/other/pst.png";
import dot from "../assets/other/dot.png";
import odt from "../assets/other/odt.png";

import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";

export const generatePreview = async (file) => {
  const fileName = file.name.toLowerCase();
  const fileType = file.type || ""; // Ensure file.type is always defined
  // Image files
  if (fileType.startsWith("image/") || fileType === "application/pdf") {
    return {
      type: fileType.startsWith("image/") ? "image" : "pdf",
      data: URL.createObjectURL(file),
    };
  }
  // Special document formats (dot, dotx, docm, dotm)
  if (fileName.endsWith(".dot")) return { type: "image", data: dot };

  // Email formats
  if (
    [".eml", ".msg", ".mbox", ".pst", ".odt"].some((ext) =>
      fileName.endsWith(ext)
    )
  ) {
    // Extract the file extension correctly
    const ext = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();

    return {
      type: "image",
      data:
        {
          ".eml": eml,
          ".msg": msg,
          ".mbox": mbox,
          ".pst": pst,
          ".odt": odt,
        }[ext] || null, // Default to null if extension is not found
    };
  }

  if ([".dotx", ".docm", ".dotm"].some((ext) => fileName.endsWith(ext))) {
    const parsedData = await parseSpclDocument(file);
    return { type: "text", data: convertWordXmlToPlainText(parsedData) };
  }
  // Excel & CSV files
  if (
    [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "application/vnd.ms-excel.sheet.macroEnabled.12", // .xlsm
      "application/vnd.oasis.opendocument.spreadsheet", // .ods
      // "application/vnd.oasis.opendocument.text", // .odt (Added)
      "text/csv",
    ].includes(fileType)
  ) {
    return { type: "table", data: await parseExcelOrCSV(file) };
  }
  // Word & Text files
  if (
    [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "application/msword", // .doc
      "text/plain", // .txt
      // "application/vnd.oasis.opendocument.text", // .odt (Added)
      "application/msword.template.macroEnabled.12", // .dots (Added)
    ].includes(fileType)
  ) {
    return { type: "text", data: await parseDocument(file) };
  }

  // Default case: Unknown file type
  return { type: "image", data: unknownImage };
};

const parseExcelOrCSV = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      let arrayBuffer = e.target.result; // Store file data
      let data = null;

      try {
        const workbook = XLSX.read(new Uint8Array(arrayBuffer), {
          type: "array",
        });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Cleanup: Explicitly clear objects for garbage collection
        workbook.Sheets = null;
        workbook.SheetNames = null;
      } catch (error) {
        reader.abort(); // Abort reader to free memory in case of an error
        reject(error);
        return;
      } finally {
        arrayBuffer = null; // Free up memory
      }

      resolve(data);
    };

    reader.onerror = () => {
      reader.abort(); // Abort reader to free memory on error
      reject(reader.error);
    };

    // 🚀 **REMOVED `reader.onloadend` to fix the issue!**

    reader.readAsArrayBuffer(file); // Read file as ArrayBuffer
  });
};

const parseDocument = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      let content = e.target.result; // Store file content
      let extractedText = null;

      try {
        if (
          file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          // Process .docx files using Mammoth
          const { value } = await mammoth.extractRawText({
            arrayBuffer: content,
          });
          extractedText = value;
        } else if (file.type === "text/plain") {
          // Process .txt files
          extractedText = content;
        } else {
          extractedText = content; // Handle other formats
        }

        // Cleanup: Explicitly clear variables for garbage collection
        resolve(extractedText);
      } catch (error) {
        reader.abort(); // Abort the reader in case of an error
        reject(error);
      } finally {
        content = null; // Free up memory
      }
    };

    reader.onerror = () => {
      reader.abort(); // Abort reader to free memory on error
      reject(reader.error);
    };

    // 🚀 **REMOVED `reader.onloadend` to fix the issue!**

    // Use readAsText for .txt files and readAsArrayBuffer for .docx files
    if (file.type === "text/plain") {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
};

export const parseSpclDocument = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      let content = e.target.result;
      let parsedXml = null; // Temporary storage

      try {
        if (
          file.name.endsWith(".dotx") ||
          file.name.endsWith(".dotm") ||
          file.name.endsWith(".docm")
        ) {
          const zip = await JSZip.loadAsync(content);
          let xmlContent = await zip.file("word/document.xml").async("text");

          // Parse XML content
          const parser = new XMLParser();
          parsedXml = parser.parse(xmlContent);

          // Free up memory
          zip.files = {};
          content = null;
          xmlContent = null;
        } else if (file.type === "text/plain") {
          parsedXml = content;
        } else {
          parsedXml = content;
        }

        resolve(parsedXml);
      } catch (error) {
        reader.abort(); // Abort reading process to free memory
        reject(error);
      }
    };

    reader.onerror = () => {
      reader.abort(); // Abort reading in case of an error
      reject(reader.error);
    };

    // Read the file as ArrayBuffer for binary formats
    if (file.type === "text/plain") {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
};

const convertWordXmlToPlainText = (data) => {
  try {
    if (!data || !data["w:document"] || !data["w:document"]["w:body"]) {
      return "No content found.";
    }

    const body = data["w:document"]["w:body"];
    let plainText = [];

    if (Array.isArray(body["w:p"])) {
      body["w:p"].forEach((paragraph) => {
        let paragraphText = [];

        if (Array.isArray(paragraph["w:r"])) {
          paragraph["w:r"].forEach((run) => {
            if (typeof run["w:t"] === "string") {
              paragraphText.push(run["w:t"]);
            }
          });
        } else if (
          typeof paragraph["w:r"] === "object" &&
          paragraph["w:r"]["w:t"]
        ) {
          paragraphText.push(paragraph["w:r"]["w:t"]);
        }

        plainText.push(paragraphText.join(" "));
      });
    }

    // Free XML object from memory
    data["w:document"] = null;

    return plainText.join("\r\n");
  } catch (error) {
    console.error("Error converting to plain text:", error);
    return "Error processing document.";
  }
};
