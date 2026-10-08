import type { IconName } from "@mekari/pixel3";
import type { ConnectorId } from "~/data/types";

// Apps a group can be connected to. Figma has a brand icon in Pixel; Google Docs and Google
// Chat don't, so their logos are small SVGs in public/images/connectors/.

export interface Connector {
  id: ConnectorId;
  name: string;
  /** What agents can do with it, shown when there's nothing linked yet and in Add connector */
  description: string;
  icon?: IconName;
  image?: string;
}

export const CONNECTORS: Connector[] = [
  {
    id: "figma",
    name: "Figma",
    description: "Agents can read the design files linked here",
    icon: "Figma"
  },
  {
    id: "google-docs",
    name: "Google Docs",
    description: "Agents can read and write the docs linked here",
    image: "/images/connectors/google-docs.svg"
  },
  {
    id: "google-chat",
    name: "Google Chat",
    description: "Agents can post updates to the spaces linked here",
    image: "/images/connectors/google-chat.svg"
  }
];

export function getConnector(id: string): Connector | undefined {
  return CONNECTORS.find((connector) => connector.id === id);
}
