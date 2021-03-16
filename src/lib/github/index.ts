
import { Repository } from './types'
import { request } from '@octokit/request'
import { decode } from 'js-base64'

export const user = (login: string) => request('GET /users/{login}', {
  login
}).then(json => json.data)

export const userStars = (login: string, page: number = 1) =>
  request('GET /users/{login}/starred', {
    login,
    page,
  }).then(json => json.data)

export const repoReadme = (repo: Repository) => request('GET /repos/{owner}/{repo}/readme', {
  repo: repo.name,
  owner: repo.owner.login,
})
  .then(json => json.data).then(data => {
    return request('POST /markdown', {
      text: decode(data.content),
    })
  })
  .then(json => json.data)

const github = {
  user,
  userStars,
  repoReadme,
}

export default github