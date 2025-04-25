# jn-component

React组件库

## 安装

```bash
npm install jn-component
# 或
yarn add jn-component
```

## 使用方法

### Table组件

```jsx
import { Table } from 'jn-component';
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
      }}
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
| virtualList | Object | 虚拟列表配置，包含enabled、rowHeight、overscan属性 |

## 开发

```bash
# 安装依赖
npm install

# 构建
npm run build
```

## 许可证

ISC 