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

export const renameFiles = (files) => {
  return files?.map((file, i) => {
    const fileExtension = file?.name.split(".").pop() || ""; // Extract file extension
    let baseName = file?.name
      .replace(`.${fileExtension}`, "")
      .replace(/\.$/, ""); // Remove extension

    // Match leading number in filename (e.g., "2_filetype_lkmsdf_" -> "2")
    const leadingNumberMatch = baseName.match(/^(\d+)_/);

    if (leadingNumberMatch) {
      // Replace existing leading number with new index (i + 1)
      baseName = baseName.replace(/^(\d+)_/, `${i + 1}_`);
    } else {
      // If no leading number, prepend the index
      baseName = `${i + 1}_${baseName}`;
    }

    const renamedFileName = `${baseName}.${fileExtension}`;

    // Create a new File object while preserving original properties
    const renamedFile = new File([file], renamedFileName, {
      type: file.type,
      lastModified: file.lastModified,
    });

    return {
      ...renamedFile, // Spread original File properties
      preview: file.preview, // Preserve preview if available
      path: file.path ?? `./${renamedFileName}`, // Default path if missing
      relativePath: file.relativePath ?? `./${renamedFileName}`, // Default relative path if missing
      lastModified: file.lastModified,
      lastModifiedDate: new Date(file.lastModified),
      size: file.size,
      type: file.type,
      name: renamedFileName, // Ensure new name is correctly assigned
    };
  });
};
