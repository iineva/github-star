import React from 'react'
import {
  Layout, Divider,
} from 'antd'
import {
  MenuUnfoldOutlined, MenuFoldOutlined,
} from '@ant-design/icons'
import './App.css'


import TagList from './pages/TagList'
import RepositoryList from './pages/RepositoryList'
import Readme from './pages/Readme'

import { Repository } from './lib/github/types'
import userStars from './data/user-stars.json'

const { Header, Sider } = Layout


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

  render = () => (
    <Layout>

      {/* all tags */}
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
        <TagList reloading={this.state.reloading} groups={this.state.groups} onReloadClick={() => {
          this.setState({ reloading: !this.state.reloading })
        }} />
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

      {/* readme content */}
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
