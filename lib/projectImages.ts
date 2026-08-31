import { projectSlug } from "./data";
import { projectImages } from "./projectImages.generated";

/**
 * Screenshots for a project, in filename order — the first is the cover.
 * Empty when nothing has been dropped in public/images/projects/<slug>/ yet,
 * which is what sends the card to its generated schematic instead.
 */
export const imagesFor = (title: string): string[] =>
  projectImages[projectSlug(title)] ?? [];
