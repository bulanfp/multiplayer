import { toast } from "@mekari/pixel3";
import type { Output, OutputBlock } from "~/data/types";

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
