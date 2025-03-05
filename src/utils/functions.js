export const formatFileSize = (sizeInBytes) => {
  const sizeInKB = sizeInBytes / 1024;
  const sizeInMB = sizeInKB / 1024;

  if (sizeInKB < 1024) {
    return `${sizeInKB.toFixed(2)} KB`; // 2 decimal places for clarity
  } else {
    return `${sizeInMB.toFixed(2)} MB`; // 2 decimal places for clarity
  }
};

export const formatFileSizeNumber = (sizeInBytes) => {
  const sizeInKB = sizeInBytes / 1024;
  const sizeInMB = sizeInKB / 1024;

  return sizeInMB.toFixed(2); // 2 decimal places for clarity
};

export const convertToUnderscore = (input) => {
  return input.trim().replace(/\s+/g, "_");
};

export const renameFiles = async (files) => {
  return Promise.all(
    files?.map(async (file, index) => {
      const fileExtension = file.name.split(".").pop() || "";
      let baseName = file.name
        .replace(`.${fileExtension}`, "")
        .replace(/\.$/, "");

      // Update numbering in filename
      baseName = baseName.replace(/^(\d+)_/, `${index + 1}_`);

      const renamedFileName = `${baseName}.${fileExtension}`;

      // Ensure `file` is an instance of `File`
      let fileContent;
      if (file instanceof File) {
        fileContent = await file.arrayBuffer();
      } else if (file.originalFile instanceof File) {
        fileContent = await file.originalFile.arrayBuffer();
      } else {
        console.error("Invalid file format:", file);
        return file; // Return the original file if not valid
      }

      // Create a new File object while preserving type and lastModified
      const renamedFile = new File([fileContent], renamedFileName, {
        type: file.type,
        lastModified: file.lastModified,
      });

      return {
        ...file, // Preserve existing properties
        ...renamedFile, // Use the new renamed file object properly
        preview: file.preview, // Keep the preview intact
        path: `./${renamedFileName}`, // Update path with new name
        relativePath: `./${renamedFileName}`, // Update relative path
        name: renamedFileName, // Ensure new name is used
      };
    })
  );
};
