import type { CollectionConfig } from "payload";

export const Skills: CollectionConfig = {
  slug: "skills",
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: "label",
  },
  hooks: {
    afterChange: [
      async () => {
        const { revalidateTag } = await import("next/cache");
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
