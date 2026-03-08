import type { CollectionConfig } from "payload";

export const Awards: CollectionConfig = {
  slug: "awards",
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
        revalidateTag("awards");
      },
    ],
  },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "date", type: "text", required: true },
    { name: "organizer", type: "text" },
  ],
};
