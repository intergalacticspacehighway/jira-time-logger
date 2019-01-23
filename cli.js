#! /usr/bin/env node
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "./.env") });
const prompts = require("prompts");
const fs = require("fs");
const opn = require("opn");
const args = process.argv;
const {
  generateAuthHeader,
  getAxiosInstance,
  getJIRADateFormat,
  requiredValidator,
  getWorkLogPromptFields,
  getStatusPrompt,
  spinner,
  projects,
  PROJECTS_PATH
} = require("./utils");

const main = async () => {
  try {
    const axiosInstance = await getAxiosInstance();
    if (axiosInstance) {
      const { ISSUE_KEY, TIME_SPENT, COMMENT } = await getWorkLogPromptFields();
      let baseurl = projects[ISSUE_KEY.split("-")[0]]["url"];
      const url = `${baseurl}/rest/api/2/`;
      axiosInstance.defaults.baseURL = url;

      spinner.start();

      const response = await axiosInstance.post(`/issue/${ISSUE_KEY}/worklog`, {
        started: getJIRADateFormat(),
        timeSpent: TIME_SPENT,
        comment: COMMENT || `Working on issue ${ISSUE_KEY}`
      });

      spinner.stop();

      console.log("Worklog has been added");
      const { STATUS } = await getStatusPrompt();
      if (STATUS) {
        opn(`${baseurl}/browse/${ISSUE_KEY}`);
      }
    }
  } catch (error) {
    spinner.stop();
    if (error.response) {
      console.log("Failed Status code ", error.response.status);
    } else {
      console.log("Cyaa...");
    }
  }
};
const userFlag = args[2];
if (userFlag && userFlag.includes("cred")) {
  require("./credentials.js");
} else if (userFlag && userFlag.includes("config")) {
  opn(PROJECTS_PATH);
} else {
  main();
}
