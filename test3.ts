import "dotenv/config";
import { getAssets } from "./src/actions/assets";

async function main() {
  const assets = await getAssets();
  console.log(assets.slice(0, 3));
}

main().catch(console.error).finally(() => process.exit());
