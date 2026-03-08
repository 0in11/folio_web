import path from "node:path";
import { fileURLToPath } from "node:url";
import { getEnv } from "./lib/env.ts";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";

const dirname = path.dirname(fileURLToPath(import.meta.url));

import { Users } from "./collections/Users.ts";
import { Projects } from "./collections/Projects.ts";
import { Career } from "./collections/Career.ts";
import { Skills } from "./collections/Skills.ts";
import { Education } from "./collections/Education.ts";
import { Awards } from "./collections/Awards.ts";
import { Publications } from "./collections/Publications.ts";
import { Certifications } from "./collections/Certifications.ts";

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
  secret: getEnv().PAYLOAD_SECRET,
  db: postgresAdapter({
    pool: {
      connectionString: getEnv().DATABASE_URL,
    },
  }),
  bin: [
    {
      scriptPath: path.resolve(dirname, "scripts/seed.ts"),
      key: "seed",
    },
  ],
  typescript: {
    outputFile: "payload-types.ts",
  },
});
