import { FormEvent, useState } from "react";

type Props = {
  initial?: string;
  placeholder?: string;
  onSearch: (q: string) => void;
  busy?: boolean;
};

export function SearchBox({ initial = "", placeholder = "关键词 / 标签 / 标题…", onSearch, busy }: Props) {
  const [q, setQ] = useState(initial);

  function submit(e: FormEvent) {
    e.preventDefault();
    onSearch(q.trim());
  }

  return (
    <form className="toolbar" onSubmit={submit}>
      <div className="field" style={{ flex: 2 }}>
        <label htmlFor="kw">检索</label>
        <input
          id="kw"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
        />
      </div>
      <div className="field" style={{ flex: "0 0 auto", justifyContent: "flex-end" }}>
        <label>&nbsp;</label>
        <button className="btn" type="submit" disabled={busy}>
          {busy ? "检索中" : "搜索"}
        </button>
      </div>
    </form>
  );
}
