# Project screenshots

Drop images in the folder named after the project. Nothing else to edit — no
paths to type, no TypeScript to touch.

```
public/images/projects/
  workeriq/
    01-command-center.jpg
    02-badge-assignment.jpg
    03-map.jpg
```

`npm run dev` and `npm run build` regenerate `lib/projectImages.generated.ts`
from these folders before they start, so images show up on the next run. To
refresh without a full build: `npm run sync:images`.

## Rules

- **Folder name** is the project title, lowercased, non-alphanumerics collapsed
  to `-`. `DustIQ Baghouse` → `dustiq-baghouse`. Rename a title in `lib/data.ts`
  and the folder has to follow. A folder matching no project is reported by name
  when the script runs, so a typo never fails silently.
- **Order is filename order.** Number the files: `01-`, `02-`. The first one is
  the card cover; the rest page through the detail panel.
- **A folder with no images** falls back to the generated schematic, which is
  the current state of every private client deployment.
- **16:9**, around 1600×900. Other ratios get centre-cropped.
- **Under ~300 KB each.** `jpg`, `png`, `webp` and `avif` are all picked up.

## Before adding a client screenshot

This repository is public. Crop or blur anything that shows real client data.
