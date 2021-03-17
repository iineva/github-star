import {
  Collapse,
  Tag, Spin,
} from 'antd'
import {
  SyncOutlined,
} from '@ant-design/icons'
import { languageColor } from '../common/github/colors'

const { Panel } = Collapse

const computeTagColor = (s: string): string => {
  return languageColor(s).color
}

const TagList = (props: {
  loading: boolean
  groups: {
    title: string
    tags: string[]
  }[]
  onReloadClick: () => void
}) => (
  <>
    <Panel key="-1" header={(
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex' }}>
          <span style={{ flex: 1, fontWeight: 'bold' }}>Stars</span>
          <span>
            <SyncOutlined spin={props.loading} onClick={props.onReloadClick} />
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
    <Collapse defaultActiveKey={props.groups.map((row, i) => i)} ghost>
      {props.groups.map((g, i) => (
        <Panel header={g.title} style={{ textTransform: 'uppercase', fontWeight: 'bold' }} key={i}>
          {g.tags.map((t, j) => (
            <Tag key={j} color={computeTagColor(t)} style={{ textTransform: 'none' }}>{t}</Tag>
          ))}
        </Panel>
      ))}
    </Collapse>
  </>
)


export default TagList