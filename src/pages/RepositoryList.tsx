import {
  Menu,
  Tag,
} from 'antd'
import {
  StarOutlined,
  ForkOutlined,
  TagOutlined,
  CalendarOutlined,
  GithubOutlined,
} from '@ant-design/icons'
import moment from 'moment'

import { Repository } from '../lib/github/types'
import { languageColor } from '../lib/github/colors'
import { ReactChild, ReactNode, FunctionComponent } from 'react'
import Color from 'color'

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
      // borderRadius: '50%',
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
    <div>{props.repo.full_name}</div>
    <p style={{ wordWrap: 'break-word', color: 'gray', whiteSpace: 'normal', lineHeight: 'normal' }}>
      {props.repo.description}
    </p>
    <div style={{ display: 'flex', color: 'gray' }}>
      <div style={{ flex: 1, fontSize: 8, alignItems: 'center' }} >
        {props.repo.language && (
          <TagIcon icon={(
            <Circular color={languageColor(props.repo.language).color} />
          )}>{props.repo.language}</TagIcon>
        )}

        {/* stars */}
        <TagIcon icon={(
          <StarOutlined style={{ margin: 0 }} />
        )}>{props.repo.stargazers_count}</TagIcon>
        {/* forks */}
        <TagIcon icon={(
          <ForkOutlined style={{ margin: 0 }} />
        )}>{props.repo.forks_count}</TagIcon>
        {/* TODO: request from api */}
        {/* lastest tag */}
        <TagIcon icon={(
          <TagOutlined style={{ margin: 0 }} />
        )}>{'v1.0'}</TagIcon>
        {/* lastest updated */}
        <TagIcon icon={(
          <CalendarOutlined style={{ margin: 0 }} />
        )}>{moment(props.repo.updated_at).fromNow(true)}</TagIcon>
      </div>
      <div>
        <a href={`https://github.com/${props.repo.full_name}`} target="_blank" rel="noreferrer">
          <GithubOutlined />
        </a>
      </div>
    </div>
  </div>
)

const RepositoryList = (props: {
  list: Repository[]
  onItemSelected: (index: number) => void
}) => (
  <Menu
    mode={'inline'}
    theme={'light'}
  >
    {props.list.map((item: Repository, i: number) => (
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
        <RepositoryItem repo={item} onClick={() => props.onItemSelected(i)} />
      </Menu.Item>
    ))}

  </Menu >
)

export default RepositoryList