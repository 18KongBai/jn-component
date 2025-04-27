# jn-component

React组件库

## 安装

```bash
npm install @kanghuhui/jn-component
# 或
yarn add @kanghuhui/jn-component
```

## 使用方法

### Table组件

```jsx
import { Table } from '@kanghuhui/jn-component';
import React from 'react';

function App() {
  // 定义表格列配置
  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      render: (name, record, index) => (
        <div>
          <span>{name}</span>
          <span>{record.code}</span>
        </div>
      ),
    },
    {
      title: '数值',
      dataIndex: 'price',
    },
    {
      title: '操作',
      dataIndex: 'action',
      renderHeader: () => <div>自定义表头</div>,
      render: (text, record, index) => (
        <div
          onClick={() => {
            console.log(record);
          }}
        >
          {record.isSelected ? (
            <button>已选择</button>
          ) : (
            <button>待选择</button>
          )}
        </div>
      ),
    },
  ];
  
  // 准备数据
  const data = [
    ...new Array(10).fill(0).map((item, index) => ({
      name: `数据项${index}`,
      code: Math.random().toString(36).substring(2, 8),
      price: '0.214',
      change: '0.001',
      isSelected: index % 2 === 0,
    })),
  ];
  
  // 行点击事件处理
  const handleRowClick = (record, index) => {
    console.log(record, index);
  };
  
  // 滚动到底部事件处理
  const handleScrollEnd = () => {
    console.log('滚动到底部');
  };
  
  return (
    <Table
      rowClassName="custom-row"
      onRowClick={handleRowClick}
      columns={columns}
      data={data}
      style={{ width: '100%', height: '300px', borderRadius: '8px' }}
      rowKey="code"
      onScrollEnd={handleScrollEnd}
      virtualList={{
        enabled: true,
        rowHeight: 60,
        overscan: 2,
        throttleDelay: 200,
      }}
    />
  );
}

export default App;
```

### TabBar组件

```jsx
import { TabBar } from '@kanghuhui/jn-component';
import React from 'react';

function App() {
  // 定义标签列表
  const tabList = [
    {
      key: 'home',
      label: '首页',
      icon: 'https://example.com/home.png',
      iconActive: 'https://example.com/home-active.png'
    },
    {
      key: 'mine',
      label: '我的',
      icon: 'https://example.com/mine.png',
      iconActive: 'https://example.com/mine-active.png'
    }
  ];
  
  // 标签点击回调
  const handleTabClick = (currentTab, nextTab) => {
    console.log('从', currentTab, '切换到', nextTab);
    // 返回true允许切换，返回false阻止切换
    return true;
  };
  
  // 自定义渲染标签项（可选）
  const renderTabItem = (tab) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img 
          src={tab.isActive ? tab.iconActive : tab.icon} 
          alt={tab.label} 
          style={{ width: '24px', height: '24px' }}
        />
        <span style={{ color: tab.isActive ? '#cc1f1f' : '#333' }}>
          {tab.label}
        </span>
      </div>
    );
  };
  
  return (
    <TabBar
      tabList={tabList}
      onTabClick={handleTabClick}
      tabItem={renderTabItem} // 可选
      storageKey="my_app_tab" // 可选，用于多页面共享状态
      defaultKey="home" // 可选，默认选中的标签
    />
  );
}

export default App;
```

## 组件属性

### Table组件属性

| 属性 | 类型 | 说明 |
|------|------|------|
| columns | Array | 表格列配置，包含title、dataIndex、render、renderHeader等属性 |
| data | Array | 表格数据 |
| style | Object | 表格样式 |
| rowKey | string | 行数据的唯一标识字段 |
| onRowClick | Function | 行点击事件处理函数 |
| headerClassName | string | 表头行className |
| rowClassName | string | 表格行className |
| onScrollEnd | Function | 滚动到底部事件处理函数 |
| virtualList | Object | 虚拟列表配置，包含以下属性：<br/>- enabled: 是否启用虚拟列表<br/>- rowHeight: 行高（必须固定）<br/>- overscan: 上下额外渲染的行数<br/>- throttleDelay: 滚动节流时间，单位毫秒，默认200ms |

### TabBar组件属性

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| tabList | Array | 是 | 标签项配置数组，每项包含以下属性：<br/>- key: 标签唯一标识<br/>- label: 标签文本<br/>- icon: 未选中时的图标<br/>- iconActive: 选中时的图标<br/>- isHidden: 是否隐藏该标签 |
| onTabClick | Function | 否 | 标签点击回调，参数为(currentTab, nextTab)，返回true/false或Promise决定是否切换 |
| tabItem | Function | 否 | 自定义渲染标签项内容，参数为标签项配置加上isActive状态 |
| style | Object | 否 | 容器样式 |
| storageKey | String | 否 | sessionStorage存储键名，用于多页面共享选中状态，默认为'global_active_tab' |
| defaultKey | String | 否 | 默认选中的标签key |

## 开发

```bash
# 安装依赖
npm install

# 构建
npm run build
```

## 源代码访问

为了方便开发者阅读和理解组件实现，我们在打包过程中直接将所有源文件复制到了 `dist/src` 目录下。在这里你可以找到完整的组件源代码，包括：

- 所有JavaScript/JSX文件
- CSS样式文件
- 完整的目录结构

你可以直接访问这些文件来学习和参考组件的实现：

```
node_modules/@kanghuhui/jn-component/dist/src/components/Table/Table.jsx
node_modules/@kanghuhui/jn-component/dist/src/components/Table/table.module.css
node_modules/@kanghuhui/jn-component/dist/src/components/TabBar/TabBar.jsx
node_modules/@kanghuhui/jn-component/dist/src/components/TabBar/TabBar.module.css
```

## 许可证

ISC 