
import { Repository } from './graphql'
import { request } from '@octokit/request'
import { getAccessToken } from './oauth'
import renderGitHubURL from './parse'

export const user = (login: string) => request('GET /users/{login}', {
  login
}).then(json => json.data)

export const userStars = (login: string, page: number = 1) =>
  request('GET /users/{login}/starred', {
    login,
    page,
  }).then(json => json.data)

export const readmeToHTML = (repo: Repository, text: string) => {
  const REACT_APP_GITHUB_AUTH_TOKEN = getAccessToken()
  return request('POST /markdown', {
    text: text,
    headers: {
      authorization: `bearer ${REACT_APP_GITHUB_AUTH_TOKEN.access_token}`,
    },
  })
    .then(json => json.data)
    .then(readmeHTML => {
      const domparser = new DOMParser()
      const doc = domparser.parseFromString(readmeHTML, 'text/html')
      return renderGitHubURL(doc.body, repo)
    })
}

const github = {
  user,
  userStars,
  readmeToHTML,
}

export default github