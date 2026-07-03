const data = window.CONTEST_DATA || { ranking: [], summary: {} };
const money = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
const dateFmt = new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });

const cutDate = document.getElementById('cutDate');
const kpis = document.getElementById('kpis');
const leaderboard = document.getElementById('leaderboard');
const storeFilter = document.getElementById('storeFilter');
const sortFilter = document.getElementById('sortFilter');

function prettyDate(iso){
  if(!iso) return 'Resumen actualizado a fecha: pendiente';
  const [y,m,d] = iso.split('-').map(Number);
  return `Resumen actualizado al ${dateFmt.format(new Date(y, m-1, d))}`;
}

function initTabs(){
  document.querySelectorAll('.tab').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`view-${btn.dataset.view}`).classList.add('active');
  }));
}

function renderKpis(){
  const s = data.summary || {};
  const cards = [
    ['Fecha de corte', prettyDate(data.updatedAt).replace('Resumen actualizado al ', '')],
    ['Líder actual', s.leader || 'Pendiente'],
    ['Dif. líder', `${s.leaderDiff > 0 ? '+' : ''}${money.format(s.leaderDiff || 0)}`],
    ['Unidades portafolio', money.format(s.totalUnits || 0)],
    ['Promedio actual', money.format(s.avgCurrent || 0)]
  ];
  kpis.innerHTML = cards.map(([label,value]) => `<article class="kpi"><small>${label}</small><strong>${value}</strong></article>`).join('');
}

function fillFilters(){
  data.stores.forEach(store => {
    const opt = document.createElement('option'); opt.value = store; opt.textContent = store; storeFilter.appendChild(opt);
  });
}

function rankIcon(rank){ return rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`; }
function statusText(d){ return d > 2 ? '🔥 Alto impulso' : d > 0 ? '✅ Superando base' : d === 0 ? '➖ En línea' : '🎯 Oportunidad'; }

function getRows(){
  let rows = [...data.ranking];
  const store = storeFilter.value;
  if(store !== 'all') rows = rows.filter(r => r.store === store);
  const key = sortFilter.value;
  rows.sort((a,b) => (b[key === 'diff' ? 'difference' : key] ?? 0) - (a[key === 'diff' ? 'difference' : key] ?? 0));
  return rows;
}

function renderLeaderboard(){
  const rows = getRows();
  const maxDiff = Math.max(1, ...data.ranking.map(r => Math.max(0, r.difference + 3)));
  leaderboard.innerHTML = rows.map((r,idx) => {
    const width = Math.max(6, Math.min(100, ((Math.max(0,r.difference)+3) / maxDiff) * 100));
    const diffClass = r.difference >= 0 ? 'positive' : 'negative';
    return `<article class="rank-card ${r.rank === 1 && storeFilter.value === 'all' ? 'top1' : ''}" style="animation-delay:${idx*55}ms">
      <div class="photo-wrap"><div class="rank-badge">${rankIcon(r.rank)}</div><img src="${r.image}" alt="SM ${r.store}" loading="lazy"></div>
      <div class="card-body">
        <div class="meta"><small>${statusText(r.difference)}</small><h3>${r.store}</h3></div>
        <div><div class="diff ${diffClass}">${r.difference >= 0 ? '+' : ''}${money.format(r.difference)}</div><div class="progress"><div class="bar" style="width:${width}%"></div></div></div>
        <div class="metrics">
          <div class="metric"><span>Base S24-26</span><strong>${money.format(r.base)}</strong></div>
          <div class="metric"><span>Prom. actual</span><strong>${money.format(r.current)}</strong></div>
          <div class="metric"><span>Unidades</span><strong>${money.format(r.units)}</strong></div>
          <div class="metric"><span>Días cargados</span><strong>${r.days}</strong></div>
        </div>
      </div>
    </article>`;
  }).join('');
}

function init(){
  cutDate.textContent = prettyDate(data.updatedAt);
  initTabs(); renderKpis(); fillFilters(); renderLeaderboard();
  storeFilter.addEventListener('change', renderLeaderboard);
  sortFilter.addEventListener('change', renderLeaderboard);
  if('serviceWorker' in navigator){ navigator.serviceWorker.register('service-worker.js').catch(()=>{}); }
}
init();
