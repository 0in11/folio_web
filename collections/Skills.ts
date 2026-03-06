import type { CollectionConfig } from "payload";

export const Skills: CollectionConfig = {
  slug: "skills",
  admin: {
    useAsTitle: "label",
  },
  hooks: {
    afterChange: [
      () => {
        const { revalidateTag } = require("next/cache");
        revalidateTag("skills");
      },
    ],
  },
  fields: [
    { name: "label", type: "text", required: true },
    { name: "description", type: "text", required: true },
    {
      name: "sortOrder",
      type: "number",
      admin: { position: "sidebar", description: "정렬 순서 (낮을수록 먼저)" },
    },
    {
      name: "items",
      type: "array",
      fields: [{ name: "value", type: "text", required: true }],
    },
  ],
};
