/** Bounded illustrative notation, never a rendering of live entities or observations. */
export function WorkbenchGlyph({ motif, large = false }: { motif: string; large?: boolean }) {
  const kind = /field/.test(motif) ? "field"
    : /feedback/.test(motif) ? "feedback"
    : /composition/.test(motif) ? "composition"
    : /arrangement/.test(motif) ? "arrangement"
    : /movement/.test(motif) ? "movement"
    : /lifecycle/.test(motif) ? "lifecycle"
    : /steering|interaction/.test(motif) ? "cohesion"
    : /grid|cell|forest|landscape/.test(motif) ? "grid"
    : /network|synapse|signal|edge/.test(motif) ? "network"
      : /cohesion|attract/.test(motif) ? "cohesion"
        : /separat|repul/.test(motif) ? "separation"
          : /align/.test(motif) ? "alignment"
            : /neigh|contact|transmi/.test(motif) ? "neighborhood"
              : /seed|noise|stoch|variation|initial/.test(motif) ? "variation"
                : /state|transition|recover|burn/.test(motif) ? "state"
                  : /space|bound|environment/.test(motif) ? "space"
                    : /prey|predat|consum|population-cycle/.test(motif) ? "population"
                      : /energy|quantity|stock|birth|death/.test(motif) ? "quantity" : "agents";
  return (
    <svg className={`workbench-glyph${large ? " workbench-glyph--large" : ""}`} viewBox="0 0 120 90" fill="none" aria-hidden="true">
      {kind === "field" ? <>{[20,35,50,65].map(y => <path key={y} d={`M10 ${y}C35 ${y-20} 65 ${y+20} 110 ${y-5}`} stroke="currentColor" opacity=".6" />)}</> : null}
      {kind === "feedback" ? <><path d="M85 25a30 30 0 1 0 2 38M85 25v16H69m18 22V48h15" stroke="currentColor" strokeWidth="2" /><circle cx="60" cy="45" r="8" stroke="currentColor" opacity=".5" /></> : null}
      {kind === "composition" ? <><rect x="16" y="18" width="35" height="24" stroke="currentColor" /><rect x="68" y="48" width="35" height="24" stroke="currentColor" strokeDasharray="4 3" /><path d="M51 30h35v18" stroke="currentColor" opacity=".4" /><circle cx="40" cy="65" r="12" stroke="currentColor" strokeDasharray="3 3" /></> : null}
      {kind === "arrangement" ? <>{[[27,23],[60,23],[93,23],[27,62],[60,62],[93,62]].map(([x,y]) => <g key={`${x}-${y}`}><circle cx={x} cy={y} r="9" stroke="currentColor" opacity=".3" /><circle cx={x} cy={y} r="3" fill="currentColor" /></g>)}</> : null}
      {kind === "movement" ? <><path d="M12 61c24 0 17-38 43-38s16 42 45 35m-5-7 8 7-9 7" stroke="currentColor" strokeWidth="2" /><circle cx="14" cy="61" r="5" fill="currentColor" /><circle cx="55" cy="23" r="4" stroke="currentColor" opacity=".5" /></> : null}
      {kind === "lifecycle" ? <><circle cx="24" cy="45" r="11" stroke="currentColor" /><path d="M35 45h18m-5-5 5 5-5 5M65 45h18" stroke="currentColor" /><circle cx="65" cy="45" r="5" fill="currentColor" /><circle cx="94" cy="45" r="11" stroke="currentColor" strokeDasharray="3 3" /><path d="m90 41 8 8m0-8-8 8" stroke="currentColor" /></> : null}
      {kind === "grid" ? Array.from({ length: 24 }, (_, i) => (
        <rect key={i} x={15 + (i % 6) * 15} y={15 + Math.floor(i / 6) * 15} width="11" height="11" rx="1"
          fill="currentColor" opacity={i % 7 === 0 ? .12 : i % 5 === 0 ? .9 : .4} />
      )) : null}
      {kind === "network" ? <>
        <path d="M15 45 38 17 64 43 96 20M15 45 40 74 64 43 102 68M38 17 40 74M64 43 96 20 102 68" stroke="currentColor" opacity=".45" />
        {[[15,45],[38,17],[64,43],[96,20],[40,74],[102,68]].map(([x,y],i) => <circle key={i} cx={x} cy={y} r={i === 2 ? 8 : 5} fill="currentColor" opacity={i === 2 ? 1 : .65} />)}
      </> : null}
      {kind === "agents" || kind === "alignment" ? <>
        {[[27,26],[57,19],[86,30],[37,59],[69,55],[98,66]].map(([x,y],i) => <path key={i} d="M-9 -5 10 0 -9 6 -4 0Z" transform={`translate(${x} ${y}) rotate(${kind === "alignment" ? -15 : [5,-25,10,-15,0,-30][i]})`} fill="currentColor" opacity={i === 2 ? 1 : .5 + i * .06} />)}
      </> : null}
      {kind === "cohesion" || kind === "separation" ? <>
        <circle cx="60" cy="45" r="27" stroke="currentColor" opacity=".25" strokeDasharray="3 4" />
        <circle cx="60" cy="45" r="4" fill="currentColor" />
        {[0,90,180,270].map((angle) => <g key={angle} transform={`rotate(${angle} 60 45)`}>
          <path d={kind === "cohesion" ? "M60 8V30m-5-5 5 5 5-5" : "M60 30V8m-5 5 5-5 5 5"} stroke="currentColor" strokeWidth="2" />
        </g>)}
      </> : null}
      {kind === "neighborhood" ? <>
        <circle cx="60" cy="45" r="32" stroke="currentColor" strokeDasharray="3 4" opacity=".5" />
        <circle cx="60" cy="45" r="16" stroke="currentColor" opacity=".2" />
        <path d="m54 40 16 5-16 5 4-5Z" fill="currentColor" />
        {[[38,28],[75,25],[40,60],[82,63],[12,52],[103,19]].map(([x,y],i) => <circle key={i} cx={x} cy={y} r="3" fill="currentColor" opacity={i > 3 ? .25 : .85} />)}
      </> : null}
      {kind === "variation" ? <>
        <path d="M12 45H38L63 20H106M38 45H106M38 45 63 70H106" stroke="currentColor" strokeWidth="1.5" opacity=".6" />
        <circle cx="16" cy="45" r="7" fill="currentColor" />
        {[20,45,70].map(y => <circle key={y} cx="99" cy={y} r="4" stroke="currentColor" strokeWidth="2" />)}
      </> : null}
      {kind === "state" ? <>
        <path d="M30 45H88m-5-5 5 5-5 5" stroke="currentColor" opacity=".6" />
        {[21,60,99].map((x,i) => <rect key={x} x={x-11} y="34" width="22" height="22" rx={i === 1 ? 2 : 11} fill="currentColor" opacity={.25+i*.3} />)}
      </> : null}
      {kind === "space" ? <>
        <rect x="17" y="16" width="86" height="59" stroke="currentColor" strokeDasharray="4 4" />
        <path d="M17 34H9m8 25H9M103 34h8m-8 25h8M44 16V8m31 8V8M44 75v8m31-8v8" stroke="currentColor" opacity=".5" />
        <path d="M34 59V32h45m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" />
      </> : null}
      {kind === "population" ? <>
        {[[25,24],[39,57],[65,20],[85,53],[60,72]].map(([x,y]) => <circle key={x} cx={x} cy={y} r="5" fill="currentColor" opacity=".5" />)}
        <path d="m57 36 16 12-16 12Z" fill="currentColor" /><path d="m90 12 13 10-13 10Z" fill="currentColor" opacity=".8" />
      </> : null}
      {kind === "quantity" ? <>
        <path d="M33 19v53h55V19" stroke="currentColor" strokeWidth="2" />
        <path d="M38 48h45v19H38Z" fill="currentColor" opacity=".45" />
        <path d="M59 10v28m-6-6 6 6 6-6M82 45l14-9" stroke="currentColor" />
      </> : null}
    </svg>
  );
}
