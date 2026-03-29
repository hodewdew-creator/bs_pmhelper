"use client";

import React, { useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Plus, Trash2 } from "lucide-react";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const appetiteBlocks = [
  { key: "00_09", label: "식욕(00~09시)" },
  { key: "09_13", label: "식욕(09~13시)" },
  { key: "13_23", label: "식욕(13~23시)" },
];
const vigorOptions = [
  {
    code: "S0",
    desc: `Score 0 – 정상
편안한 상태로 쉬고 있음
주변 환경에 호기심을 가짐`,
  },
  {
    code: "S1",
    desc: `Score 1 – 약간 감소
보호자분이 느끼기에 활력이 떨어진 것 같음
의료진이 느끼기에는 정상적일 수 있음
주변 환경에 관심을 덜 보이지만, 무슨 일이 있는지 주변을 둘러보는 정도`,
  },
  {
    code: "S2",
    desc: `Score 2 – 감소
주위자극에 대한 반응이 떨어짐
조용하고 어두운 곳을 불안해하고 고독해보임
눈을 부분적/완전히 감음
몸을 움츠리고 꼬리를 바짝 말아붙이는 방어적 자세`,
  },
  {
    code: "S3",
    desc: `Score 3 – 많이 감소
주위자극에 반응이 거의 없으나, 의식은 있음
움직임이 거의 없음`,
  },
  {
    code: "S4",
    desc: `Score 4 – 나쁨
기운없이 옆으로 누워있음
주변환경에 반응하거나 관심 보이지 않음
지속적으로 통증 호소
포기한 채 치료를 받아들임`,
  },
];
const stoolOptions = ["S2", "S3", "S4", "S5", "S6", "S7", "S1"];
const urinePresets = ["약혈뇨", "혈뇨", "빈뇨", "핍뇨", "무뇨"];
const vomitPresets = ["거품토", "물토", "소화X사료토", "소화된사료토", "혈토"];
const respiratoryPresets = ["눈물", "콧물", "재채기", "기침"];

function hourLabel(h) {
  if (h === 0) return "0am";
  if (h < 12) return `${h}am`;
  if (h === 12) return "12pm";
  return `${h - 12}pm`;
}

function groupClass(hour) {
  if (hour < 6) return "bg-slate-100";
  if (hour < 12) return "bg-blue-100";
  if (hour < 18) return "bg-emerald-100";
  return "bg-amber-100";
}

function initialNumberGrid() {
  return Array.from({ length: 24 }, () => ({ value: "" }));
}

function initialStoolGrid() {
  return Array.from({ length: 24 }, () => ({ checked: false, score: "", note: "" }));
}

function initialUrineGrid() {
  return Array.from({ length: 24 }, () => ({ checked: false, note: "" }));
}

function initialVomitGrid() {
  return Array.from({ length: 24 }, () => ({ checked: false, types: [], custom: "" }));
}

function initialRespiratoryGrid() {
  return Array.from({ length: 24 }, () => ({ checked: false, types: [], custom: "" }));
}

function formatTimedEntries(entries, formatter) {
  return entries
    .filter((e) => e.value !== "" && e.value != null)
    .sort((a, b) => a.hour - b.hour)
    .map((e) => formatter(e))
    .join(", ");
}

function CellButton({ active, label, subLabel, onClick, onDoubleClick, onContextMenu, onMouseDown, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      onMouseDown={onMouseDown}
      className={`flex h-8 min-w-8 flex-col items-center justify-center rounded-md border text-[12px] font-medium leading-none transition ${
        active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white hover:bg-slate-50"
      } ${className}`}
    >
      <span>{label}</span>
      {subLabel ? <span className="mt-0.5 text-[10px] opacity-80">{subLabel}</span> : null}
    </button>
  );
}

function RowTimeHeader() {
  return (
    <div className="grid grid-cols-[74px_repeat(24,minmax(36px,1fr))] gap-1 text-[12px] font-semibold text-slate-700">
      <div />
      {HOURS.map((hour) => (
        <div key={hour} className={`flex h-8 items-center justify-center rounded-md border ${groupClass(hour)}`}>
          {hour}
        </div>
      ))}
    </div>
  );
}

function CompactNumberRow({ label, grid, setGrid }) {
  return (
    <div className="grid grid-cols-[74px_repeat(24,minmax(36px,1fr))] gap-1 items-center">
      <div className="text-base font-semibold">{label}</div>
      {HOURS.map((hour) => (
        <Input
          key={hour}
          value={grid[hour].value}
          onChange={(e) => {
            const next = [...grid];
            next[hour] = { value: e.target.value };
            setGrid(next);
          }}
          className={`h-10 px-1.5 text-center text-[12px] font-medium ${groupClass(hour)}`}
        />
      ))}
    </div>
  );
}

function CompactEventRow({ label, cells }) {
  return (
    <div className="grid grid-cols-[74px_repeat(24,minmax(36px,1fr))] gap-1 items-center">
      <div className="text-base font-semibold">{label}</div>
      {cells}
    </div>
  );
}

export default function MonitoringChartMVP() {
  const [resetKey, setResetKey] = useState(0);
  const [weights, setWeights] = useState([""]);
  const [vigor, setVigor] = useState("S0");
    const [tempGrid, setTempGrid] = useState(initialNumberGrid);
  const [bpGrid, setBpGrid] = useState(initialNumberGrid);
  const [rrGrid, setRrGrid] = useState(initialNumberGrid);
  const [bgGrid, setBgGrid] = useState(initialNumberGrid);
  const [stoolGrid, setStoolGrid] = useState(initialStoolGrid);
  const [urineGrid, setUrineGrid] = useState(initialUrineGrid);
  const [urineAmountGrid, setUrineAmountGrid] = useState(initialNumberGrid);
  const [vomitGrid, setVomitGrid] = useState(initialVomitGrid);
  const [vomitModalHour, setVomitModalHour] = useState(null);
  const [vomitModalTypes, setVomitModalTypes] = useState([]);
  const [vomitModalCustom, setVomitModalCustom] = useState("");
  const [respiratoryGrid, setRespiratoryGrid] = useState(initialRespiratoryGrid);
  const [respiratoryModalHour, setRespiratoryModalHour] = useState(null);
  const [respiratoryModalTypes, setRespiratoryModalTypes] = useState([]);
  const [respiratoryModalCustom, setRespiratoryModalCustom] = useState("");
  const [appetite, setAppetite] = useState({
    "00_09": { ff: false, npo: false, npoNote: "", items: [] },
    "09_13": { ff: false, npo: false, npoNote: "", items: [] },
    "13_23": { ff: false, npo: false, npoNote: "", items: [] },
  });

  const urineLongPressRef = useRef({});
  const stoolClickTimeoutRef = useRef({});

  const [previewDraft, setPreviewDraft] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [copyDone, setCopyDone] = useState(false);

  const previewText = useMemo(() => {
    const lines = ["<주야간모니터링>"];

    const weightText = weights.filter(Boolean).map((w) => `${w}kg`).join(", ");
    lines.push(`- 체중 : ${weightText || "X"}`);
    lines.push(`- 활력 : ${vigor || "X"}`);

    const tempText = formatTimedEntries(
      tempGrid.map((c, hour) => ({ hour, value: c.value })),
      ({ hour, value }) => `${value}(${hourLabel(hour)})`
    );
    lines.push(`- 체온 : ${tempText || "X"}`);

    const bpText = formatTimedEntries(
      bpGrid.map((c, hour) => ({ hour, value: c.value })),
      ({ hour, value }) => `${value}(${hourLabel(hour)})`
    );
    lines.push(`- 혈압 : ${bpText || "X"}`);

    const rrText = formatTimedEntries(
      rrGrid.map((c, hour) => ({ hour, value: c.value })),
      ({ hour, value }) => `${value}(${hourLabel(hour)})`
    );
    if (rrText) {
      lines.push(`- 호흡수 : ${rrText}`);
    }

    const bgText = formatTimedEntries(
      bgGrid.map((c, hour) => ({ hour, value: c.value })),
      ({ hour, value }) => `${value}(${hourLabel(hour)})`
    );
    if (bgText) {
      lines.push(`- 혈당 : ${bgText}`);
    }

    appetiteBlocks.forEach((block) => {
      const data = appetite[block.key];
      const parts = [];
      if (data.ff) parts.push("FF");
      data.items.forEach((item) => {
        if (item.score !== "") parts.push(`${item.score}(${item.food || ""})`);
      });
      if (data.npo) parts.push(data.npoNote ? `NPO(${data.npoNote})` : "NPO");
      lines.push(`- ${block.label} : ${parts.length ? parts.join(" / ") : "X"}`);
    });

    const stoolText = stoolGrid
      .map((c, hour) => ({ hour, ...c }))
      .filter((x) => x.checked || x.score || x.note)
      .sort((a, b) => a.hour - b.hour)
      .map((x) => {
        const head = x.score || "check";
        return x.note ? `${head}(${hourLabel(x.hour)}, ${x.note})` : `${head}(${hourLabel(x.hour)})`;
      })
      .join(", ");
    lines.push(`- 배변 : ${stoolText || "X"}`);

    const urineText = urineGrid
      .map((c, hour) => ({ hour, ...c }))
      .filter((x) => x.checked || x.note)
      .sort((a, b) => a.hour - b.hour)
      .map((x) => (x.note ? `${hourLabel(x.hour)}(${x.note})` : `${hourLabel(x.hour)}`))
      .join(", ");
    lines.push(`- 배뇨 : ${urineText || "X"}`);

    const urineAmountText = formatTimedEntries(
      urineAmountGrid.map((c, hour) => ({ hour, value: c.value })),
      ({ hour, value }) => `${value}(${hourLabel(hour)})`
    );
    if (urineAmountText) {
      lines.push(`- *뇨량체크 : ${urineAmountText}`);
    }

    const vomitText = vomitGrid
      .map((c, hour) => ({ hour, ...c }))
      .filter((x) => x.checked || x.types.length || x.custom)
      .sort((a, b) => a.hour - b.hour)
      .map((x) => {
        const desc = [...x.types, ...(x.custom ? [x.custom] : [])].join(", ");
        return desc ? `${hourLabel(x.hour)}(${desc})` : `${hourLabel(x.hour)}`;
      })
      .join(", ");
    lines.push(`- 구토 : ${vomitText || "X"}`);

    const respiratoryText = respiratoryGrid
      .map((c, hour) => ({ hour, ...c }))
      .filter((x) => x.checked || x.types.length || x.custom)
      .sort((a, b) => a.hour - b.hour)
      .map((x) => {
        const desc = [...x.types, ...(x.custom ? [x.custom] : [])].join(", ");
        return desc ? `${hourLabel(x.hour)}(${desc})` : `${hourLabel(x.hour)}`;
      })
      .join(", ");
    if (respiratoryText) {
      lines.push(`- 호흡기증상 : ${respiratoryText}`);
    }

    return lines.join("\n");
  }, [weights, vigor, tempGrid, bpGrid, rrGrid, bgGrid, appetite, stoolGrid, urineGrid, urineAmountGrid, vomitGrid, respiratoryGrid]);

  React.useEffect(() => {
    if (!isDirty) {
      setPreviewDraft(previewText);
    }
  }, [previewText, isDirty]);

  const copyPreview = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(previewDraft);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = previewDraft;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopyDone(true);
      window.setTimeout(() => setCopyDone(false), 1500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReset = () => {
    setWeights([""]);
    setVigor("S0");
    setTempGrid(initialNumberGrid());
    setBpGrid(initialNumberGrid());
    setRrGrid(initialNumberGrid());
    setBgGrid(initialNumberGrid());
    setStoolGrid(initialStoolGrid());
    setUrineGrid(initialUrineGrid());
    setUrineAmountGrid(initialNumberGrid());
    setVomitGrid(initialVomitGrid());
    setVomitModalHour(null);
    setVomitModalTypes([]);
    setVomitModalCustom("");
    setRespiratoryGrid(initialRespiratoryGrid());
    setRespiratoryModalHour(null);
    setRespiratoryModalTypes([]);
    setRespiratoryModalCustom("");
    setAppetite({
      "00_09": { ff: false, npo: false, npoNote: "", items: [] },
      "09_13": { ff: false, npo: false, npoNote: "", items: [] },
      "13_23": { ff: false, npo: false, npoNote: "", items: [] },
    });
    setResetKey((k) => k + 1);
  };

  const toggleStool = (hour) => {
    const current = stoolGrid[hour];
    const currentIndex = stoolOptions.indexOf(current.score);
    const nextScore = currentIndex === -1 ? stoolOptions[0] : stoolOptions[(currentIndex + 1) % stoolOptions.length];
    const next = [...stoolGrid];
    next[hour] = { ...current, checked: true, score: nextScore };
    setStoolGrid(next);
  };

  const handleStoolClick = (hour) => {
    toggleStool(hour);
  };

  const editStool = (hour) => {
    const next = [...stoolGrid];
    next[hour] = { checked: false, score: "", note: "" };
    setStoolGrid(next);
  };

  const toggleUrine = (hour) => {
    const next = [...urineGrid];
    next[hour] = { ...next[hour], checked: !next[hour].checked };
    setUrineGrid(next);
  };

  const editUrine = (hour) => {
    const current = urineGrid[hour];
    const preset = window.prompt(
      `배뇨 이상소견 입력\n예: ${urinePresets.join(", ")}`,
      current.note || ""
    );
    if (preset === null) return;
    const next = [...urineGrid];
    next[hour] = { checked: true, note: preset.trim() };
    setUrineGrid(next);
  };

  const toggleVomit = (hour) => {
    const current = vomitGrid[hour];
    setVomitModalHour(hour);
    setVomitModalTypes(current.types || []);
    setVomitModalCustom(current.custom || "");
  };

  const editVomit = (hour) => {
    const next = [...vomitGrid];
    next[hour] = { checked: false, types: [], custom: "" };
    setVomitGrid(next);
  };

  const saveVomitModal = () => {
    if (vomitModalHour === null) return;
    const next = [...vomitGrid];
    next[vomitModalHour] = {
      checked: vomitModalTypes.length > 0 || !!vomitModalCustom.trim(),
      types: vomitModalTypes,
      custom: vomitModalCustom.trim(),
    };
    setVomitGrid(next);
    setVomitModalHour(null);
    setVomitModalTypes([]);
    setVomitModalCustom("");
  };

  const toggleRespiratory = (hour) => {
    const current = respiratoryGrid[hour];
    setRespiratoryModalHour(hour);
    setRespiratoryModalTypes(current.types || []);
    setRespiratoryModalCustom(current.custom || "");
  };

  const clearRespiratory = (hour) => {
    const next = [...respiratoryGrid];
    next[hour] = { checked: false, types: [], custom: "" };
    setRespiratoryGrid(next);
  };

  const saveRespiratoryModal = () => {
    if (respiratoryModalHour === null) return;
    const next = [...respiratoryGrid];
    next[respiratoryModalHour] = {
      checked: respiratoryModalTypes.length > 0 || !!respiratoryModalCustom.trim(),
      types: respiratoryModalTypes,
      custom: respiratoryModalCustom.trim(),
    };
    setRespiratoryGrid(next);
    setRespiratoryModalHour(null);
    setRespiratoryModalTypes([]);
    setRespiratoryModalCustom("");
  };

    return (
    <div key={resetKey} className="min-h-screen bg-slate-100 p-6 text-base text-slate-900 antialiased">
      <div className="grid w-full items-start gap-4 xl:grid-cols-[minmax(0,1fr)_420px] 2xl:grid-cols-[minmax(0,1fr)_480px]">
        <Card className="rounded-2xl shadow-sm p-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">BS monitoring helper</CardTitle>
              <Button variant="outline" className="h-9" onClick={handleReset}>
                초기화
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-slate-50 p-4">
              <div className="w-14 text-base font-semibold text-slate-900">체중</div>
              {weights.map((w, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <Input
                    placeholder="kg"
                    value={w}
                    onChange={(e) => {
                      const next = [...weights];
                      next[idx] = e.target.value;
                      setWeights(next);
                    }}
                    className="h-10 w-48 text-base font-medium"
                  />
                  {weights.length > 1 && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setWeights(weights.filter((_, i) => i !== idx))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" className="h-9" onClick={() => setWeights([...weights, ""])}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-slate-50 p-4">
              <div className="w-14 text-base font-semibold text-slate-900">활력</div>
              {vigorOptions.map((option) => (
                <Button
                  key={option.code}
                  title={option.desc}
                  variant={vigor === option.code ? "default" : "outline"}
                  className="h-10 min-w-14 px-3 text-sm font-semibold"
                  onClick={() => setVigor(option.code)}
                >
                  {option.code}
                </Button>
              ))}
            </div>

            <div className="overflow-x-auto rounded-xl border bg-white p-4">
              <div className="min-w-[1040px] space-y-2">
                <RowTimeHeader />
                <CompactNumberRow label="체온" grid={tempGrid} setGrid={setTempGrid} />
                <CompactNumberRow label="혈압" grid={bpGrid} setGrid={setBpGrid} />
                <CompactNumberRow label="호흡수" grid={rrGrid} setGrid={setRrGrid} />
                <CompactNumberRow label="혈당" grid={bgGrid} setGrid={setBgGrid} />
              </div>
            </div>

            <div className="rounded-xl border bg-white p-4">
              <div className="mb-3 text-lg font-semibold text-slate-900">식욕</div>
              <div className="grid gap-3 xl:grid-cols-3">
                {appetiteBlocks.map((block) => {
                  const data = appetite[block.key];
                  return (
                    <div key={block.key} className="rounded-lg border bg-slate-50 p-3 space-y-2">
                      <div className="text-base font-semibold">{block.label}</div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant={data.ff ? "default" : "outline"}
                          className="h-8"
                          onClick={() => setAppetite({ ...appetite, [block.key]: { ...data, ff: !data.ff } })}
                        >
                          FF
                        </Button>
                        <Button
                          variant={data.npo ? "default" : "outline"}
                          className="h-8"
                          onClick={() => setAppetite({ ...appetite, [block.key]: { ...data, npo: !data.npo } })}
                        >
                          NPO
                        </Button>
                        <Input
                          placeholder="예: 4am~"
                          value={data.npoNote}
                          onChange={(e) => setAppetite({ ...appetite, [block.key]: { ...data, npoNote: e.target.value } })}
                          className="h-9 flex-1 min-w-0 text-base"
                        />
                      </div>
                      <div className="space-y-1">
                        {data.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            <select
                              value={item.score}
                              onChange={(e) => {
                                const items = [...data.items];
                                items[idx] = { ...items[idx], score: e.target.value };
                                setAppetite({ ...appetite, [block.key]: { ...data, items } });
                              }}
                              className="h-7 rounded-md border px-2 text-xs"
                            >
                              <option value="">-</option>
                              <option value="2">2</option>
                              <option value="1">1</option>
                              <option value="0">0</option>
                            </select>
                            <Input
                              placeholder="음식"
                              value={item.food}
                              onChange={(e) => {
                                const items = [...data.items];
                                items[idx] = { ...items[idx], food: e.target.value };
                                setAppetite({ ...appetite, [block.key]: { ...data, items } });
                              }}
                              className="h-8"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                const items = data.items.filter((_, i) => i !== idx);
                                setAppetite({ ...appetite, [block.key]: { ...data, items } });
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        className="h-10 w-full text-base font-semibold"
                        onClick={() => setAppetite({ ...appetite, [block.key]: { ...data, items: [...data.items, { score: "", food: "" }] } })}
                      >
                        <Plus className="mr-1 h-4 w-4" /> 항목 추가
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border bg-white p-4">
              <div className="min-w-[1040px] space-y-2">
                <RowTimeHeader />
                <CompactEventRow
                  label="배변"
                  cells={HOURS.map((hour) => {
                    const cell = stoolGrid[hour];
                    return (
                      <CellButton
                        key={hour}
                        active={cell.checked || !!cell.note || !!cell.score}
                        label={cell.score || (cell.checked ? "●" : "-")}
                        subLabel={cell.note ? "note" : ""}
                        onClick={() => handleStoolClick(hour)}
                        onMouseDown={(e) => {
                          if (e.button === 2) {
                            e.preventDefault();
                            editStool(hour);
                          }
                        }}
                        onContextMenu={(e) => e.preventDefault()}
                        className={groupClass(hour)}
                      />
                    );
                  })}
                />
                <CompactEventRow
                  label="배뇨"
                  cells={HOURS.map((hour) => {
                    const cell = urineGrid[hour];
                    return (
                      <CellButton
                        key={hour}
                        active={cell.checked || !!cell.note}
                        label={cell.checked ? "✔" : "-"}
                        subLabel=""
                        onClick={() => toggleUrine(hour)}
                        onMouseDown={(e) => {
                          if (e.button === 2) {
                            e.preventDefault();
                            const next = [...urineGrid];
                            next[hour] = { checked: false, note: "" };
                            setUrineGrid(next);
                          }
                        }}
                        onContextMenu={(e) => e.preventDefault()}
                        className={groupClass(hour)}
                      />
                    );
                  })}
                />
                <CompactNumberRow label={<span>*뇨량<br/>특이사항</span>} grid={urineAmountGrid} setGrid={setUrineAmountGrid} />
                <CompactEventRow
                  label="구토"
                  cells={HOURS.map((hour) => {
                    const cell = vomitGrid[hour];
                    return (
                      <CellButton
                        key={hour}
                        active={cell.checked || cell.types.length > 0 || !!cell.custom}
                        label={cell.checked ? "✔" : "-"}
                        subLabel=""
                        onClick={() => toggleVomit(hour)}
                        onMouseDown={(e) => {
                          if (e.button === 2) {
                            e.preventDefault();
                            const next = [...vomitGrid];
                            next[hour] = { checked: false, types: [], custom: "" };
                            setVomitGrid(next);
                          }
                        }}
                        onContextMenu={(e) => e.preventDefault()}
                        className={groupClass(hour)}
                      />
                    );
                  })}
                />
                <CompactEventRow
                  label={<span>호흡기<br/>증상</span>}
                  cells={HOURS.map((hour) => {
                    const cell = respiratoryGrid[hour];
                    return (
                      <CellButton
                        key={hour}
                        active={cell.checked || cell.types.length > 0 || !!cell.custom}
                        label={cell.checked ? "✔" : "-"}
                        subLabel=""
                        onClick={() => toggleRespiratory(hour)}
                        onMouseDown={(e) => {
                          if (e.button === 2) {
                            e.preventDefault();
                            clearRespiratory(hour);
                          }
                        }}
                        onContextMenu={(e) => e.preventDefault()}
                        className={groupClass(hour)}
                      />
                    );
                  })}
                />
              </div>
              <div className="mt-3 text-sm leading-relaxed text-slate-600">
                배변: 좌클릭 = 스코어 순환, 우클릭 = 지우기 / 배뇨: 좌클릭 = 체크, 우클릭 = 지우기 / 구토: 좌클릭 = 선택 팝업, 우클릭 = 지우기 / 호흡기증상: 좌클릭 = 선택 팝업, 우클릭 = 지우기
              </div>
            </div>
          </CardContent>
        </Card>

        {vomitModalHour !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-3 shadow-xl">
              <div className="mb-3 text-base font-semibold">구토 입력 - {hourLabel(vomitModalHour)}</div>
              <div className="grid grid-cols-2 gap-2">
                {vomitPresets.map((type) => {
                  const active = vomitModalTypes.includes(type);
                  return (
                    <Button
                      key={type}
                      type="button"
                      variant={active ? "default" : "outline"}
                      className="h-9"
                      onClick={() => {
                        setVomitModalTypes((prev) =>
                          prev.includes(type) ? prev.filter((v) => v !== type) : [...prev, type]
                        );
                      }}
                    >
                      {type}
                    </Button>
                  );
                })}
              </div>
              <div className="mt-3">
                <Input
                  placeholder="기타 입력"
                  value={vomitModalCustom}
                  onChange={(e) => setVomitModalCustom(e.target.value)}
                />
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setVomitModalHour(null);
                    setVomitModalTypes([]);
                    setVomitModalCustom("");
                  }}
                >
                  취소
                </Button>
                <Button type="button" onClick={saveVomitModal}>
                  확인
                </Button>
              </div>
            </div>
          </div>
        )}

        {respiratoryModalHour !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-3 shadow-xl">
              <div className="mb-3 text-base font-semibold">호흡기/증상 입력 - {hourLabel(respiratoryModalHour)}</div>
              <div className="grid grid-cols-2 gap-2">
                {respiratoryPresets.map((type) => {
                  const active = respiratoryModalTypes.includes(type);
                  return (
                    <Button
                      key={type}
                      type="button"
                      variant={active ? "default" : "outline"}
                      className="h-9"
                      onClick={() => {
                        setRespiratoryModalTypes((prev) =>
                          prev.includes(type) ? prev.filter((v) => v !== type) : [...prev, type]
                        );
                      }}
                    >
                      {type}
                    </Button>
                  );
                })}
              </div>
              <div className="mt-3">
                <Input
                  placeholder="기타 입력"
                  value={respiratoryModalCustom}
                  onChange={(e) => setRespiratoryModalCustom(e.target.value)}
                />
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setRespiratoryModalHour(null);
                    setRespiratoryModalTypes([]);
                    setRespiratoryModalCustom("");
                  }}
                >
                  취소
                </Button>
                <Button type="button" onClick={saveRespiratoryModal}>
                  확인
                </Button>
              </div>
            </div>
          </div>
        )}

        <Card className="rounded-2xl shadow-sm xl:min-w-0 xl:self-start">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-xl font-semibold">프리뷰 <span className="text-sm text-slate-600">(수동수정가능)</span></CardTitle>
            </div>
            <div className="mt-2">
              <Button
                className={`h-11 w-full text-base font-semibold ${copyDone ? "bg-blue-600 border-blue-600 hover:bg-blue-600" : ""}`}
                onClick={copyPreview}
              >
                {copyDone ? "COPY 완료" : "COPY"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="min-w-0">
            <Textarea
              value={previewDraft}
              onChange={(e) => {
                setPreviewDraft(e.target.value);
                setIsDirty(true);
              }}
              className="h-[420px] md:h-[520px] xl:h-[620px] w-full min-w-0 overflow-x-auto overflow-y-auto whitespace-pre resize-none font-mono text-sm leading-6 text-slate-900 [scrollbar-gutter:stable_both-edges]"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
