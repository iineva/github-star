import queryString from 'query-string'

const CLIENT_ID = process.env.REACT_APP_CLIENT_ID
const CLIENT_SECRET = process.env.REACT_APP_CLIENT_SECRET
const REDIRECT_URL = process.env.REACT_APP_REDIRECT_URL || 'http://localhost:3000'

type AccessToken = {
  access_token: string
  scope: string
  token_type: string

  expires_in: number
  refresh_token: string
  refresh_token_expires_in: number
}

export const oauth = () => {
  const param = {
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URL,
    scope: 'user,public_repo,repo',
  }

  window.location.href = 'https://github.com/login/oauth/authorize?' +
    // @ts-ignore
    Object.keys(param).map(k => `${k}=${param[k]}`).join('&')
}

const ACCESS_TOKEN_CACHE_KEY = 'ACCESS_TOKEN_CACHE_KEY'
const cache_token = window.localStorage.getItem(ACCESS_TOKEN_CACHE_KEY)
let accessToken: AccessToken = cache_token && JSON.parse(cache_token)
export const getAccessToken = () => accessToken

const accessTokenURL = process.env.NODE_ENV === 'production' ?
  'https://github.com/login/oauth/access_token' :
  '/login/oauth/access_token'
const getAccessTokenFromGitHub = (code: string) => fetch(accessTokenURL, {
  body: JSON.stringify({
    code: code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  }),
  cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
  credentials: 'omit', // include, same-origin, *omit
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  method: 'POST', // *GET, POST, PUT, DELETE, etc.
  mode: 'cors', // no-cors, cors, *same-origin
  redirect: 'follow', // manual, *follow, error
  referrer: 'no-referrer', // *client, no-referrer
}).then(response => response.json())

// parse code and access token
window.addEventListener('load', async () => {
  const param = queryString.parse(window.location.search)
  if (param.code) {
    // @ts-ignore
    accessToken = await getAccessTokenFromGitHub(param.code)
    window.localStorage.setItem(ACCESS_TOKEN_CACHE_KEY, JSON.stringify(accessToken))

    // redirect to root path.
    window.history.replaceState({}, '', '/')
  }

})
