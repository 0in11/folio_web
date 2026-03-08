import type { CollectionConfig } from "payload";

export const Publications: CollectionConfig = {
  slug: "publications",
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: "title",
  },
  hooks: {
    afterChange: [
      async () => {
        const { revalidateTag } = await import("next/cache");
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
