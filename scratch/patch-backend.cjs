const fs = require("fs");
const path = require("path");

const settingsFile = path.resolve(__dirname, "../../makhana-backend/src/modules/settings/settings.ts");
let content = fs.readFileSync(settingsFile, "utf8");

content = content.replace(
  'currency: z.literal("USD"),',
  'currency: z.enum(["USD", "INR"]),'
);

content = content.replace(
  'currency: "USD";',
  'currency: "USD" | "INR";'
);

content = content.replace(
  'currency: z.literal("USD"),',
  'currency: z.enum(["USD", "INR"]),'
);

fs.writeFileSync(settingsFile, content, "utf8");
console.log("Successfully updated makhana-backend/src/modules/settings/settings.ts");
