import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

// Photos picked on the phone are shrunk before they go up (long side at
// most 1600px, JPEG): they upload fast on mobile data and stay well under
// the server's limits (5 MB verification, 2 MB business media).

export type PickedImage = { uri: string; name: string; type: "image/jpeg" };

export async function pickImage(name: string): Promise<PickedImage | null> {
  const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 1 });
  if (picked.canceled || !picked.assets[0]) return null;
  const asset = picked.assets[0];
  const context = ImageManipulator.manipulate(asset.uri);
  if (Math.max(asset.width, asset.height) > 1600)
    context.resize(asset.width >= asset.height ? { width: 1600 } : { height: 1600 });
  const image = await context.renderAsync();
  const saved = await image.saveAsync({ compress: 0.75, format: SaveFormat.JPEG });
  return { uri: saved.uri, name, type: "image/jpeg" };
}

/** A picked image as a multipart field (React Native's fetch reads the file). */
export function imagePart(image: PickedImage) {
  return image as unknown as Blob;
}
