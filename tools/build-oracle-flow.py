from pathlib import Path
import hashlib,json,re,subprocess
r=Path(__file__).resolve().parents[1]
BASE='e733838b1f5f35fed58629fb5f8c9dee4baa92ce'
# Pin the original sealed release so repeated builds remain idempotent.
names=['oracle-room.txt','oracle-room-part-02.txt','oracle-room-part-03.txt','oracle-room-part-04.txt']
s=''.join(subprocess.check_output(['git','show',BASE+':'+n],cwd=r).decode() for n in names)
s=s.replace('</style>','\n'+(r/'tools/oracle-flow.css').read_text()+'\n</style>',1)
s=s.replace('function beginSelection(){','let selectionGeneration=0;\nfunction beginSelection(){')
s=s.replace('setBusy(true);\n selectedSlots=[];selectionPhase="shuffling";','setBusy(true);\n const generation=++selectionGeneration;\n selectedSlots=[];selectionPhase="shuffling";')
s=s.replace('window.setTimeout(()=>{\n  selectionDeck=','window.setTimeout(()=>{\n  if(generation!==selectionGeneration)return;\n  selectionDeck=')
s=s.replace('(function installOracleViewportPages(){','(function installOracleViewportPages(){\n return; // The new divination wizard uses natural reading scroll, not forced viewport slicing.')
s=s.replace('/* ORACLE_FIXED_VIEWPORT_BEGIN */',(r/'tools/oracle-flow.js').read_text()+'\n/* ORACLE_FIXED_VIEWPORT_BEGIN */')
# Keep live-reload HTML injection from matching a literal exported body tag inside JavaScript.
s=s.replace("+'</scr'+'ipt></body></html>'","+'</scr'+'ipt><\\/body></html>'")
s=s.replace('#draw-form button,#draw-form textarea','#draw-form button,#draw-form textarea,.flow-stage button,.flow-stage textarea')
# Encode once, split only on complete Unicode characters, and retain the exact static seal contract.
parts=[];chunk='';size=0
for c in s:
 b=len(c.encode())
 if size+b>390000:parts.append(chunk);chunk='';size=0
 chunk+=c;size+=b
parts.append(chunk)
assert len(parts)==4
entries=[]
for n,part in zip(names,parts):
 data=part.encode();(r/n).write_bytes(data);entries.append(dict(url='/'+n,sha256=hashlib.sha256(data).hexdigest(),utf8Bytes=len(data),chars=len(part.encode('utf-16-le'))//2))
host=subprocess.check_output(['git','show',BASE+':oracle-room.html'],cwd=r).decode()
cfg=dict(origin='https://brendonlee1006.github.io',expectedHTMLSHA=hashlib.sha256(s.encode()).hexdigest(),expectedHTMLParts=entries)
host=re.sub(r'\}\)\(\{"origin".*?\}\);</script>',lambda m:'})('+json.dumps(cfg,separators=(',',':'))+');</script>',host,flags=re.S)
(r/'oracle-room.html').write_text(host)
(r/'tools/preview-oracle.html').write_text(s)
(r/'tools/app-check.js').write_text(re.search('<script id="app-code">(.*?)</script>',s,re.S).group(1))
print('Built',len(s.encode()),'bytes',cfg['expectedHTMLSHA'])
