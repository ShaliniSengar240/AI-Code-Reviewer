import { useRef, useState } from "react";
import { Sparkles, Trash2, FileCode2, ChevronDown } from "lucide-react";
import Editor from "@monaco-editor/react";
import { submitReview } from "../api";
import ResultsPanel from "../components/ResultsPanel";

const languages = [
  { id: "python", label: "Python", monacoId: "python", ext: "py" },
  { id: "javascript", label: "JavaScript", monacoId: "javascript", ext: "js" },
  { id: "typescript", label: "TypeScript", monacoId: "typescript", ext: "ts" },
  { id: "java", label: "Java", monacoId: "java", ext: "java" },
  { id: "c++", label: "C++", monacoId: "cpp", ext: "cpp" },
];

const focuses = [
  { id: "general", label: "General" },
  { id: "security", label: "Security" },
  { id: "performance", label: "Performance" },
];

const samples = {
  python: [
    "import sqlite3",
    "import json",
    "",
    'DB_PATH = "users.db"',
    "",
    "",
    "def get_connection():",
    "    return sqlite3.connect(DB_PATH)",
    "",
    "",
    "def find_user(username):",
    "    query = \"SELECT * FROM users WHERE name = '\" + username + \"'\"",
    "    conn = get_connection()",
    "    cursor = conn.cursor()",
    "    cursor.execute(query)",
    "    row = cursor.fetchone()",
    "    conn.close()",
    "    return row",
    "",
    "",
    "def load_scores(path):",
    "    with open(path) as f:",
    "        data = json.load(f)",
    '    scores = data["scores"]',
    "    total = 0",
    "    count = 0",
    "    temp_result = []",
    "    for s in scores:",
    "        total += s",
    "        count += 1",
    "    return total / count",
    "",
    "",
    "def top_scores(scores, n):",
    "    result = []",
    "    for i in range(0, n + 1):",
    "        result.append(scores[i])",
    "    return result",
    "",
    "",
    "def calculate_average(values):",
    "    return sum(values) / len(values)",
  ].join("\n"),
  javascript: [
    "function getUser(id) {",
    '  const query = "SELECT * FROM users WHERE id = " + id;',
    "  var unused = 42;",
    "  return db.run(query);",
    "}",
  ].join("\n"),
  typescript: [
    "function getUser(id: any) {",
    '  const query = "SELECT * FROM users WHERE id = " + id;',
    "  return db.run(query);",
    "}",
  ].join("\n"),
  java: [
    "public class Main {",
    "    public static void main(String[] args) {",
    "        int unused = 5;",
    '        String q = "SELECT * FROM users WHERE id = " + args[0];',
    "        System.out.println(q);",
    "    }",
    "}",
  ].join("\n"),
  "c++": [
    "#include <iostream>",
    "int main() {",
    "    int* p = new int[10];",
    "    std::cout << p[0] << std::endl;",
    "    return 0;",
    "}",
  ].join("\n"),
};

function cssVar(name, fallback) {
  if (typeof window === "undefined") return fallback;
  const val = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return val || fallback;
}

export default function NewReview() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [focus, setFocus] = useState("general");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [review, setReview] = useState(null);

  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef(null);
  const submitRef = useRef(null);

  const activeLang = languages.find((l) => l.id === language);
  const lineCount = code ? code.split("\n").length : 0;

  function handleEditorWillMount(monaco) {
    monaco.editor.defineTheme("codereview-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": cssVar("--color-panel", "#1c1815"),
        "editor.foreground": cssVar("--color-text", "#f5f3f0"),
        "editorLineNumber.foreground": cssVar("--color-muted", "#8b93a7"),
        "editorLineNumber.activeForeground": cssVar("--color-accent", "#ffc933"),
        "editor.lineHighlightBackground": cssVar("--color-panel-2", "#262019"),
        "editorCursor.foreground": cssVar("--color-accent", "#ffc933"),
        "editor.selectionBackground": "#ffc93333",
        "scrollbarSlider.background": cssVar("--color-border", "#443a2f"),
        "scrollbarSlider.hoverBackground": cssVar("--color-accent-dim", "#d9a83c"),
        "scrollbarSlider.activeBackground": cssVar("--color-accent", "#ffc933"),
      },
    });
  }

  function handleEditorMount(editor, monaco) {
    editorRef.current = editor;
    monacoRef.current = monaco;
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (submitRef.current) submitRef.current();
    });
  }

  async function handleSubmit() {
    if (!code.trim()) {
      setError("Paste some code first.");
      return;
    }
    setError("");
    setNotice("");
    if (decorationsRef.current) decorationsRef.current.clear();
    setLoading(true);
    try {
      const result = await submitReview(code, language, focus);
      setReview(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  submitRef.current = handleSubmit;

  function handleIssueClick(line) {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    const max = editor.getModel().getLineCount();
    if (line > max) {
      setNotice(`That issue points to line ${line}, but your code only has ${max} lines.`);
      return;
    }
    setNotice("");
    editor.revealLineInCenter(line);
    editor.setPosition({ lineNumber: line, column: 1 });
    if (decorationsRef.current) decorationsRef.current.clear();
    decorationsRef.current = editor.createDecorationsCollection([
      {
        range: new monaco.Range(line, 1, line, 1),
        options: { isWholeLine: true, className: "issue-line-highlight" },
      },
    ]);
  }

  return (
    <div className="max-w-[1600px] mx-auto px-8 py-6">
      {/* Header: just the title */}
      <div className="mb-5">
        <h1 className="font-display font-bold text-[22px] text-text tracking-tight mb-0.5">
          Submit code for review
        </h1>
        <p className="text-[13px] text-muted">
          Paste your code and see feedback appear right next to it
        </p>
      </div>

      {error && <p className="text-danger text-[13px] mb-3">{error}</p>}
      {notice && <p className="text-warning text-[13px] mb-3">{notice}</p>}

      {/* Two equal cards that fill the rest of the screen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:h-[calc(100vh-180px)] lg:min-h-[520px]">
        {/* Editor card */}
        <div className="flex flex-col rounded-xl border border-border overflow-hidden bg-panel h-[560px] lg:h-full">
          {/* Editor header: language picker on the left, tools on the right */}
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-panel-2 border-b border-border shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-danger/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-warning/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-success/70" />
              </div>
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="appearance-none bg-panel border border-border rounded-md pl-3 pr-8 py-1.5 text-[12px] font-mono text-text focus:outline-none focus:border-accent transition-colors cursor-pointer"
                >
                  {languages.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
              </div>
            </div>
            <div className="flex items-center gap-4 text-[12px] text-muted">
              <span className="font-mono hidden sm:inline">{lineCount} lines</span>
              <button
                onClick={() => setCode(samples[language] || "")}
                className="flex items-center gap-1.5 hover:text-accent transition-colors"
              >
                <FileCode2 className="w-3.5 h-3.5" strokeWidth={2} />
                Load sample
              </button>
              <button
                onClick={() => {
                  setCode("");
                  setNotice("");
                  if (decorationsRef.current) decorationsRef.current.clear();
                }}
                className="flex items-center gap-1.5 hover:text-danger transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                Clear
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language={activeLang?.monacoId || "python"}
              value={code}
              onChange={(value) => setCode(value || "")}
              theme="codereview-dark"
              beforeMount={handleEditorWillMount}
              onMount={handleEditorMount}
              options={{
                fontSize: 13,
                fontFamily: "'JetBrains Mono', monospace",
                minimap: { enabled: false },
                wordWrap: "on",
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                lineNumbersMinChars: 3,
                renderLineHighlight: "all",
                automaticLayout: true,
              }}
            />
          </div>

          {/* Footer: focus tabs on the left, Run review on the right */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-panel-2 border-t border-border shrink-0">
            <div className="flex gap-1 bg-panel border border-border rounded-lg p-1">
              {focuses.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFocus(f.id)}
                  className={`px-3 py-1 rounded-md text-[12px] font-medium transition-colors ${
                    focus === f.id ? "bg-accent text-bg" : "text-muted hover:text-text"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden xl:inline text-[12px] text-muted font-mono">Ctrl + Enter</span>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 bg-accent text-bg font-semibold text-[14px] rounded-lg px-5 py-2.5 hover:opacity-90 transition-opacity shadow-lg shadow-accent/20 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" strokeWidth={2.5} />
                    Run review
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results card */}
        <div className="bg-panel border border-border rounded-xl p-5 overflow-y-auto h-[560px] lg:h-full">
          <ResultsPanel
            review={review}
            loading={loading}
            onIssueClick={handleIssueClick}
            onLoadSample={() => setCode(samples[language] || "")}
          />
        </div>
      </div>
    </div>
  );
}