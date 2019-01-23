### Getting started

- Generate API token in JIRA. [Click here to read more](https://confluence.atlassian.com/cloud/api-tokens-938839638.html)

* Install

```
 npm install jira-time-logger -g
```

- Set/Reset credentials

```
log-time --cred
```

- Config projects.json, add your project with key as the issue prefix and its root url value.

```
log-time --config
```

- Start logging

```
log-time
```

### Notes

- The minimum amount of logging time must be a minute, anything below that will fail.
- Edit the projects.json as per you need.
- For any failed status codes, please check the .env file that's being created and ensure correct credentials are being inputted.

### Contributors

- [Chirag Mulchandani](https://github.com/chiragsolutelabs)
- [Nishan Bende](https://github.com/Sunny-Nishan)
