const DATA = window.CONTEST_DATA;
const $ = s => document.querySelector(s);
const money = n => Number(n || 0).toLocaleString('es-MX',{maximumFractionDigits:1});
const points = n => Number(n || 0).toLocaleString('es-MX',{maximumFractionDigits:1});
const usd = n => Number(n || 0).toLocaleString('es-MX',{minimumFractionDigits:2,maximumFractionDigits:2});
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
  const k=[['Actualizado',DATA.stats.updated],['Líder',DATA.stats.leader],['Objetivo Prom.',money(DATA.stats.avgBase)],['USD Real Prom.',usd(DATA.stats.avgActual)],['USD vs Objetivo',`${DATA.stats.avgDiff>=0?'+':''}${usd(DATA.stats.avgDiff)}`],['Unidades Periodo',money(DATA.stats.units)]];
  $('#kpis').innerHTML=k.map(x=>`<article class="kpi"><span>${x[0]}</span><strong>${x[1]}</strong></article>`).join('');
}
function medal(i){return i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1;}
function renderCards(list=stores){
  const max=Math.max(...list.map(s=>Math.abs(s.diff)),1);
  $('#cards').innerHTML=list.map((s,i)=>{
    const down=s.diff<0; const width=Math.max(8,Math.min(100,Math.abs(s.diff)/max*100));
    return `<article class="card ${i<3?'podium':''} ${i===0?'top1':''} ${down?'negative':''}">
      <div class="photoWrap"><img src="${s.image}" alt="${s.store}"><div class="rank">${medal(i)}</div></div>
      <div class="cardBody"><h3>${s.store}</h3><div class="diff ${down?'down':''}">${s.diff>=0?'+':''}${usd(s.diff)}</div>
      <div class="bar"><i style="width:${width}%"></i></div>
      <div class="miniStats"><div><span>Unidades Totales Periodo</span><b>${money(s.units)}</b></div><div><span>Días válidos</span><b>${s.days||0}</b></div><div><span>USD Real</span><b>${usd(s.actual)}</b></div><div><span>Objetivo USD</span><b>${money(s.base)}</b></div></div>
      <div class="pct ${down?'down':''}">${down?'▼':'▲'} ${s.pct>=0?'+':''}${money(s.pct)}% · USD Real vs Objetivo</div></div></article>`;
  }).join('');
  renderChart(list.slice(0,5)); renderTrendTable(); renderLeader(list[0]);
}
function renderLeader(s){$('#leaderMini').innerHTML=`<span>Líder actual</span><br><strong>${s.store}</strong><p>USD Real: ${usd(s.actual)} · Objetivo USD: ${money(s.base)} · Diferencia: ${s.diff>=0?'+':''}${usd(s.diff)}</p>`;}
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
  const max = Math.max(...DATA.weeklySummary.map(w=>Number(w.total)||0), 1);
  $('#trendTable').innerHTML = `<div class="weekGrid">${DATA.weeklySummary.map(w=>{
    const total = Number(w.total)||0;
    const width = Math.max(total ? 8 : 0, Math.min(100, total/max*100));
    const status = total>0 ? 'Con avance' : 'Pendiente';
    return `<article class="weekCard ${total?'':'pending'}"><div class="weekTop"><strong>Sem ${w.week}</strong><span>${status}</span></div><div class="weekBar"><i style="width:${width}%"></i></div><div class="weekMeta"><b>${money(total)}</b><small>unidades</small></div><p>Líder: <b>${w.leader}</b>${w.leaderValue?` · ${money(w.leaderValue)}`:''}</p></article>`;
  }).join('')}</div>`;
}

function renderGeneral(){
  const g = DATA.general;
  if(!g) return;
  const top = g.ranking[0] || {};
  const kpis = [
    ['Actualizado', g.updated],
    ['Líder General', g.leader],
    ['Puntaje Total', points(g.totalPoints)],
    ['Puntos Productos', points(g.productPoints)],
    ['Bonus ¿Y Si, Sí?', points(g.bonusPoints)],
    ['Partners publicados', points(g.bonusPartners)]
  ];
  const kpiNode = $('#generalKpis');
  if(kpiNode) kpiNode.innerHTML = kpis.map(x=>`<article class="kpi"><span>${x[0]}</span><strong>${x[1]}</strong></article>`).join('');

  const productNode = $('#generalProducts');
  if(productNode) productNode.innerHTML = g.productSummary.map(p=>`
    <article class="productCard">
      <button class="imageBtn" data-img="${p.image}" data-title="${p.simple}" type="button"><img src="${p.image}" alt="${p.simple}"><span>🔎 Ver completo</span></button>
      <h3>${p.simple}</h3>
      <b>${points(p.pointsPerUnit)} punto${p.pointsPerUnit===1?'':'s'} por pieza</b>
      <small>${points(p.units)} piezas · ${points(p.points)} pts · líder: ${p.leader}</small>
    </article>`).join('');

  const maxTotal = Math.max(...g.ranking.map(s=>s.totalPoints), 1);
  const rankNode = $('#generalRanking');
  if(rankNode) rankNode.innerHTML = g.ranking.map((s,i)=>{
    const width = Math.max(s.totalPoints ? 8 : 0, Math.min(100, s.totalPoints/maxTotal*100));
    const deltaPrev = i===0 ? 'Líder actual' : `${points(s.deltaPrev)} pts vs tienda anterior`;
    const deltaLeader = i===0 ? '0 pts vs líder' : `${points(s.deltaLeader)} pts debajo del líder`;
    return `<article class="generalRankCard ${i<3?'podium':''} ${i===0?'top1':''}">
      <div class="generalRankMain">
        <div class="rankBadge">${medal(i)}</div>
        <img src="${s.image}" alt="${s.store}">
        <div><h3>${s.store}</h3><p>${deltaPrev}</p><p class="leaderGap">${deltaLeader} · Fuerte: <b>${s.strongestProduct}</b></p></div>
      </div>
      <div class="generalScore"><strong>${points(s.totalPoints)}</strong><span>puntaje total</span></div>
      <div class="scoreBar"><i style="width:${width}%"></i></div>
      <div class="scoreBreakdown"><span>Piezas <b>${points(s.productUnits)}</b></span><span>Productos <b>${points(s.productPoints)}</b></span><span>Bonus <b>${points(s.bonusPoints)}</b></span><span>Partners <b>${points(s.bonusPartners)}</b></span></div>
      <div class="productBreakdown">${s.products.map(p=>`<span title="${p.reporte} · ${points(p.units)} piezas">${p.simple}<b>${points(p.points)}</b><small>${points(p.units)} pzas</small></span>`).join('')}</div>
    </article>`;
  }).join('');

  const bonusNode = $('#bonusTable');
  if(bonusNode) bonusNode.innerHTML = g.ranking.map(s=>`<tr><td>${s.position}</td><td>${s.store}</td><td>${points(s.bonusPartners)}</td><td>${points(s.bonusPoints)}</td><td>${points(s.totalPoints)}</td></tr>`).join('');

  const summaryNode = $('#generalExecutive');
  if(summaryNode) summaryNode.innerHTML = `<div class="execCard"><span>Resumen ejecutivo</span><h2>${top.store || 'Pendiente'} lidera con ${points(top.totalPoints)} pts</h2><p>El ranking se calcula con <b>Uso Ideal* (#) × Pts Concurso General</b> por producto y suma el bonus ¿Y Si, Sí?. Se ordena por Puntaje Total acumulado.</p></div><div class="execMini"><b>${points(g.productPoints)}</b><span>pts por productos</span></div><div class="execMini"><b>${points(g.bonusPoints)}</b><span>pts bonus</span></div>`;
}

function sortBy(mode){stores.sort((a,b)=> mode==='units'?b.units-a.units: mode==='actual'?b.actual-a.actual:(b.diff-a.diff)||(b.units-a.units)); renderCards(stores);} 
setTabs(); renderKpis(); renderCards(); renderGeneral(); $('#sortMode').addEventListener('change',e=>sortBy(e.target.value));
if('serviceWorker' in navigator){navigator.serviceWorker.register('service-worker.js').catch(()=>{});}

function setImageModal(){
  const modal=$('#imageModal'), img=$('#modalImg'), title=$('#modalTitle');
  if(!modal) return;
  document.querySelectorAll('.imageBtn').forEach(btn=>btn.addEventListener('click',()=>{
    img.src=btn.dataset.img; img.alt=btn.dataset.title; title.textContent=btn.dataset.title;
    modal.classList.add('open'); modal.setAttribute('aria-hidden','false');
  }));
  const close=()=>{modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); img.src='';};
  $('.modalClose').addEventListener('click',close);
  modal.addEventListener('click',e=>{if(e.target===modal) close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape') close();});
}
setImageModal();


function setTermsModal(){
  const modal=document.querySelector('#termsModal');
  const open=document.querySelector('#openTerms');
  if(!modal || !open) return;
  const closeBtn=modal.querySelector('.termsClose');
  const close=()=>{modal.classList.remove('open'); modal.setAttribute('aria-hidden','true');};
  open.addEventListener('click',()=>{modal.classList.add('open'); modal.setAttribute('aria-hidden','false');});
  closeBtn.addEventListener('click',close);
  modal.addEventListener('click',e=>{if(e.target===modal) close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape' && modal.classList.contains('open')) close();});
}
setTermsModal();
