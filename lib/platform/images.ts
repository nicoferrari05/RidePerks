import "server-only";

// Reads an uploaded image and checks its real format from the first bytes
// (never the file name or the browser's type). JPG, PNG or WebP only.
export async function readImage(file: FormDataEntryValue | null, maxBytes: number) {
  if (!(file instanceof File) || file.size === 0 || file.size > maxBytes)
    return null;
  const bytes = Buffer.from(await file.arrayBuffer());
  const jpg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const png = bytes
    .subarray(0, 8)
    .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const webp =
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP";
  if (!jpg && !png && !webp) return null;
  return {
    bytes,
    ext: jpg ? "jpg" : png ? "png" : "webp",
    contentType: jpg ? "image/jpeg" : png ? "image/png" : "image/webp",
  };
}
