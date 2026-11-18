import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

/** Saves text to a file in the cache and opens the share sheet for it. */
export async function shareTextFile(name: string, text: string, mimeType: string) {
  const file = new File(Paths.cache, name);
  file.create({ overwrite: true });
  file.write(text);
  if (!(await Sharing.isAvailableAsync()))
    throw new Error("Este dispositivo no permite compartir archivos.");
  await Sharing.shareAsync(file.uri, { mimeType, dialogTitle: name });
}
