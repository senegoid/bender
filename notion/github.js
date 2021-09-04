/* ================================================================================
	notion-github-sync.
  
  Glitch example: https://glitch.com/edit/#!/notion-github-sync
  Find the official Notion API client @ https://github.com/makenotion/notion-sdk-js/
================================================================================ */

const { Client } = require("@notionhq/client")
const dotenv = require("dotenv")
const { Octokit } = require("octokit")
const _ = require("lodash")

dotenv.config()
const octokit = new Octokit({ auth: process.env.GITHUB_KEY })
const notion = new Client({ auth: process.env.NOTION_KEY })

const databaseId = process.env.NOTION_DATABASE_ID
const OPERATION_BATCH_SIZE = 10

/**
 * Local map to store  GitHub issue ID to its Notion pageId.
 * { [issueId: string]: string }
 */
const gitHubIssuesIdToNotionPageId = {}

/**
 * Initialize local data store.
 * Then sync with GitHub.
 */
module.exports.sync  = async () => {
  await setInitialGitHubToNotionIdMap();
  await syncNotionDatabaseWithGitHub();
  // setInitialGitHubToNotionIdMap().then(syncNotionDatabaseWithGitHub)
}
/**
 * Get and set the initial data store with issues currently in the database.
 */
async function setInitialGitHubToNotionIdMap() {
  const currentIssues = await getIssuesFromNotionDatabase()
  for (const { pageId, issueNumber } of currentIssues) {
    gitHubIssuesIdToNotionPageId[issueNumber] = pageId
  }
}

async function syncNotionDatabaseWithGitHub() {
  // Get all issues currently in the provided GitHub repository.
  console.log("\nFetching issues from Notion DB...")
  const issues = await getGitHubIssuesForRepository()
  console.log(`Fetched ${issues.length} issues from GitHub repository.`)

  // Group issues into those that need to be created or updated in the Notion database.
  const { pagesToCreate, pagesToUpdate } = getNotionOperations(issues)

  // Create pages for new issues.
  console.log(`\n${pagesToCreate.length} new issues to add to Notion.`)
  await createPages(pagesToCreate)

  // Updates pages for existing issues.
  console.log(`\n${pagesToUpdate.length} issues to update in Notion.`)
  await updatePages(pagesToUpdate)

  // Success!
  console.log("\n✅ Notion database is synced with GitHub.")
}

/**
 * Gets pages from the Notion database.
 *
 * @returns {Promise<Array<{ pageId: string, issueNumber: number }>>}
 */
async function getIssuesFromNotionDatabase() {
  const pages = []
  let cursor = undefined
  while (true) {
    const { results, next_cursor } = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
    })
    pages.push(...results)
    if (!next_cursor) {
      break
    }
    cursor = next_cursor
  }
  console.log(`${pages.length} issues successfully fetched.`)
  return pages.map(page => {
    return {
      pageId: page.id,
      issueNumber: page.properties["Issue Number"].number,
    }
  })
}

/**
 * Gets issues from a GitHub repository. Pull requests are omitted.
 *
 * https://docs.github.com/en/rest/guides/traversing-with-pagination
 * https://docs.github.com/en/rest/reference/issues
 *
 * @returns {Promise<Array<{ number: number, title: string, state: "open" | "closed", comment_count: number, url: string }>>}
 */
async function getGitHubIssuesForRepository() {
  const issues = []
  const iterator = octokit.paginate.iterator(octokit.rest.issues.listForRepo, {
    owner: process.env.GITHUB_REPO_OWNER,
    repo: process.env.GITHUB_REPO_NAME,
    state: "all",
    per_page: 100,
  })
  for await (const { data } of iterator) {
    for (const issue of data) {
      if (!issue.pull_request) {
        issues.push({
          number: issue.number,
          title: issue.title,
          state: issue.state,
          comment_count: issue.comments,
          url: issue.html_url,
          labels: issue.labels.map((l) => { return { name:l.name }; }),
          description: issue.body || '',
          assignee: issue.assignees.map((assignee) => { return { name:assignee?.login || '' }; }),
          milestone: issue.milestone?.title,
          due: issue.milestone?.due_on,
        })
      }
    }
  }
  return issues
}

/**
 * Determines which issues already exist in the Notion database.
 *
 * @param {Array<{ number: number, title: string, state: "open" | "closed", comment_count: number, url: string }>} issues
 * @returns {{
 *   pagesToCreate: Array<{ number: number, title: string, state: "open" | "closed", comment_count: number, url: string }>;
 *   pagesToUpdate: Array<{ pageId: string, number: number, title: string, state: "open" | "closed", comment_count: number, url: string }>
 * }}
 */
function getNotionOperations(issues) {
  const pagesToCreate = []
  const pagesToUpdate = []
  for (const issue of issues) {
    const pageId = gitHubIssuesIdToNotionPageId[issue.number]
    if (pageId) {
      pagesToUpdate.push({
        ...issue,
        pageId,
      })
    } else {
      pagesToCreate.push(issue)
    }
  }
  return { pagesToCreate, pagesToUpdate }
}

/**
 * Creates new pages in Notion.
 *
 * https://developers.notion.com/reference/post-page
 *
 * @param {Array<{ number: number, title: string, state: "open" | "closed", comment_count: number, url: string }>} pagesToCreate
 */
async function createPages(pagesToCreate) {
  for (const page of pagesToCreate) {
    await notion.pages.create({
      parent: { database_id: databaseId },
      properties: getPropertiesFromIssue(page),
    })    
    console.log(`Created page: ${page.number}-${page.title}`)
  }
}

/**
 * Updates provided pages in Notion.
 *
 * https://developers.notion.com/reference/patch-page
 *
 * @param {Array<{ pageId: string, number: number, title: string, state: "open" | "closed", comment_count: number, url: string }>} pagesToUpdate
 */
async function updatePages(pagesToUpdate) {
  for (const page of pagesToUpdate) {
      const { pageId, ...issue } = page; 
      await notion.pages.update({
        page_id: pageId,
        properties: getPropertiesFromIssue(issue),
      })   
    
    console.log(`Updated page:${page.number}-${page.title}`)
  }
}

//*========================================================================
// Helpers
//*========================================================================

/**
 * Returns the GitHub issue to conform to this database's schema properties.
 *
 * @param {{ number: number, title: string, state: "open" | "closed", comment_count: number, url: string }} issue
 */
function getPropertiesFromIssue(issue) {
  const { title, number, state, comment_count, url, labels, description, assignee, milestone, due } = issue
  const properties = {
    Name: {
      title: [{ type: "text", text: { content: title } }],
    },
    "Issue Number": {
      number,
    },
    State: {
      select: { name: state },
    },
    "Number of Comments": {
      number: comment_count,
    },
    "Issue URL": {
      url,
    },
    Labels: {
      multi_select: labels,
    },
    Description: { 
      rich_text: [
        {
          "type": "text",
          "text": {
            content: description
          }
        },
      ]
    },
    Assignee: { 
      multi_select:  assignee,      
    },
  }

  if( milestone ){
    properties.Milestone = {
      select:  { name: milestone },  
    }
  }

  if( due ) {
    properties.Due = {
      date: {
        start: due
     }
    }
  }
  
  return properties;
}
