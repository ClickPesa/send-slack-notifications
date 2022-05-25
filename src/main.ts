import axios from 'axios'
import * as github from '@actions/github'
import * as core from '@actions/core'

const GITHUB_TOKEN: any = core.getInput('GITHUB_TOKEN')
const APP_NAME: any = core.getInput('APP_NAME')
const SLACK_REVIEW_WEBHOOK_URL: any = core.getInput('SLACK_REVIEW_WEBHOOK_URL')
const SLACK_WEBHOOK_URL: any = core.getInput('SLACK_WEBHOOK_URL')
const APP_LINK: any = core.getInput('APP_LINK')
const REPORTER_SLACK_EMAIL: any = core.getInput('REPORTER_SLACK_EMAIL')
const REPORTER_SLACK_ID: any = core.getInput('REPORTER_SLACK_ID')
const TEAM_LEADER_SLACK_ID: any = core.getInput('TEAM_LEADER_SLACK_ID')
const TECH_LEAD_SLACK_ID: any = core.getInput('TECH_LEAD_SLACK_ID')
const PR_LINK: any = core.getInput('PR_LINK')
const BODY: any = core.getInput('BODY')
const PR_TITLE: any = core.getInput('PR_TITLE')
const NEW_VERSION: any = core.getInput('NEW_VERSION')
const SLACK_AUTH_TOKEN: any = core.getInput('SLACK_AUTH_TOKEN')
const SLACK_API_URL: any = core.getInput('SLACK_API_URL')
const octokit = github.getOctokit(GITHUB_TOKEN)
const {context = {}}: any = github

let newDate = new Date()
newDate.setTime(new Date().getTime())
let dateString = newDate.toDateString()
let timeString = newDate.toLocaleTimeString()

async function run() {
  let reporter_id = ''
  // fetch slack info
  try {
    if (!REPORTER_SLACK_ID && REPORTER_SLACK_EMAIL) {
      const {data} = await axios.post(
        SLACK_API_URL + `?email=` + REPORTER_SLACK_EMAIL,
        {},
        {
          headers: {
            Authorization: `Bearer ${SLACK_AUTH_TOKEN}`,
            ContentType: 'application/x-www-form-urlencoded'
          }
        }
      )
      reporter_id = data?.user?.id
    } else {
      reporter_id = REPORTER_SLACK_ID
    }
    const options = SLACK_WEBHOOK_URL
      ? {
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: `:sparkles: New version released on *${APP_NAME}*`,
                emoji: true
              }
            },
            {
              type: 'context',
              elements: [
                {
                  text: ` *${APP_NAME}*  |  *${
                    dateString + ' ' + timeString
                  }* `,
                  type: 'mrkdwn'
                }
              ]
            },
            {
              type: 'divider'
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*<${APP_LINK} | ${NEW_VERSION} >*`
              }
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `${BODY ?? '> No commits to display'}`
              }
            }
          ]
        }
      : {
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: `:sparkles:  New pull request for manual review on ${APP_NAME}`,
                emoji: true
              }
            },
            {
              type: 'context',
              elements: [
                {
                  text: ` <@${reporter_id}> <@${TEAM_LEADER_SLACK_ID}> <@${TECH_LEAD_SLACK_ID}>  |  *${APP_NAME}*  |  
            *${dateString + ' ' + timeString}* 
            `,
                  type: 'mrkdwn'
                }
              ]
            },
            {
              type: 'divider'
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*<${PR_LINK} | ${PR_TITLE}>*`
              }
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `${BODY ?? '> No commits to display'}`
              }
            },
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    emoji: true,
                    text: 'Review Changes'
                  },
                  style: 'primary',
                  url: `${APP_LINK}`
                },
                {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    emoji: true,
                    text: 'View Pull Request'
                  },
                  url: `${PR_LINK}`
                }
              ]
            }
          ]
        }

    core.info(APP_LINK)
    core.info(PR_LINK)

    await axios.post(
      SLACK_WEBHOOK_URL ?? SLACK_REVIEW_WEBHOOK_URL,
      JSON.stringify(options)
    )
  } catch (err: any) {
    core.warning(err?.message)
  }
}

run()
