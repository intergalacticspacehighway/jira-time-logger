const fs = require("fs");
const prompts = require("prompts");
const {
  ENV_FILE_PATH,
  initializeAPIToken,
  initializeEmail
} = require("./utils");

fs.writeFile(ENV_FILE_PATH, "", async function() {
  await initializeEmail();
  await initializeAPIToken();
});
