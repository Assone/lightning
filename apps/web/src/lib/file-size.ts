export const formatBytes = (bytes?: number): string => {
  if (bytes === undefined) {
    return "-";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ["KB", "MB", "GB", "TB"] as const;
  let remaining = bytes;
  let unitIndex = -1;

  while (remaining >= 1024 && unitIndex < units.length - 1) {
    remaining /= 1024;
    unitIndex += 1;
  }

  return `${remaining.toFixed(1)} ${units[unitIndex]}`;
};
