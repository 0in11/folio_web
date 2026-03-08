import type { CollectionConfig } from "payload";

export const Certifications: CollectionConfig = {
  slug: "certifications",
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: "name",
  },
  hooks: {
    afterChange: [
      async () => {
        const { revalidateTag } = await import("next/cache");
        revalidateTag("certifications");
      },
    ],
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "date", type: "text", required: true },
    { name: "issuer", type: "text" },
  ],
};
