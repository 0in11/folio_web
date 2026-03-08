import type { CollectionConfig } from "payload";

export const Projects: CollectionConfig = {
  slug: "projects",
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
        revalidateTag("projects");
      },
    ],
  },
  fields: [
    {
      name: "projectId",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { description: "기존 Project.id와 호환되는 문자열 식별자" },
    },
    { name: "title", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "company", type: "text", required: true },
    { name: "description", type: "textarea", required: true },
    { name: "period", type: "text", required: true },
    { name: "teamSize", type: "text", required: true },
    { name: "keyAchievement", type: "text", required: true },
    { name: "featured", type: "checkbox", defaultValue: false },
    {
      name: "technologies",
      type: "array",
      fields: [{ name: "value", type: "text", required: true }],
    },
    {
      name: "links",
      type: "group",
      fields: [
        { name: "github", type: "text" },
        { name: "demo", type: "text" },
        { name: "paper", type: "text" },
      ],
    },
    {
      name: "detail",
      type: "group",
      fields: [
        { name: "problem", type: "textarea" },
        { name: "role", type: "textarea" },
        { name: "architecture", type: "textarea" },
        { name: "implementation", type: "textarea" },
        { name: "impact", type: "textarea" },
        { name: "learnings", type: "textarea" },
        {
          name: "architectureImage",
          type: "group",
          fields: [
            { name: "src", type: "text" },
            { name: "alt", type: "text" },
            { name: "caption", type: "text" },
          ],
        },
        {
          name: "demoImages",
          type: "array",
          fields: [
            { name: "src", type: "text", required: true },
            { name: "alt", type: "text", required: true },
            { name: "caption", type: "text" },
          ],
        },
        {
          name: "sections",
          type: "array",
          fields: [
            { name: "title", type: "text", required: true },
            { name: "content", type: "textarea" },
            {
              name: "image",
              type: "group",
              fields: [
                { name: "src", type: "text" },
                { name: "alt", type: "text" },
                { name: "caption", type: "text" },
              ],
            },
            {
              name: "imagePosition",
              type: "select",
              options: [
                { label: "Before", value: "before" },
                { label: "After", value: "after" },
              ],
            },
            {
              name: "tableHeaders",
              type: "group",
              fields: [
                { name: "col0", type: "text" },
                { name: "col1", type: "text" },
              ],
              validate: (value) => {
                if (!value) return true;
                const { col0, col1 } = value as { col0?: string; col1?: string };
                if ((col0 && !col1) || (!col0 && col1)) {
                  return "col0과 col1을 모두 입력하거나 둘 다 비워야 합니다.";
                }
                return true;
              },
            },
            {
              name: "table",
              type: "array",
              fields: [
                { name: "label", type: "text", required: true },
                { name: "value", type: "text", required: true },
              ],
            },
            {
              name: "subsections",
              type: "array",
              fields: [
                { name: "title", type: "text", required: true },
                { name: "content", type: "textarea", required: true },
              ],
            },
          ],
        },
      ],
    },
  ],
};
