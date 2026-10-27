import { open } from "node:fs/promises";

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG_SIGNATURE = Buffer.from([0xff, 0xd8, 0xff]);

export async function detectImageType(filePath: string): Promise<string | null> {
  const file = await open(filePath, "r");
  try {
    const { buffer } = await file.read(Buffer.alloc(8), 0, 8, 0);

    if (buffer.subarray(0, 8).equals(PNG_SIGNATURE)) return "image/png";
    if (buffer.subarray(0, 3).equals(JPEG_SIGNATURE)) return "image/jpeg";
    return null;
  } finally {
    await file.close();
  }
}
