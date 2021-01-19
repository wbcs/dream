```tsx
import React, { useRef, useState } from 'react';
import styles from './virtualList.module.less';
interface IProps {
  data: { value: number }[];
}

const height = 30;
const totalHeight = 400;
const viewPartItemNum =
  totalHeight % height === 0
    ? totalHeight / height
    : Math.floor(totalHeight / height) + 1;

const BUFFER_SIZE = 1;

const VirtualList: React.FC<IProps> = ({ data }) => {
  const [offsetInfo, setOffsetInfo] = useState({
    start: 0,
    end: Math.min(viewPartItemNum, data.length),
  });
  const scrollSectionRef = useRef<HTMLDivElement>(null);
  const viewSectionRef = useRef<HTMLUListElement>(null);

  const updateRenderItemsAndOffsetY = () =>
    requestAnimationFrame(() => {
      const { start: prevStart, end: prevEnd } = offsetInfo;
      const scrollTop = scrollSectionRef.current!.scrollTop;
      let start = Math.floor(scrollTop / height);
      const end = Math.min(start + viewPartItemNum + BUFFER_SIZE, data.length);

      if (prevStart === start || prevEnd === end) return;

      const translateY = Math.max(
        start - prevStart <= 0 ? scrollTop - height : scrollTop,
        0
      );
      setOffsetInfo({ start, end });
      viewSectionRef.current!.style.transform = `translateY(${translateY}px)`;
    });

  const { start, end } = offsetInfo;
  const renderItems = data.slice(start, end);
  return (
    <div
      className={styles.scrollSection}
      ref={scrollSectionRef}
      style={{ height: totalHeight }}
      onWheel={updateRenderItemsAndOffsetY}
      onScroll={updateRenderItemsAndOffsetY}
    >
      <div style={{ height: height * data.length }}>
        <ul className={styles.viewSection} ref={viewSectionRef}>
          {renderItems.map((item) => (
            <li key={item.value} style={{ height: height }}>
              {item.value}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default VirtualList;
```

`./virtualList.module.less` :

```less
.scroll-section {
  position: relative;
  width: 500px;
  overflow: auto;
}
.view-section {
  position: absolute;
  top: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  flex-wrap: wrap;
  transform: translateY(0);
  padding: 0;
  width: 100%;

  li {
    padding: 0;
    padding-left: 1em;
    outline: 1px solid #eee;
  }
}
```
