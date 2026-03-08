import type { CollectionConfig } from "payload";

export const Career: CollectionConfig = {
  slug: "career",
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: "company",
  },
  hooks: {
    afterChange: [
      async () => {
        const { revalidateTag } = await import("next/cache");
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
