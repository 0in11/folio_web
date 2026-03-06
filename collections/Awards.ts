import type { CollectionConfig } from "payload";

export const Awards: CollectionConfig = {
  slug: "awards",
  admin: {
    useAsTitle: "title",
  },
  hooks: {
    afterChange: [
      () => {
        const { revalidateTag } = require("next/cache");
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
