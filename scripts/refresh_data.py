#!/usr/bin/env python3
"""Regenera data/contest-data.js desde el Excel oficial por hoja y encabezado."""
from __future__ import annotations
import json, re, sys, zipfile
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict
from datetime import datetime, timedelta
from pathlib import Path

MAIN_NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
REL_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
NS = {'m': MAIN_NS, 'r': REL_NS}

STORE_IMAGES = {
    'Cc Coacalco': 'assets/managers_clean/SM_Coacalco.jpeg',
    'Cosmopol': 'assets/managers_clean/SM_Cosmopol.jpeg',
    'Cosmopol N1': 'assets/managers_clean/SM_CosmopolN1.jpeg',
    'Galerias Perinorte': 'assets/managers_clean/SM_GaleriasPerinorte.jpeg',
    'Izcalli Mega Df': 'assets/managers_clean/SM_IzcalliMega.jpeg',
    'Luna Park': 'assets/managers_clean/SM_LunaPark.jpeg',
    'Patio Ecatepec': 'assets/managers_clean/SM_PatioEcatepec.jpeg',
    'Plaza Las Flores': 'assets/managers_clean/SM_LasFlores.jpeg',
    'Plaza San Marcos': 'assets/managers_clean/SM_SanMarcos.jpeg',
    'San Miguel Izcalli': 'assets/managers_clean/SM_SanMiguelIzcalli.jpeg',
}
PRODUCTS = [
    {'reporte':'Dona Grab & Go','simple':'Dona Grab & Go','image':'assets/products/Dona G&G.jpeg','pointsPerUnit':1.0,
     'aliases':{'Dona G&G','Dona Grab & Go'}},
    {'reporte':'Bis Nal Cheesecake Roulet Maxi','simple':'Cheesecake Roulet','image':'assets/products/Cheescake Roulete.jpeg','pointsPerUnit':1.0,
     'aliases':{'Bis Nal Cheesecake Roulet Maxi','Bis Nal Cheesecake Roulet Maxi C'}},
    {'reporte':'Bis Pan De Chocolate Margarina C','simple':'Pan de Chocolate','image':'assets/products/Pan de Chocolate.jpeg','pointsPerUnit':1.0,
     'aliases':{'Bis Pan De Chocolate Margarina C'}},
    {'reporte':'Cookie Straw CJ/6 LTA/25 pzas','simple':'Cookie Straw','image':'assets/products/Cookie Straw.jpeg','pointsPerUnit':0.5,
     'aliases':{'Cookie Straw CJ/6 LTA/25 pzas'}},
]
PRODUCT_BY_ALIAS = {alias:p for p in PRODUCTS for alias in p['aliases']}
REQUIRED = {
    'Base_Dona G&G': ['División','DM','Tiendas','Semana','Dia','Ingrediente','Unidad'],
    'Base_Concurso General': ['División','DM','Tiendas','Semana','Dia','Ingrediente','Uso Ideal* (#)'],
    'Y Si Sí': ['Tienda','Partners que publicaron','Puntos'],
}

def excel_date(value: str) -> str:
    return (datetime(1899, 12, 30) + timedelta(days=float(value))).date().isoformat()

def round2(value: float) -> float:
    return round(value + 1e-12, 2)

class WorkbookReader:
    def __init__(self, path: Path):
        self.z = zipfile.ZipFile(path)
        self.shared = []
        if 'xl/sharedStrings.xml' in self.z.namelist():
            root = ET.fromstring(self.z.read('xl/sharedStrings.xml'))
            for si in root.findall('m:si', NS):
                self.shared.append(''.join((t.text or '') for t in si.iter(f'{{{MAIN_NS}}}t')))
        workbook = ET.fromstring(self.z.read('xl/workbook.xml'))
        rels = ET.fromstring(self.z.read('xl/_rels/workbook.xml.rels'))
        relmap = {r.attrib['Id']: r.attrib['Target'] for r in rels}
        self.sheets = {}
        for sheet in workbook.find('m:sheets', NS):
            target = relmap[sheet.attrib[f'{{{REL_NS}}}id']]
            self.sheets[sheet.attrib['name']] = ('xl/' + target).replace('xl/worksheets/../', 'xl/')

    def rows(self, sheet_name: str) -> list[list[str]]:
        if sheet_name not in self.sheets:
            raise ValueError(f'No existe la hoja requerida: {sheet_name}')
        root = ET.fromstring(self.z.read(self.sheets[sheet_name]))
        output = []
        for row in root.findall('.//m:sheetData/m:row', NS):
            values = {}
            for cell in row.findall('m:c', NS):
                ref = cell.attrib['r']
                col = 0
                for ch in re.match(r'([A-Z]+)', ref).group(1):
                    col = col * 26 + ord(ch) - 64
                col -= 1
                typ = cell.attrib.get('t')
                value_node = cell.find('m:v', NS)
                if typ == 'inlineStr':
                    text = cell.find('m:is/m:t', NS)
                    value = text.text if text is not None else ''
                elif value_node is None:
                    value = ''
                else:
                    raw = value_node.text or ''
                    value = self.shared[int(raw)] if typ == 's' and raw else raw
                values[col] = value
            if values:
                output.append([values.get(i, '') for i in range(max(values) + 1)])
        return output

    def records(self, sheet_name: str, header_row: int = 0) -> tuple[list[str], list[dict[str,str]]]:
        rows = self.rows(sheet_name)
        header = rows[header_row]
        records = []
        for row in rows[header_row + 1:]:
            padded = row + [''] * max(0, len(header) - len(row))
            rec = dict(zip(header, padded))
            if any(str(v).strip() for v in rec.values()):
                records.append(rec)
        return header, records

def validate_headers(reader: WorkbookReader) -> None:
    for sheet, required in REQUIRED.items():
        header, _ = reader.records(sheet)
        missing = [h for h in required if h not in header]
        if missing:
            raise ValueError(f'{sheet}: encabezados faltantes: {missing}')

def read_baselines(reader: WorkbookReader) -> dict[str,float]:
    rows = reader.rows('Dona G&G Sem 24 a Sem 26')
    header_idx = next(i for i,r in enumerate(rows) if 'Tienda' in r and 'Prom' in r)
    header = rows[header_idx]
    store_idx, prom_idx = header.index('Tienda'), header.index('Prom')
    return {r[store_idx]: float(r[prom_idx]) for r in rows[header_idx+1:] if len(r)>prom_idx and r[store_idx]}

def duplicate_count(header: list[str], rows: list[dict[str,str]]) -> int:
    counts = Counter(tuple(r.get(h, '') for h in header) for r in rows)
    return sum(n-1 for n in counts.values() if n > 1)

def build(excel_path: Path) -> tuple[dict, dict]:
    reader = WorkbookReader(excel_path)
    validate_headers(reader)
    dona_header, dona_rows = reader.records('Base_Dona G&G')
    general_header, general_rows = reader.records('Base_Concurso General')
    _, bonus_rows = reader.records('Y Si Sí')
    dup_dona = duplicate_count(dona_header, dona_rows)
    dup_general = duplicate_count(general_header, general_rows)
    if dup_dona or dup_general:
        raise ValueError(f'Duplicados exactos detectados: Dona={dup_dona}, General={dup_general}')

    baselines = read_baselines(reader)
    portfolio = list(STORE_IMAGES)
    dona = defaultdict(lambda: {'units':0.0, 'dates':set(), 'weekly':defaultdict(float)})
    for row in dona_rows:
        store = row['Tiendas'].strip()
        if store not in STORE_IMAGES: raise ValueError(f'Tienda no reconocida en Base_Dona G&G: {store}')
        units = float(row['Unidad'] or 0)
        date = excel_date(row['Dia'])
        week = int(float(row['Semana']))
        dona[store]['units'] += units
        dona[store]['dates'].add(date)
        dona[store]['weekly'][week] += units

    dates = sorted(set().union(*(dona[s]['dates'] for s in dona)))
    latest = max(dates)
    latest_label = datetime.fromisoformat(latest).strftime('%d %b %Y')
    weeks = list(range(27, 33))
    stores = []
    for store in portfolio:
        info = dona[store]
        units = info['units']
        days = len(info['dates'])
        actual = units / days if days else 0
        base = baselines[store]
        diff = actual - base
        stores.append({
            'store':store, 'image':STORE_IMAGES[store], 'base':round2(base), 'actual':round2(actual),
            'units':round2(units), 'days':days, 'diff':round2(diff),
            'pct':round2((diff/base*100) if base else 0),
            'weekly':[round2(info['weekly'].get(w,0)) for w in weeks]
        })
    stores.sort(key=lambda s:(-s['diff'],-s['units'],s['store']))
    weekly_summary=[]
    for w in weeks:
        values={s: dona[s]['weekly'].get(w,0) for s in portfolio}
        total=sum(values.values())
        leader=max(values.items(), key=lambda kv:(kv[1],kv[0])) if total else ('Pendiente',0)
        weekly_summary.append({'week':w,'total':round2(total),'avg':round2(total/len(portfolio)),
                               'leader':leader[0],'leaderValue':round2(leader[1])})

    bonus = {r['Tienda'].strip():(float(r['Partners que publicaron'] or 0),float(r['Puntos'] or 0)) for r in bonus_rows}
    by_store = {s:{'products':{p['simple']:{'units':0.0,'points':0.0} for p in PRODUCTS}} for s in portfolio}
    product_totals = {p['simple']:{'units':0.0,'points':0.0,'stores':defaultdict(float)} for p in PRODUCTS}
    for row in general_rows:
        store = row['Tiendas'].strip(); raw = row['Ingrediente'].strip()
        if store not in by_store: raise ValueError(f'Tienda no reconocida en Base_Concurso General: {store}')
        if raw not in PRODUCT_BY_ALIAS: raise ValueError(f'Producto no reconocido: {raw}')
        product = PRODUCT_BY_ALIAS[raw]
        units = float(row['Uso Ideal* (#)'] or 0); pts = units * product['pointsPerUnit']
        item = by_store[store]['products'][product['simple']]
        item['units'] += units; item['points'] += pts
        pt = product_totals[product['simple']]
        pt['units'] += units; pt['points'] += pts; pt['stores'][store] += units

    ranking=[]
    for store in portfolio:
        products=[]
        for p in PRODUCTS:
            value=by_store[store]['products'][p['simple']]
            products.append({'reporte':p['reporte'],'simple':p['simple'],'image':p['image'],
                             'pointsPerUnit':p['pointsPerUnit'],'units':round2(value['units']),'points':round2(value['points'])})
        product_units=sum(p['units'] for p in products); product_points=sum(p['points'] for p in products)
        partners, bonus_points = bonus.get(store,(0,0))
        strongest=max(products,key=lambda p:(p['points'],p['units'],-PRODUCTS.index(next(x for x in PRODUCTS if x['simple']==p['simple']))))
        ranking.append({'store':store,'image':STORE_IMAGES[store],'productUnits':round2(product_units),
                        'productPoints':round2(product_points),'bonusPartners':int(partners),'bonusPoints':round2(bonus_points),
                        'totalPoints':round2(product_points+bonus_points),'strongestProduct':strongest['simple'],'products':products})
    ranking.sort(key=lambda x:(-x['totalPoints'],-x['productPoints'],x['store']))
    leader_total=ranking[0]['totalPoints'] if ranking else 0
    for i,item in enumerate(ranking):
        item['position']=i+1
        item['deltaLeader']=round2(leader_total-item['totalPoints'])
        item['deltaPrev']=0 if i==0 else round2(ranking[i-1]['totalPoints']-item['totalPoints'])

    product_summary=[]
    for p in PRODUCTS:
        totals=product_totals[p['simple']]
        leader=max(totals['stores'].items(),key=lambda kv:(kv[1],kv[0]))[0] if totals['stores'] else 'Pendiente'
        product_summary.append({'reporte':p['reporte'],'simple':p['simple'],'image':p['image'],
                                'pointsPerUnit':p['pointsPerUnit'],'units':round2(totals['units']),
                                'points':round2(totals['points']),'leader':leader})
    general_product_points=round2(sum(x['productPoints'] for x in ranking))
    general_bonus_points=round2(sum(x['bonusPoints'] for x in ranking))
    data={
      'stats':{'updated':latest_label,'leader':stores[0]['store'],'avgBase':round2(sum(s['base'] for s in stores)/len(stores)),
               'avgActual':round2(sum(s['actual'] for s in stores)/len(stores)),
               'avgDiff':round2(sum(s['diff'] for s in stores)/len(stores)),
               'units':round2(sum(s['units'] for s in stores)),'dates':dates,'daysElapsed':len(dates)},
      'stores':stores,'weeklySummary':weekly_summary,'weeks':weeks,'portfolio':portfolio,
      'general':{'version':'v8-data-08-julio-ui-cleanup','updated':latest_label,'sourceSheet':'Base_Concurso General',
                 'calculationRule':'Uso Ideal* (#) × Pts Concurso General + Bonus ¿Y Si, Sí?',
                 'leader':ranking[0]['store'],'totalPoints':round2(general_product_points+general_bonus_points),
                 'productPoints':general_product_points,'bonusPoints':general_bonus_points,
                 'bonusPartners':sum(x['bonusPartners'] for x in ranking),'productSummary':product_summary,'ranking':ranking}
    }
    audit={'latestDate':latest,'donaRows':len(dona_rows),'generalRows':len(general_rows),'donaDuplicates':dup_dona,
           'generalDuplicates':dup_general,'donaUnits':data['stats']['units'],'generalPoints':data['general']['totalPoints']}
    return data,audit

def main():
    if len(sys.argv)<2:
        raise SystemExit('Uso: python scripts/refresh_data.py <Base_Concurso_Dona&Items.xlsx> [salida]')
    src=Path(sys.argv[1]); out=Path(sys.argv[2]) if len(sys.argv)>2 else Path('data/contest-data.js')
    data,audit=build(src)
    out.write_text('window.CONTEST_DATA = '+json.dumps(data,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
    print(json.dumps(audit,ensure_ascii=False,indent=2))
if __name__=='__main__': main()
