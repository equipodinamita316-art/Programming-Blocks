"use client";

import { Icon, type IconName } from "./Icon";

export type EditorTab = {
  id: string;
  text: string;
  icon: IconName;
  family: "html" | "css" | "js";
};

export function EditorTabBar({
  tabs,
  active,
  onSelect,
  fileCount,
  showFiles,
  onOpenFiles,
  blockCount,
}: {
  tabs: EditorTab[];
  active: string;
  onSelect: (id: string) => void;
  fileCount: number;
  showFiles: boolean;
  onOpenFiles: () => void;
  blockCount: number;
}) {
  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-[#2d2d3f] text-xs overflow-auto no-scrollbar">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id)}
          className={`flex items-center gap-1.5 rounded-t-lg px-3 py-1.5 font-bold whitespace-nowrap ${active === t.id ? "bg-[#1e1e2e] text-[#FFC700]" : "text-white/60 hover:bg-white/10"}`}
        >
          <Icon name={t.icon} size={14} />
          {t.text}
        </button>
      ))}
      {showFiles ? (
        <button
          onClick={onOpenFiles}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 font-bold whitespace-nowrap text-white/80 hover:bg-white/10"
          title="Abrir mis archivos"
        >
          <Icon name="folder" size={14} />
          <span>({fileCount})</span>
        </button>
      ) : (
        <span
          className="flex items-center gap-1 rounded-lg px-2 py-1.5 font-bold whitespace-nowrap text-white/40"
          title="Los archivos se desbloquean en el Lab"
        >
          <Icon name="lock" size={13} />
          <Icon name="folder" size={13} />
        </span>
      )}
      <span className="ml-auto text-[11px] text-white/50 hidden sm:inline">
        {blockCount} bloques
      </span>
    </div>
  );
}
