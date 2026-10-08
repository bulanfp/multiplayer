import { toast, type IconName } from "@mekari/pixel3";
import type { Output, OutputBlock, OutputFormat } from "~/data/types";

/** How each artifact format is labelled and drawn: what it opens as in the canvas. */
export const OUTPUT_FORMATS: Record<OutputFormat, { label: string; icon: IconName }> = {
  doc: { label: "Doc", icon: "doc" },
  sheet: { label: "Sheet", icon: "table-view-column" },
  slides: { label: "Slides", icon: "dashboard" },
  html: { label: "HTML", icon: "file-code" }
};

function blocksToText(blocks: OutputBlock[]): string {
  return blocks
    .map((block) =>
      block.type === "list" ? block.items.map((item) => `• ${item}`).join("\n") : block.text
    )
    .join("\n\n");
}

/** Copies one version of an output as plain text and confirms with a toast. */
export async function copyOutput(output: Output, version: number): Promise<void> {
  const current = output.versions[version - 1] ?? output.versions.at(-1);
  if (!current) return;
  try {
    await navigator.clipboard.writeText(`${output.title}\n\n${blocksToText(current.blocks)}`);
    toast.notify({ title: `Copied ${output.title} v${version}`, variant: "success" });
  } catch {
    toast.notify({
      title: "Couldn't copy. Select the text and copy it instead.",
      variant: "error"
    });
  }
}
