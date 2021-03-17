import { ReactChild, ReactNode, FunctionComponent, useState } from 'react'
import {
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

import List from 'react-virtualized/dist/commonjs/List'
import CellMeasurer from 'react-virtualized/dist/commonjs/CellMeasurer'
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer'
import { CellMeasurerCache } from 'react-virtualized'
import 'react-virtualized/styles.css'

import { kFormatter } from '../common/string'
import { Repository, StarredRepositoryEdge } from '../common/github/graphql'
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
  selected?: boolean
}) => (
  <div
    onClick={props.onClick}
    className={props.selected ? 'ant-menu-item ant-menu-item-only-child ant-menu-item-selected' : 'ant-menu-item'}
    style={{
      // padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#ddd5',
      borderBottomStyle: 'solid',
      height: '100%',
      // margin: 0,
    }}>
    <div>{props.repo.nameWithOwner}</div>
    <p className='repo-desc'>
      {props.repo.description}
    </p>
    <div style={{ display: 'flex', color: 'gray' }}>
      <div style={{ flex: 1, fontSize: 12, alignItems: 'center' }} >
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

const _cache = new CellMeasurerCache({
  fixedWidth: true,
  minHeight: 100,
})

// const _rowRenderer = (list: StarredRepositoryEdge[]) => 

const RepositoryList = (props: {
  loading: boolean
  list: StarredRepositoryEdge[]
  onItemSelected: (index: number) => void
}) => {

  const [selectedIndex, setSelectedIndex] = useState(0)
  const loading = props.loading && props.list.length === 0

  return (
    <div style={{
      // height: '100%',
      // display: 'flex',
      flex: 1,
    }} className="xxxx">
      <AutoSizer>
        {({ height, width }) => (
          <div style={{
            padding: loading ? 20 : 0,
            height,
            width,
          }}>
            <Skeleton loading={loading} active>
              <List
                width={width}
                height={height}
                style={{
                  border: 'none',
                }}
                className='repo-list-container ant-menu ant-menu-light ant-menu-root ant-menu-inline'
                rowCount={props.list.length}
                rowHeight={_cache.rowHeight}
                deferredMeasurementCache={_cache}
                rowRenderer={({ key, index, style, parent }) => {
                  return (
                    <CellMeasurer
                      cache={_cache}
                      columnIndex={0}
                      key={key}
                      rowIndex={index}
                      parent={parent}
                    >
                      {({ measure, registerChild }) => (
                        // @ts-ignore
                        <div ref={registerChild} style={style}>
                          <RepositoryItem
                            key={key}
                            selected={index === selectedIndex}
                            repo={props.list[index].node}
                            onClick={() => {
                              setSelectedIndex(index)
                              props.onItemSelected(index)
                            }}
                          />
                        </div>
                      )}
                    </CellMeasurer>
                  )
                }}
              />
            </Skeleton>
            <Skeleton loading={loading} active />
            <Skeleton loading={loading} active />
            <Skeleton loading={loading} active />
          </div>
        )}
      </AutoSizer>
    </div>
  )
}

export default RepositoryList