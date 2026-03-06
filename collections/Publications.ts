import type { CollectionConfig } from "payload";

export const Publications: CollectionConfig = {
  slug: "publications",
  admin: {
    useAsTitle: "title",
  },
  hooks: {
    afterChange: [
      () => {
        const { revalidateTag } = require("next/cache");
        revalidateTag("publications");
      },
    ],
  },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "journal", type: "text", required: true },
    { name: "year", type: "number", required: true },
    { name: "doi", type: "text" },
  ],
};
