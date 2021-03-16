import React from 'react'
import {
  Layout, Divider,
  Collapse,
  Tag, Spin,
} from 'antd'
import {
  MenuUnfoldOutlined, MenuFoldOutlined,
  SyncOutlined,
} from '@ant-design/icons'
import './App.css'


import RepositoryList from './pages/RepositoryList'
import Readme from './pages/Readme'

import { Repository } from './lib/github/types'
import { stringToNumbers } from './lib/string'
import userStars from './data/user-stars.json'

const { Header, Sider } = Layout
const { Panel } = Collapse

const tagColors = [
  "magenta",
  "red",
  "volcano",
  "orange",
  "gold",
  "lime",
  "green",
  "cyan",
  "blue",
  "geekblue",
  "purple",
]

class App extends React.Component<{}, {
  collapsed: boolean
  reloading: boolean
  stars: Repository[]
  selectedRepository: Repository | undefined
}> {

  state = {
    collapsed: false,
    reloading: false,
    stars: [],
    groups: [{
      title: 'tags',
      tags: ['iOS', 'Android', 'React', 'React Native']
    }, {
      title: 'languages',
      tags: ['Object-C', 'Java', 'JavaScript']
    }, {
      title: 'default tags',
      tags: ['iOS', 'Android', 'React Native']
    }],
    selectedRepository: undefined
  }

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    })
  }

  componentDidMount() {
    // TODO: data from api
    // github.userStars('iineva', 2).then((stars: Repository[]) => {
    //   this.setState({ stars: stars })
    // })
    this.setState({ stars: userStars })
  }

  computeTagColor = (s: string) => {
    return stringToNumbers(s || ' ').reduce((l, r) => l + r) % tagColors.length
  }

  render = () => (
    <Layout>
      <Sider
        trigger={null}
        collapsible
        collapsed={this.state.collapsed}
        collapsedWidth={0}
        width={300}
        theme='light'
        style={{
          overflow: 'auto',
          height: '100vh',
          left: 0,
          borderRightWidth: 1,
          borderRightColor: '#ddd',
          borderRightStyle: 'solid',
        }}
      >
        {/* all tags */}
        <Panel key="-1" header={(
          <div style={{ padding: 20 }}>
            <div style={{ display: 'flex' }}>
              <span style={{ flex: 1, fontWeight: 'bold' }}>Stars</span>
              <span>
                <SyncOutlined spin={this.state.reloading} onClick={() => {
                  this.setState({ reloading: !this.state.reloading })
                }} />
              </span>
            </div>
            <div>
              <div>All Stars</div>
              <div>Untagged Stars</div>
            </div>
          </div>
        )}>
          <Spin />
        </Panel>
        <Collapse defaultActiveKey={this.state.groups.map((row, i) => i)} ghost>
          {this.state.groups.map((g, i) => (
            <Panel header={g.title} style={{ textTransform: 'uppercase', fontWeight: 'bold' }} key={i}>
              {g.tags.map((t, j) => (
                <Tag key={j} color={tagColors[this.computeTagColor(t)]} style={{ textTransform: 'none' }}>{t}</Tag>
              ))}
            </Panel>
          ))}
        </Collapse>
      </Sider>

      {/* repository list */}
      <Sider
        theme='light'
        width={350}
        collapsible
        collapsed={this.state.collapsed}
        collapsedWidth={0}
        style={{
          overflow: 'auto',
          height: '100vh',
          left: 0,
        }}
      >
        <Divider orientation="left">Repository</Divider>
        <RepositoryList list={this.state.stars} onItemSelected={(index: number) => {
          this.setState({ selectedRepository: this.state.stars[index] })
        }} />
      </Sider>
      <Layout
        style={{
          overflow: 'auto',
          height: '100vh',
          left: 0,
          background: '#fff',
        }}
      >
        <Header style={{ padding: '0 20px', background: '#fff' }}>
          {React.createElement(this.state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
            className: 'trigger',
            onClick: this.toggle,
          })}
        </Header>
        <Readme repo={this.state.selectedRepository} />
      </Layout>

    </Layout>
  )
}

export default App
