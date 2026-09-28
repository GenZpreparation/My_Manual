"use client";

import { memo, useCallback, useState } from "react";
import { renderRichAnswer } from "@/lib/renderAnswer";

// Har question ka apna memoized row. Module switch / kisi dusre question ko
// kholne pe sirf 2 rows re-render hoti hain, baaki 40+ nahi -- isse bade
// module (60+ questions) me bhi accordion turant feel hota hai.
const QuestionItem = memo(function QuestionItem({
  item,
  index,
  num,
  isOpen,
  renderAll,
  onToggle,
}) {
  return (
    <div className={`qa-item${isOpen ? " is-open" : ""}`} id={`qa-${index}`}>
      <h3 className="qa-h">
        <button
          type="button"
          className="qa-question"
          onClick={() => onToggle(index)}
          aria-expanded={isOpen}
          aria-controls={`qa-panel-${index}`}
        >
          <span className="qa-num" aria-hidden="true">
            {num}
          </span>
          <span className="qa-q-text">{item.q}</span>
          <span className="qa-toggle" aria-hidden="true">
            {isOpen ? "−" : "+"}
          </span>
        </button>
      </h3>
      {/* hidden hamesha !isOpen pe hai (renderAll hone par bhi) -- isse
          content HTML me rehta hai (SEO) par band question dikhta nahi */}
      <div id={`qa-panel-${index}`} hidden={!isOpen}>
        {(renderAll || isOpen) && (
          <div className="qa-answer-wrap">
            <div className="qa-answer">
              {item.categoryLabel && <span className="qa-q-tag">{item.categoryLabel}</span>}
              {renderRichAnswer(item.a, `q-${num}`)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default function QuestionList({ category, startIndex, defaultOpen = null, renderAll = false }) {
  const [openIndex, setOpenIndex] = useState(defaultOpen);

  const toggle = useCallback((i) => {
    setOpenIndex((cur) => (cur === i ? null : i));
  }, []);

  const questions = category.questions;

  return (
    <div className="qa-list">
      {questions.map((item, i) => (
        <QuestionItem
          key={item.q}
          item={item}
          index={i}
          num={String(startIndex + i + 1).padStart(2, "0")}
          isOpen={openIndex === i}
          renderAll={renderAll}
          onToggle={toggle}
        />
      ))}
    </div>
  );
}
