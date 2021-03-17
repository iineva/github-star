import {
  Menu,
  Skeleton,
} from 'antd'
import {
  StarOutlined,
  ForkOutlined,
  TagOutlined,
  CalendarOutlined,
  GithubOutlined,
} from '@ant-design/icons'
import moment from 'moment'

import { kFormatter } from '../common/string'
import { Repository, StarredRepositoryEdge } from '../common/github/graphql'
import { ReactChild, ReactNode, FunctionComponent } from 'react'
import Color from 'color'

const DEFAULT_COLOR = 'gray'

const Circular: FunctionComponent<{
  size?: number
  color: string
}> = ({
  color,
  size = 12,
}) => (
    <span style={{
      background: color,
      width: size, height: size,
      borderRadius: '50%',
      display: 'inline-block',
      margin: 0, marginRight: 2, marginBottom: -1,
      borderColor: Color(color).lighten(-0.2).string(),
      borderWidth: 1,
      borderStyle: 'solid',
    }} />
  )
const TagIcon = (props: {
  icon: ReactNode
  children: ReactChild
}) => (
  <span style={{ marginRight: 8 }}>
    <span style={{ margin: 0, marginRight: 2 }}>
      {props.icon}
    </span>
    <span>
      {props.children}
    </span>
  </span>
)

const RepositoryItem = (props: {
  repo: Repository
  onClick: () => void
}) => (
  <div onClick={props.onClick}>
    <div>{props.repo.nameWithOwner}</div>
    <p style={{ wordWrap: 'break-word', color: 'gray', whiteSpace: 'normal', lineHeight: 'normal' }}>
      {props.repo.description}
    </p>
    <div style={{ display: 'flex', color: 'gray' }}>
      <div style={{ flex: 1, fontSize: 8, alignItems: 'center' }} >
        {props.repo.primaryLanguage && (
          <TagIcon icon={(
            <Circular color={props.repo.primaryLanguage.color || DEFAULT_COLOR} />
          )}>{props.repo.primaryLanguage.name}</TagIcon>
        )}

        {/* stars */}
        <TagIcon icon={(
          <StarOutlined style={{ margin: 0 }} />
        )}>{kFormatter(props.repo.stargazerCount)}</TagIcon>
        {/* forks */}
        <TagIcon icon={(
          <ForkOutlined style={{ margin: 0 }} />
        )}>{kFormatter(props.repo.forkCount)}</TagIcon>
        {/* TODO: request from api */}
        {/* lastest tag */}
        {props.repo.latestRelease && (
          <TagIcon icon={(
            <TagOutlined style={{ margin: 0 }} />
          )}>{props.repo.latestRelease.tagName}</TagIcon>
        )}
        {/* lastest updated */}
        <TagIcon icon={(
          <CalendarOutlined style={{ margin: 0 }} />
        )}>{moment(props.repo.pushedAt).fromNow(true)}</TagIcon>
      </div>
      <div>
        <a href={`https://github.com/${props.repo.nameWithOwner}`} target="_blank" rel="noreferrer">
          <GithubOutlined />
        </a>
      </div>
    </div>
  </div>
)

const RepositoryList = (props: {
  loading: boolean
  list: StarredRepositoryEdge[]
  onItemSelected: (index: number) => void
}) => {

  const loading = props.loading && props.list.length === 0

  return (
    <div style={{
      padding: loading ? 20 : 0,
    }}>
      <Skeleton loading={loading} active>
        <Menu
          mode={'inline'}
          theme={'light'}
        >
          {props.list.map((item: StarredRepositoryEdge, i: number) => (
            <Menu.Item
              key={i}
              style={{
                height: 'auto',
                padding: '0 12px',
                margin: 0,
                borderBottomColor: '#eee',
                borderBottomStyle: 'solid',
                borderBottomWidth: 1,
              }}>
              <RepositoryItem repo={item.node} onClick={() => props.onItemSelected(i)} />
            </Menu.Item>
          ))}
        </Menu>
      </Skeleton>
      <Skeleton loading={loading} active />
      <Skeleton loading={loading} active />
      <Skeleton loading={loading} active />
    </div>
  )
}

export default RepositoryList