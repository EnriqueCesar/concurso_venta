const DATA = window.CONTEST_DATA;
const $ = s => document.querySelector(s);
const money = n => Number(n || 0).toLocaleString('es-MX',{maximumFractionDigits:1});
let stores = [...DATA.stores];

function setTabs(){
  document.querySelectorAll('.tab').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
    btn.classList.add('active'); $('#view-'+btn.dataset.view).classList.add('active');
    window.scrollTo({top:0,behavior:'smooth'});
  }));
}
function renderKpis(){
  $('#updatedLabel').textContent=DATA.stats.updated;
  const k=[['Actualizado',DATA.stats.updated],['Líder',DATA.stats.leader],['Prom. Base',money(DATA.stats.avgBase)],['Prom. Actual',money(DATA.stats.avgActual)],['Diferencia',`${DATA.stats.avgDiff>=0?'+':''}${money(DATA.stats.avgDiff)}`],['Unidades',money(DATA.stats.units)]];
  $('#kpis').innerHTML=k.map(x=>`<article class="kpi"><span>${x[0]}</span><strong>${x[1]}</strong></article>`).join('');
}
function medal(i){return i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1;}
function renderCards(list=stores){
  const max=Math.max(...list.map(s=>Math.abs(s.diff)),1);
  $('#cards').innerHTML=list.map((s,i)=>{
    const down=s.diff<0; const width=Math.max(8,Math.min(100,Math.abs(s.diff)/max*100));
    return `<article class="card ${i<3?'podium':''} ${i===0?'top1':''} ${down?'negative':''}">
      <div class="photoWrap"><img src="${s.image}" alt="${s.store}"><div class="rank">${medal(i)}</div></div>
      <div class="cardBody"><h3>${s.store}</h3><div class="diff ${down?'down':''}">${s.diff>=0?'+':''}${money(s.diff)}</div>
      <div class="bar"><i style="width:${width}%"></i></div>
      <div class="miniStats"><div><span>Sem 24-26</span><b>${money(s.base)}</b></div><div><span>Actual</span><b>${money(s.actual)}</b></div></div>
      <div class="pct ${down?'down':''}">${down?'▼':'▲'} ${s.pct>=0?'+':''}${money(s.pct)}% vs. base</div></div></article>`;
  }).join('');
  renderChart(list.slice(0,5)); renderTrendTable(); renderLeader(list[0]);
}
function renderLeader(s){$('#leaderMini').innerHTML=`<span>Líder actual</span><br><strong>${s.store}</strong><p>Diferencia: ${s.diff>=0?'+':''}${money(s.diff)} vs. Sem 24-26</p>`;}
function renderChart(list){
  const w=420,h=220,p=34; const vals=DATA.weeklySummary.map(x=>x.avg); const min=Math.min(0,...vals), max=Math.max(1,...vals);
  const x=i=>p+i*((w-p*2)/(vals.length-1||1)); const y=v=>h-p-((v-min)/(max-min||1))*(h-p*2); const pts=vals.map((v,i)=>`${x(i)},${y(v)}`).join(' ');
  $('#chart').innerHTML=`<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Tendencia semanas 27 a 32">
    <line x1="${p}" y1="${y(0)}" x2="${w-p}" y2="${y(0)}" stroke="#d9e5da" stroke-width="2"/>
    <polyline points="${pts}" fill="none" stroke="#00754a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    ${vals.map((v,i)=>`<circle cx="${x(i)}" cy="${y(v)}" r="6" fill="#063f2b"/><text x="${x(i)}" y="${h-8}" text-anchor="middle" font-size="11" fill="#60756e" font-weight="900">S${DATA.weeks[i]}</text>`).join('')}
  </svg>`;
}
function renderTrendTable(){
  $('#trendTable').innerHTML = `<table><thead><tr><th>Semana</th><th>Prom. tienda</th><th>Total</th><th>Líder</th></tr></thead><tbody>${DATA.weeklySummary.map(w=>`<tr><td>Sem ${w.week}</td><td>${money(w.avg)}</td><td>${money(w.total)}</td><td>${w.leader}${w.leaderValue?` · ${money(w.leaderValue)}`:''}</td></tr>`).join('')}</tbody></table>`;
}
function sortBy(mode){stores.sort((a,b)=> mode==='units'?b.units-a.units: mode==='actual'?b.actual-a.actual:b.diff-a.diff); renderCards(stores);} 
setTabs(); renderKpis(); renderCards(); $('#sortMode').addEventListener('change',e=>sortBy(e.target.value));
if('serviceWorker' in navigator){navigator.serviceWorker.register('service-worker.js').catch(()=>{});}
