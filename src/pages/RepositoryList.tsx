import {
  Menu,
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

const RepositoryItem = (props: {
  info: Repository
  onClick: () => void
}) => (
  <div onClick={props.onClick}>
    <div>{props.info.full_name}</div>
    <p style={{ wordWrap: 'break-word', color: 'gray', whiteSpace: 'normal', lineHeight: 'normal' }}>
      {props.info.description}
    </p>
    <div style={{ display: 'flex', color: 'gray' }}>
      <div style={{ flex: 1, fontSize: 8 }}>
        <span style={{ marginRight: 8 }}><StarOutlined style={{ margin: 0, marginRight: 2 }} />{props.info.stargazers_count}</span>
        <span style={{ marginRight: 8 }}><ForkOutlined style={{ margin: 0, marginRight: 2 }} />{props.info.forks_count}</span>
        {/* TODO: request from api */}
        <span style={{ marginRight: 8 }}><TagOutlined style={{ margin: 0, marginRight: 2 }} />v1.0</span>
        <span style={{ marginRight: 8 }}><CalendarOutlined style={{ margin: 0, marginRight: 2 }} />{moment(props.info.updated_at).fromNow(true)}</span>
      </div>
      <div>
        <a href={`https://github.com/${props.info.full_name}`} target="_blank" rel="noreferrer">
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
    // style={{ width: 256 }}
    // defaultSelectedKeys={['1']}
    // defaultOpenKeys={['sub1']}
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
        <RepositoryItem info={item} onClick={() => props.onItemSelected(i)} />
      </Menu.Item>
    ))}

  </Menu >
)

export default RepositoryList