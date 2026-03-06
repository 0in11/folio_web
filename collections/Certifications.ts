import type { CollectionConfig } from "payload";

export const Certifications: CollectionConfig = {
  slug: "certifications",
  admin: {
    useAsTitle: "name",
  },
  hooks: {
    afterChange: [
      () => {
        const { revalidateTag } = require("next/cache");
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
