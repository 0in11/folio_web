import type { CollectionConfig } from "payload";

export const Career: CollectionConfig = {
  slug: "career",
  admin: {
    useAsTitle: "company",
  },
  hooks: {
    afterChange: [
      () => {
        const { revalidateTag } = require("next/cache");
        revalidateTag("career");
      },
    ],
  },
  fields: [
    { name: "period", type: "text", required: true },
    { name: "company", type: "text", required: true },
    { name: "role", type: "text", required: true },
    { name: "current", type: "checkbox", defaultValue: false },
    {
      name: "sortOrder",
      type: "number",
      admin: { position: "sidebar", description: "정렬 순서 (낮을수록 먼저)" },
    },
    {
      name: "keywords",
      type: "array",
      fields: [{ name: "value", type: "text", required: true }],
    },
  ],
};
