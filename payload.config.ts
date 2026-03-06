import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";

import { Users } from "./collections/Users";
import { Projects } from "./collections/Projects";
import { Career } from "./collections/Career";
import { Skills } from "./collections/Skills";
import { Education } from "./collections/Education";
import { Awards } from "./collections/Awards";
import { Publications } from "./collections/Publications";
import { Certifications } from "./collections/Certifications";

export default buildConfig({
  editor: lexicalEditor(),
  collections: [
    Users,
    Projects,
    Career,
    Skills,
    Education,
    Awards,
    Publications,
    Certifications,
  ],
  secret: process.env.PAYLOAD_SECRET || "",
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || "",
    },
  }),
  typescript: {
    outputFile: "payload-types.ts",
  },
});
