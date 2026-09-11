type BlobUrl = `blob:${string}`;

export const isBlob = (str: string | null): str is BlobUrl =>
  str?.startsWith("blob:") || false;
