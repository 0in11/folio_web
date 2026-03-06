import type { CollectionConfig } from "payload";

export const Education: CollectionConfig = {
  slug: "education",
  admin: {
    useAsTitle: "institution",
  },
  hooks: {
    afterChange: [
      () => {
        const { revalidateTag } = require("next/cache");
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
