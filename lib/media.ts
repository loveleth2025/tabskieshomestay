import fs from "fs";
import path from "path";

// Checked at build time (these pages are statically generated), so once a
// real photo is dropped into /public and the site is redeployed, the
// "add a photo" caption disappears on its own — no code change needed.
export function publicFileExists(relativePath: string): boolean {
  try {
    const clean = relativePath.replace(/^\//, "");
    return fs.existsSync(path.join(process.cwd(), "public", clean));
  } catch {
    return false;
  }
}
