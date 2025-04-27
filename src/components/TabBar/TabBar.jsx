import React, { useCallback, useState, useEffect } from 'react';
import styles from './TabBar.module.css';
import PropTypes from 'prop-types';

const STORAGE_KEY = 'global_active_tab';

/**
 * TabBar 组件 - 可在多个页面间共享状态的标签栏
 * @param {Object} props - 组件属性
 * @param {Array} props.tabList - 标签项列表
 * @param {Function} props.onTabClick - 标签点击回调，返回true/false或Promise决定是否切换
 * @param {Function} props.tabItem - 自定义渲染标签项内容
 * @param {Object} props.style - 容器样式
 * @param {String} props.storageKey - sessionStorage存储键名
 * @param {String} props.defaultKey - 默认激活的标签key
 */
const TabBar = ({
  tabList,
  onTabClick,
  tabItem,
  style = {},
  storageKey = STORAGE_KEY,
  defaultKey,
}) => {
  // 初始化时从 sessionStorage 读取
  const getDefaultActive = () => {
    // 检查tabList是否为空
    if (!tabList || !tabList.length) return '';
    
    const saved = sessionStorage.getItem(storageKey);
    if (saved && tabList.some((tab) => tab.key === saved && !tab.isHidden)) {
      return saved;
    }
    // 有默认的取默认
    if(defaultKey && tabList.some(tab => tab.key === defaultKey && !tab.isHidden)) {
      return defaultKey;
    }
    return tabList.find((tab) => !tab.isHidden)?.key || '';
  };

  const [activeKey, setActiveKey] = useState(getDefaultActive);
  
  // 监听 storage 事件，实现多实例同步
  useEffect(() => {
    const handler = (e) => {
      if (e.key === storageKey && e.newValue) {
        setActiveKey(e.newValue);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [storageKey]);

  const handleClick = useCallback(
    (tab) => {
      if (!tab || tab.key === activeKey) return;
      
      // 获取当前的tab项
      const activeTabConfig = tabList.find((item) => item.key === activeKey);
      // 将当前的tab项跟要跳转的tab项传递过去，
      // 状态的变更需要执行回调返回true
      const res = onTabClick && onTabClick(activeTabConfig, tab);
      const setTab = () => {
        setActiveKey(tab.key);
        sessionStorage.setItem(storageKey, tab.key);
      };
      
      // 处理异步回调
      if (res instanceof Promise) {
        res.then((result) => {
          if (result === undefined) {
            throw new Error('必须手动返回成功或失败状态');
          }
          if (result) setTab();
        }).catch(err => {
          console.error('TabBar 切换失败:', err);
        });
      } 
      // 处理同步回调
      else {
        if (res === undefined) {
          throw new Error('必须手动返回成功或失败状态');
        }
        if (res) setTab();
      }
    },
    [activeKey, onTabClick, tabList, storageKey],
  );

  // 如果tabList为空，不渲染
  if (!tabList || !tabList.length) return null;

  return (
    <div className={styles.tabBar} style={style}>
      {tabList
        .filter((tab) => !tab.isHidden)
        .map((tab, index) => {
          const isActive = tab.key === activeKey;
          return (
            <div
              key={tab.key || index}
              className={`${styles.tabItem} ${isActive ? styles.active : ''}`}
              onClick={() => handleClick(tab)}
            >
              {tabItem ? (
                tabItem({ ...tab, isActive })
              ) : (
                <>
                  <img 
                    src={isActive ? tab.iconActive : tab.icon} 
                    alt={tab.label || tab.key} 
                  />
                  <span>{tab.label}</span>
                </>
              )}
            </div>
          );
        })}
    </div>
  );
};

TabBar.propTypes = {
  tabList: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
      iconActive: PropTypes.string.isRequired,
      isHidden: PropTypes.bool,
    }),
  ).isRequired,
  defaultKey: PropTypes.string,
  onTabClick: PropTypes.func,
  tabItem: PropTypes.func,
  style: PropTypes.object,
  storageKey: PropTypes.string,
};

TabBar.defaultProps = {
  style: {},
  storageKey: STORAGE_KEY,
};

export default React.memo(TabBar);
