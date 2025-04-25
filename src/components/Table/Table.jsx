import React, { useMemo, useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './table.module.css';

function debounce(fn, delay) {
  let timer = null;
  return (...args) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

const Table = ({
  columns = [],
  data = [],
  style = {},
  rowKey,
  onRowClick,
  headerClassName,
  rowClassName,
  onScrollEnd,
  virtualList = {
    enabled: false,
    rowHeight: 48,
    overscan: 5, // 上下额外渲染的行数
  }
}) => {
  const tableRef = useRef(null);
  const tableBodyRef = useRef(null);
  
  // 虚拟列表状态
  const [virtualState, setVirtualState] = useState({
    startIndex: 0,
    endIndex: 0,
    scrollTop: 0,
    visibleCount: 0,
    totalHeight: 0
  });

  // 使用useMemo缓存列配置，避免不必要的重渲染
  const normalizedColumns = useMemo(() => {
    return columns.map((column) => ({
      ...column,
      key: column.key || column.dataIndex,
    }));
  }, [columns]);

  // 处理行点击事件
  const handleRowClick = (record, index) => {
    onRowClick && onRowClick(record, index);
  };

  // 初始化虚拟列表
  useEffect(() => {
    if (virtualList.enabled && tableRef.current && data.length > 0) {
      // 获取表格容器高度
      const containerHeight = tableRef.current.clientHeight;
      // 获取行高
      const rowHeight = virtualList.rowHeight;
      // 计算可视行数
      const visibleCount = Math.ceil(containerHeight / rowHeight);
      // 计算表格总高度
      const totalHeight = data.length * rowHeight;
      // 计算需要渲染的行数
      setVirtualState(prev => ({
        ...prev,
        visibleCount,
        totalHeight,
        // 计算需要渲染的行数
        endIndex: Math.min(visibleCount + virtualList.overscan - 1, data.length - 1)
      }));
    }
  }, [data.length, virtualList.enabled, virtualList.rowHeight, virtualList.overscan]);

  // 处理滚动更新虚拟列表视图
  const updateVirtualView = (scrollTop) => {
    if (virtualList.enabled && data.length > 0) {
      const rowHeight = virtualList.rowHeight;
      // 计算当前滚动到的行
      const currentIndex = Math.floor(scrollTop / rowHeight);
      // 计算需要渲染的行数
      const startIndex = Math.max(0, currentIndex - virtualList.overscan);
      const visibleCount = virtualState.visibleCount;
      const endIndex = Math.min(
        startIndex + visibleCount + 2 * virtualList.overscan,
        data.length - 1
      );
      
      setVirtualState(prev => ({
        ...prev,
        startIndex,
        endIndex,
        scrollTop
      }));
    }
  };

  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    const scrollHeight = tableRef.current.scrollHeight;
    const clientHeight = tableRef.current.clientHeight;
    
    // 虚拟列表滚动处理
    if (virtualList.enabled) {
      updateVirtualView(scrollTop);
    }
    
    // 滚动到底部检测
    if (scrollTop + clientHeight >= scrollHeight) {
      onScrollEnd && onScrollEnd();
    }
  };

  const debounceScroll = debounce(handleScroll, 100);

  // 计算需要渲染的数据
  const renderData = useMemo(() => {
    if (virtualList.enabled && data.length > 0) {
      return data.slice(virtualState.startIndex, virtualState.endIndex + 1);
    }
    return data;
  }, [data, virtualList.enabled, virtualState.startIndex, virtualState.endIndex]);

  // 计算顶部填充高度
  const topPadding = useMemo(() => {
    if (virtualList.enabled && virtualState.startIndex > 0) {
      return virtualState.startIndex * virtualList.rowHeight;
    }
    return 0;
  }, [virtualList.enabled, virtualState.startIndex, virtualList.rowHeight]);

  // 计算底部填充高度
  const bottomPadding = useMemo(() => {
    if (virtualList.enabled && data.length > 0) {
      const remainingItems = data.length - (virtualState.endIndex + 1);
      return Math.max(0, remainingItems * virtualList.rowHeight);
    }
    return 0;
  }, [virtualList.enabled, data.length, virtualState.endIndex, virtualList.rowHeight]);

  return (
    <div className={styles.tableContainer} ref={tableRef} onScroll={debounceScroll} style={style}>
      <table className={styles.table}>
        <thead>
          <tr className={headerClassName}>
            {normalizedColumns.map((column, index) => (
              <th key={column.key || index} style={column.style} className={column.className}>
                {column.renderHeader ? column.renderHeader(column) : column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody ref={tableBodyRef}>
          {/* 虚拟列表顶部填充 */}
          {virtualList.enabled && topPadding > 0 && (
            <tr style={{ height: `${topPadding}px` }} className={styles.virtualSpacerRow} />
          )}
          
          {/* 渲染可见行 */}
          {renderData.map((row, localIndex) => {
            const rowIndex = virtualList.enabled 
              ? virtualState.startIndex + localIndex 
              : localIndex;
              
            return (
              <tr
                key={rowKey ? row[rowKey] : rowIndex}
                onClick={() => handleRowClick(row, rowIndex)}
                className={rowClassName}
                style={virtualList.enabled ? { height: `${virtualList.rowHeight}px` } : {}}
              >
                {normalizedColumns.map((column, colIndex) => (
                  <td
                    key={column.key || colIndex}
                    className={column.bodyCellClassName}
                    style={column.bodyCellStyle}
                  >
                    {column.render
                      ? column.render(row[column.dataIndex], row, rowIndex)
                      : row[column.dataIndex] !== undefined
                        ? row[column.dataIndex]
                        : ''}
                  </td>
                ))}
              </tr>
            );
          })}
          
          {/* 虚拟列表底部填充 */}
          {virtualList.enabled && bottomPadding > 0 && (
            <tr style={{ height: `${bottomPadding}px` }} className={styles.virtualSpacerRow} />
          )}
        </tbody>
      </table>
    </div>
  );
};

Table.propTypes = {
  /**
   * 表格列的配置描述
   * [
   *   {
   *     title: '姓名',           // 列头显示文字
   *     dataIndex: 'name',      // 列数据在数据项中对应的路径
   *     key: 'name',            // React key，如果不指定则使用dataIndex
   *     render: (text, record, index) => {},  // 生成复杂数据的渲染函数
   *     renderHeader: (column) => {},         // 自定义表头渲染函数
   *     style: { width: '100px' },            // 表头样式
   *     className: '',                        // 表头单元格类名
   *     bodyCellStyle: {},                    // 数据单元格样式
   *     bodyCellClassName: ''                 // 数据单元格类名
   *   }
   * ]
   */
  columns: PropTypes.array.isRequired,
  
  /**
   * 数据数组
   */
  data: PropTypes.array,
  
  /**
   * 表格容器样式
   */
  style: PropTypes.object,
  
  /**
   * 表格行的key，如果指定则用作行的key值，否则使用索引
   */
  rowKey: PropTypes.string,
  
  /**
   * 行点击事件
   */
  onRowClick: PropTypes.func,
  
  /**
   * 表头行的类名
   */
  headerClassName: PropTypes.string,
  
  /**
   * 行的类名
   */
  rowClassName: PropTypes.string,

  /**
   * 滚动到底部时触发
   */
  onScrollEnd: PropTypes.func,

  /**
   * 虚拟列表配置
   * {
   *   enabled: false,       // 是否启用虚拟列表
   *   rowHeight: 48,        // 行高（必须固定）
   *   overscan: 5           // 上下额外渲染的行数
   * }
   */
  virtualList: PropTypes.shape({
    enabled: PropTypes.bool,
    rowHeight: PropTypes.number,
    overscan: PropTypes.number
  })
};

export default React.memo(Table);
