const path = require("path");
var os = require("os");
const axios = require("axios");
const prompts = require("prompts");
const ENV_FILE_PATH = path.resolve(__dirname, "../.env");
const moment = require("moment");
const fs = require("fs");
const ora = require("ora");
const spinner = ora("Requesting JIRA");
const PROJECTS_PATH = path.resolve(__dirname, "../projects.json");
let projects = JSON.parse(fs.readFileSync(PROJECTS_PATH));

const generateAuthHeader = (username, password) => {
  const AUTH_HEADER_PLAIN = `${username}:${password}`;
  const AUTH_HEADER_ENCODED = Buffer.from(AUTH_HEADER_PLAIN).toString("base64");
  return AUTH_HEADER_ENCODED;
};

const getAxiosInstance = async () => {
  let JIRA_EMAIL = process.env.JIRA_EMAIL;
  let JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
  let AUTH_BASIC_HEADER;
  if (!JIRA_EMAIL) {
    JIRA_EMAIL = await initializeEmail();
  }
  if (JIRA_EMAIL && !JIRA_API_TOKEN) {
    JIRA_API_TOKEN = await initializeAPIToken();
  }
  if (JIRA_EMAIL && JIRA_API_TOKEN) {
    AUTH_BASIC_HEADER = generateAuthHeader(JIRA_EMAIL, JIRA_API_TOKEN);
  }
  if (AUTH_BASIC_HEADER) {
    return axios.create({
      headers: {
        Authorization: `Basic ${AUTH_BASIC_HEADER}`,
        "Content-Type": "application/json"
      }
    });
  } else {
    return false;
  }
};

const getJIRADateFormat = (momentDate = moment()) => {
  return momentDate.format("YYYY-MM-DDTHH:mm:ss.SSSZZ");
};
const requiredValidator = (value, message) => {
  if (value) {
    return true;
  } else {
    return message;
  }
};
const issueKeyValidator = value => {
  let issuePrefix = value.split("-")[0];
  if (projects.hasOwnProperty(issuePrefix)) {
    baseURL = projects[issuePrefix];
    return true;
  } else {
    return "Please enter a valid issue key or check the projects.json file to add your own projects";
  }
};

const getWorkLogPromptFields = () => {
  return prompts(
    [
      {
        type: "text",
        name: "ISSUE_KEY",
        validate: value => issueKeyValidator(value),
        message: `Enter Issue Key eg. REEL-2677`
      },
      {
        type: "text",
        name: "TIME_SPENT",
        validate: value => requiredValidator(value, "Enter Time spent"),
        message: `Enter Time Spent eg. 1h, 30m, 2w (Minimum value 1m)`
      },
      {
        type: "text",
        name: "COMMENT",
        message: `Enter description (optional)`
      }
    ],
    {
      onCancel: () => {
        process.exit();
        return false;
      }
    }
  );
};
const getStatusPrompt = () => {
  return prompts([
    {
      type: "toggle",
      name: "STATUS",
      message: "Do you want to change the status of the given task",
      initial: false,
      active: "Yes",
      inactive: "No"
    }
  ]);
};
const initializeAPIToken = async () => {
  const { JIRA_API_TOKEN } = await prompts({
    type: "text",
    name: "JIRA_API_TOKEN",
    validate: value => requiredValidator(value, "Enter API token"),
    message: `Enter JIRA API Token key`
  });
  if (JIRA_API_TOKEN) {
    const dataToAppend = `JIRA_API_TOKEN=${JIRA_API_TOKEN}${os.EOL}`;
    fs.appendFile(ENV_FILE_PATH, dataToAppend, function(err) {
      if (err) {
        console.log(err);
        return;
      }
    });
  }
  return JIRA_API_TOKEN;
};

const initializeEmail = async () => {
  const { JIRA_EMAIL } = await prompts({
    type: "text",
    name: "JIRA_EMAIL",
    validate: value => requiredValidator(value, "Enter email"),
    message: `Enter email associated with JIRA`
  });
  if (JIRA_EMAIL) {
    const dataToAppend = `JIRA_EMAIL=${JIRA_EMAIL}${os.EOL}`;
    fs.appendFile(ENV_FILE_PATH, dataToAppend, function(err) {
      if (err) {
        console.log(err);
        return;
      }
    });
  }

  return JIRA_EMAIL;
};

module.exports = {
  generateAuthHeader,
  getAxiosInstance,
  getJIRADateFormat,
  requiredValidator,
  getWorkLogPromptFields,
  getStatusPrompt,
  spinner,
  ENV_FILE_PATH,
  PROJECTS_PATH,
  projects,
  initializeAPIToken,
  initializeEmail
};
