import type { IconName } from "@mekari/pixel3";
import type { AttachmentDraft, LibraryFileType } from "~/data/types";
import { createId } from "~/utils/ids";

/** How each kind of file is labelled and drawn, in the Library and on messages. */
export const FILE_TYPES: Record<LibraryFileType, { label: string; icon: IconName }> = {
  pdf: { label: "PDF", icon: "pdf" },
  image: { label: "Image", icon: "file-image" },
  zip: { label: "ZIP archive", icon: "zip" },
  design: { label: "Figma file", icon: "image-document" },
  document: { label: "Document", icon: "doc" }
};

/** Best guess from the name and the browser's type: "brief.pdf" → "pdf". */
function fileTypeOf(name: string, mimeType: string): LibraryFileType {
  const extension = name.split(".").pop()?.toLowerCase() ?? "";
  if (extension === "pdf") return "pdf";
  if (mimeType.startsWith("image/")) return "image";
  if (["zip", "rar", "7z"].includes(extension)) return "zip";
  if (["fig", "sketch", "xd"].includes(extension)) return "design";
  return "document";
}

/** "820 KB", "2.4 MB" */
function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Types the Library can show in its preview panel. */
export const PREVIEWABLE: LibraryFileType[] = ["pdf", "image"];

/**
 * The prototype has nowhere to upload to, so it keeps the name, type and size. PDFs and
 * images also keep an object URL so they can be previewed until the page reloads.
 */
export function toAttachmentDraft(file: File): AttachmentDraft {
  const type = fileTypeOf(file.name, file.type);
  return {
    id: createId("attachment"),
    name: file.name,
    type,
    size: formatFileSize(file.size),
    previewUrl: PREVIEWABLE.includes(type) ? URL.createObjectURL(file) : undefined
  };
}
