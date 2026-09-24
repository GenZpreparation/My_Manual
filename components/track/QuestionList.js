"use client";

import { useState } from "react";
import { renderRichAnswer } from "@/lib/renderAnswer";

export default function QuestionList({ category, startIndex, defaultOpen = null, renderAll = false }) {
  const [openIndex, setOpenIndex] = useState(defaultOpen);

  return (
    <div className="qa-list">
      {category.questions.map((item, i) => {
        const isOpen = openIndex === i;
        const num = String(startIndex + i + 1).padStart(2, "0");
        return (
          <div className={`qa-item${isOpen ? " is-open" : ""}`} key={item.q} id={`qa-${i}`}>
            <h3 className="qa-h">
            <button
              className="qa-question"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
            >
              <span className="qa-num">{num}</span>
              <span className="qa-q-text">{item.q}</span>
              <span className="qa-toggle" aria-hidden="true">
                {isOpen ? "−" : "+"}
              </span>
            </button>
            </h3>
            {(renderAll || isOpen) && (<div className="qa-answer-wrap" hidden={!isOpen}>
                <div className="qa-answer">
                  {item.categoryLabel && (
                    <span className="qa-q-tag">{item.categoryLabel}</span>
                  )}
                  {renderRichAnswer(item.a, `q-${startIndex + i}`)}
                </div>
              </div>)}
          </div>
        );
      })}
    </div>
  );
}
