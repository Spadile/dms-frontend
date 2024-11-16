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
