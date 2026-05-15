/**
 * One-shot seed: `npm run db:seed-catalog` (from v2-admin, with DATABASE_URL set).
 */
import { config } from "dotenv";
import { resolve } from "path";
import { ensureDefaultClientCatalog, ensureDefaultServiceCatalog } from "../src/lib/ensure-default-catalog";

config({ path: resolve(process.cwd(), ".env") });

async function main() {
  const clients = await ensureDefaultClientCatalog();
  const services = await ensureDefaultServiceCatalog();
  console.log(
    clients ? "Seeded client catalog." : "Client catalog already present (skipped).",
  );
  console.log(
    services ? "Seeded service catalog." : "Service catalog already present (skipped).",
  );
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
