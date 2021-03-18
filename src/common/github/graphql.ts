import { getAccessToken } from './oauth'
import { DB } from './cache'

export type GraphQLResult<T> = {
  data?: T
  errors?: GraphQLError[]
}

export type GraphQLError = {
  type: string
  path: string[]
  locations: {
    line: number
    column: number
  }[]
  message: string
}

export async function request<T>(text: string, variables?: Object): Promise<GraphQLResult<T>> {
  const REACT_APP_GITHUB_AUTH_TOKEN = getAccessToken()

  // Fetch data from GitHub's GraphQL API:
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${REACT_APP_GITHUB_AUTH_TOKEN.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: text,
      variables,
    }),
  })

  // Get the response as JSON
  return await response.json()
}

export type ResultTextFile = {
  repository: {
    file?: { text: string }
  }
}

export async function fetchTextFile(owner: string, name: string, filePath: string) {
  return await request<ResultTextFile>(`#graphql
query RepoMarkdown($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    file: object(expression: "HEAD:${filePath}") {
      ... on Blob {
        text
      }
    }
  }
}
`, { owner, name })
}

export type FileInfo = {
  name: string
  path: string
  type: string
}
export type ResultRootFile = {
  repository: {
    files: {
      entries: FileInfo[]
    }
  }
}

export async function fetchRootFiles(owner: string, name: string) {
  return await request<ResultRootFile>(`#graphql
query rootFiles($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    files: object(expression: "HEAD:") {
      ... on Tree {
        entries {
          name
          path
          type
        }
      }
    }
  }
}
`, { owner, name })
}

export type Repository = {
  id: string
  url: string
  name: string
  nameWithOwner: string
  stargazerCount: number
  primaryLanguage?: {
    color?: string
    name: string
  }
  languages: {
    totalCount: number
    nodes: {
      name: string
      color: string
    }
  }[]
  defaultBranchRef: {
    name: string
  }
  latestRelease?: {
    name: string
    tagName: string
    createdAt: string
    description: string
    descriptionHTML: string
  }
  description: string
  descriptionHTML: string
  forkCount: number
  isFork: boolean
  isPrivate: boolean
  licenseInfo: {
    name: string
    nickname: string
  }
  owner: {
    login: string
    url: string
  }
  pushedAt: string
  createdAt: string
  updatedAt: string
  repositoryTopics: {
    totalCount: string
    edges: {
      node: {
        resourcePath: string
        url: string
        topic: {
          name: string
        }
      }
    }
  }[]
}

export type StarredRepositoryEdge = {
  _id?: string // not from github api: for nedb ID
  _cache?: boolean // not from github api: for temp cache sign

  cursor: string
  starredAt: string
  node: Repository
}

export type StarredRepositoryConnection = {
  totalCount: number
  isOverLimit: boolean
  pageInfo: {
    endCursor: string
    hasNextPage: boolean
  }
  edges: StarredRepositoryEdge[]
}

export type UserStarsResult = {
  viewer: {
    stars: StarredRepositoryConnection
  }
}

export async function fetchUserStars(first: number = 100, after?: string) {
  return await request<UserStarsResult>(`#graphql
query UserStarred($after: String, $first: Int!) {
  viewer {
    stars: starredRepositories(first: $first, orderBy: {field: STARRED_AT, direction: DESC}, after: $after) {
      ...comparisonFields
    }
  }
}

fragment comparisonFields on StarredRepositoryConnection {
  totalCount
  isOverLimit
  pageInfo {
    endCursor
    hasNextPage
  }
  edges {
    cursor
    starredAt
    node {
      id
      url
      name
      nameWithOwner
      stargazerCount
      primaryLanguage {
        color
        name
      }
      languages(first: 100) {
        totalCount
        nodes {
          color
          name
        }
      }
      defaultBranchRef {
        name
      }
      latestRelease {
        name
        tagName
        createdAt
        description
        descriptionHTML
      }
      description
      descriptionHTML
      forkCount
      isFork
      isPrivate
      licenseInfo {
        name
        nickname
      }
      owner {
        login
        url
      }
      pushedAt
      createdAt
      updatedAt
      repositoryTopics(first: 10) {
        totalCount
        edges {
          node {
            resourcePath
            url
            topic {
              name
            }
          }
        }
      }
    }
  }
}
  `, {
    after, first,
  })
}

export async function fetchAllUserStars(progress?: (list: StarredRepositoryEdge[]) => Promise<void>, after?: string): Promise<StarredRepositoryEdge[]> {

  async function fetchData(after?: string): Promise<StarredRepositoryEdge[]> {

    // first page 20 for speed up UI update.
    const result = await fetchUserStars(after ? 100 : 20, after)

    // handle errors
    if (result.errors || !result.data) {
      if (result.errors) console.error(...result.errors)
      throw new Error('Error: reloadStars fail.')
    }

    let list = result.data.viewer.stars.edges

    // call back to update UI
    progress && (await progress(list))

    // insert cache
    await DB.stars.insert<Array<StarredRepositoryEdge>>(list.map(row => {
      row._cache = true
      return row
    }))

    // request next page
    if (result.data.viewer.stars.pageInfo.hasNextPage) {
      const l = await fetchData(result.data.viewer.stars.pageInfo.endCursor)
      list = [...list, ...l]
    }

    return list
  }

  // remove all cache first
  await DB.stars.remove({ _cache: true }, { multi: true })

  // load all
  console.info(new Date(), 'loading stars start...')
  const list = await fetchData()
  console.info(new Date(), 'loading stars done!')

  // replace cache
  console.info(new Date(), 'replace cache start...')
  await DB.stars.remove({ _cache: false }, { multi: true })
  await DB.stars.update({ _cache: true }, { $set: { _cache: false } }, { multi: true })
  await DB.stars.load()
  console.info(new Date(), 'replace cache done!')

  return list
}
