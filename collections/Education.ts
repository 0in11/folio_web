import type { CollectionConfig } from "payload";

export const Education: CollectionConfig = {
  slug: "education",
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: "institution",
  },
  hooks: {
    afterChange: [
      async () => {
        const { revalidateTag } = await import("next/cache");
        revalidateTag("education");
      },
    ],
  },
  fields: [
    { name: "institution", type: "text", required: true },
    { name: "degree", type: "text", required: true },
    { name: "gpa", type: "text" },
    { name: "period", type: "text", required: true },
  ],
};
