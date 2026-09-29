import CodeBlock from "@/components/track/CodeBlock";
import Diagram from "@/components/track/Diagram";

// A tiny, dependency-free markdown-ish renderer just for answer text.
// Supports: **bold**, `inline code`, fenced ```code blocks```,
// "- " bullet lists, and simple "| a | b |" tables.
// This keeps the JSON answers easy to read/write while still looking
// good on the page, without pulling in a full markdown library.

function renderInline(text, keyPrefix) {
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  const parts = text.split(regex).filter((p) => p.length > 0);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${keyPrefix}-b-${i}`}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code className="qa-inline-code" key={`${keyPrefix}-c-${i}`}>
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function parseRow(line) {
  return line
    .split("|")
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
}

function renderTable(lines, key) {
  const headerCells = parseRow(lines[0]);
  const bodyLines = lines.slice(2); // line[1] is the "---|---" separator

  return (
    // tables phone par 100% se zyada ho jaate hain -- isliye ek scroll wrapper
    <div className="qa-table-wrap" key={key}>
      <table className="qa-answer-table">
        <thead>
          <tr>
            {headerCells.map((c, i) => (
              <th key={`${key}-th-${i}`}>{renderInline(c, `${key}-th-${i}`)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyLines.map((line, ri) => (
            <tr key={`${key}-tr-${ri}`}>
              {parseRow(line).map((c, ci) => (
                <td key={`${key}-td-${ri}-${ci}`}>
                  {renderInline(c, `${key}-td-${ri}-${ci}`)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderTextBlock(text, blockIndex) {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return paragraphs.map((para, pi) => {
    const key = `p-${blockIndex}-${pi}`;
    const lines = para.split("\n").map((l) => l.trim()).filter(Boolean);

    if (lines.length > 1 && lines.every((l) => l.startsWith("|"))) {
      return renderTable(lines, key);
    }

    if (lines.length > 0 && lines.every((l) => l.startsWith("- "))) {
      return (
        <ul className="qa-answer-list" key={key}>
          {lines.map((l, li) => (
            <li key={`${key}-li-${li}`}>
              {renderInline(l.replace(/^- /, ""), `${key}-li-${li}`)}
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p className="qa-answer-para" key={key}>
        {renderInline(para, key)}
      </p>
    );
  });
}

// Renders the richer, structured answer shape used by the Python track.
// Two answer shapes are supported side by side, so older and newer
// question JSON files both render correctly without touching this file
// again:
//   v1 (older modules): { explanation, how_it_works,
//     code_examples: [{title, code, explanation}], important_points,
//     common_mistakes, real_world_usage, interview_tip }
//   v2 (module_0_v2 onwards): { short_answer, detailed_explanation,
//     code_examples: [{title, code, output, explanation}] }
// Every field is rendered as-is — this only decides layout/formatting,
// it never changes the wording of any field.
/* --- Diagrams -------------------------------------------------------------
   `answer.diagrams` ek array hai, har element apne `type` ke hisaab se
   components/track/Diagram.js me render hota hai (flow / compare / matrix / refs).

   `anchor` se decide hota hai diagram kahan lagega:
     "short"  -> short answer ke turant baad
     "code"   -> code examples se pehle
     "end"    -> answer ke bilkul end me (interview tip ke baad)
   anchor na diya ho to "explanation" (detailed explanation ke baad) hota hai.
   ------------------------------------------------------------------------ */

function pickDiagrams(diagrams, anchor) {
  return (diagrams || []).filter((d) => d && d.type && (d.anchor || "explanation") === anchor);
}

function renderDiagrams(diagrams, anchor, keyPrefix) {
  return pickDiagrams(diagrams, anchor).map((d, i) => (
    <Diagram diagram={d} key={`${keyPrefix}-dg-${anchor}-${i}`} />
  ));
}

export function renderRichAnswer(answer, keyPrefix = "a") {
  const sections = [];

  // "Quick answer" -- short_answer (v2) ya explanation (v1), jo bhi mile
  const quickAnswer = answer.short_answer || answer.explanation;
  if (quickAnswer) {
    sections.push(
      <div className="qa-quick-answer" key={`${keyPrefix}-quick`}>
        <span className="qa-quick-answer-label">Quick answer</span>
        <p>{renderInline(quickAnswer, `${keyPrefix}-quick`)}</p>
      </div>
    );
  }

  // "short" anchor wale diagrams -- quick answer ke turant baad
  const afterQuick = renderDiagrams(answer.diagrams, "short", keyPrefix);
  if (afterQuick.length > 0) sections.push(...afterQuick);

  // "Detailed explanation" -- detailed_explanation (v2) ya how_it_works (v1)
  const detailed = answer.detailed_explanation || answer.how_it_works;
  if (detailed) {
    sections.push(
      <div className="qa-section" key={`${keyPrefix}-detail`}>
        <h4 className="qa-section-title">Detailed explanation</h4>
        {/* renderTextBlock -- isse field me paragraph breaks aur "- " bullets
            render hote hain. Ek chhoti field pehle ek hi <p> ban rahi thi,
            isliye bade answers paragraph me toote nahi the. */}
        {renderTextBlock(detailed, `${keyPrefix}-detail`)}
      </div>
    );
  }

  // Default anchor: diagram detailed explanation ke baad lagta hai
  const afterDetail = renderDiagrams(answer.diagrams, "explanation", keyPrefix);
  if (afterDetail.length > 0) sections.push(...afterDetail);

  // "code" anchor wale diagrams -- code examples se pehle
  const preCodeDiagrams = renderDiagrams(answer.diagrams, "code", keyPrefix);
  if (preCodeDiagrams.length > 0) sections.push(...preCodeDiagrams);

  if (answer.code_examples && answer.code_examples.length > 0) {
    sections.push(
      <div className="qa-section" key={`${keyPrefix}-examples`}>
        <h4 className="qa-section-title">
          {answer.code_examples.length > 1 ? "Code examples" : "Code example"}
        </h4>
        <div className="qa-example-list">
          {answer.code_examples.map((ex, i) => (
            <div className="qa-example" key={`${keyPrefix}-ex-${i}`}>
              {ex.title && <div className="qa-example-title">{ex.title}</div>}
              <CodeBlock code={ex.code} label={ex.title || "Code example"} bare />
              {ex.output && (
                <div className="qa-example-output">
                  <span className="qa-example-output-label">Output</span>
                  <pre>{ex.output}</pre>
                </div>
              )}
              {ex.explanation && (
                <p className="qa-example-caption">
                  {renderInline(ex.explanation, `${keyPrefix}-ex-${i}-cap`)}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (answer.important_points && answer.important_points.length > 0) {
    sections.push(
      <div className="qa-section" key={`${keyPrefix}-points`}>
        <h4 className="qa-section-title">Key points</h4>
        <ul className="qa-answer-list">
          {answer.important_points.map((point, i) => (
            <li key={`${keyPrefix}-point-${i}`}>
              {renderInline(point, `${keyPrefix}-point-${i}`)}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (answer.common_mistakes && answer.common_mistakes.length > 0) {
    sections.push(
      <div className="qa-section qa-section-warn" key={`${keyPrefix}-mistakes`}>
        <h4 className="qa-section-title">Common mistakes</h4>
        <ul className="qa-answer-list">
          {answer.common_mistakes.map((mistake, i) => (
            <li key={`${keyPrefix}-mistake-${i}`}>
              {renderInline(mistake, `${keyPrefix}-mistake-${i}`)}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (answer.real_world_usage) {
    sections.push(
      <div className="qa-section" key={`${keyPrefix}-usage`}>
        <h4 className="qa-section-title">Where it&apos;s used</h4>
        <p className="qa-answer-para">
          {renderInline(answer.real_world_usage, `${keyPrefix}-usage`)}
        </p>
      </div>
    );
  }

  if (answer.interview_tip) {
    sections.push(
      <div className="qa-tip" key={`${keyPrefix}-tip`}>
        <span className="qa-tip-label">Interview tip</span>
        <p>{renderInline(answer.interview_tip, `${keyPrefix}-tip-text`)}</p>
      </div>
    );
  }

  // Diagrams jo "end" anchor maange hain -- answer ke bilkul ant me
  const endDiagrams = renderDiagrams(answer.diagrams, "end", keyPrefix);
  if (endDiagrams.length > 0) sections.push(...endDiagrams);

  return sections;
}

export function renderAnswer(answer) {
  const blocks = [];
  const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(answer)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({ type: "text", content: answer.slice(lastIndex, match.index) });
    }
    blocks.push({
      type: "code",
      lang: match[1] || "",
      content: match[2].replace(/\n$/, ""),
    });
    lastIndex = codeBlockRegex.lastIndex;
  }
  if (lastIndex < answer.length) {
    blocks.push({ type: "text", content: answer.slice(lastIndex) });
  }

  return blocks.map((block, i) => {
    if (block.type === "code") {
      return (
        <CodeBlock
          key={`code-${i}`}
          code={block.content}
          lang={block.lang}
          label={`${block.lang || "code"} sample`}
        />
      );
    }
    return renderTextBlock(block.content, i);
  });
}
