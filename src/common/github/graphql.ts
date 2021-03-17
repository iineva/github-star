import { getAccessToken } from './oauth'

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

export type ReadmeResult = {
  repository: {
    README_md?: { text: string }
    readme_md?: { text: string }
    readme?: { text: string }
  }
}

export async function fetchREADME(param: {
  owner: string
  name: string
}) {
  return await request<ReadmeResult>(`#graphql
query RepoMarkdown($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    README_md: object(expression: "HEAD:README.md") {
      ... on Blob {
        text
      }
    }
    readme_md: object(expression: "HEAD:readme.md") {
      ... on Blob {
        text
      }
    }
    readme: object(expression: "HEAD:readme") {
      ... on Blob {
        text
      }
    }
  }
}
  `, param)
}

export type Repository = {
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
  rateLimit {
    limit
    cost
    remaining
    resetAt
  }
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
    starredAt
    node {
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

export async function fetchAllUserStars(progress?: (list: StarredRepositoryEdge[]) => void, after?: string): Promise<StarredRepositoryEdge[]> {

  const result = await fetchUserStars(after ? 100 : 10, after)

  // handle errors
  if (result.errors || !result.data) {
    if (result.errors) console.error(...result.errors)
    throw new Error('Error: reloadStars fail.')
  }

  // TODO: store data
  let list = result.data.viewer.stars.edges
  if (result.data.viewer.stars.pageInfo.hasNextPage) {
    progress && progress(list)
    const l = await fetchAllUserStars(progress, result.data.viewer.stars.pageInfo.endCursor)
    list = [...list, ...l]
  } else {
    progress && progress(list)
  }

  return list
}
