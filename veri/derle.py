import json,re
temel=json.load(open("temel.json"))
out=[];seen={}
def por(s):
    r=[]
    for x in s.split(";"):
        x=x.strip()
        if not x or ":" not in x: continue
        a,g=x.rsplit(":",1); r.append([a.strip(),float(g)])
    return r
for t in temel:
    out.append(dict(a=t["ad"],c=t["kat"],e=round(t["kcal"] or 0),p=round(t["p"] or 0,1),k=round(t["k"] or 0,1),y=round(t["y"] or 0,1),s="USDA",o=por(t["por"]),x=t["ek"]))
uyari=[]
for f in ["yemek1.txt","yemek2.txt","yemek3.txt","yemek4.txt"]:
    for line in open(f,encoding="utf-8"):
        line=line.strip()
        if not line or line.startswith("#"): continue
        p=line.split("|")
        e,pr,k,y=[float(v) for v in p[2].split(",")]
        if e<=0 and "su" not in p[0].lower(): continue
        hes=4*pr+4*k+9*y
        if e>20 and abs(hes-e)/e>0.2 and not any(w in p[0].lower() for w in ["rakı","votka","viski","şarap","bira"]): uyari.append((p[0],e,round(hes)))
        out.append(dict(a=p[0],c=p[1],e=round(e),p=pr,k=k,y=y,s="tahmini",o=por(p[3]),x=p[4] if len(p)>4 else ""))
# aynı ad tekrarı
d={}
for i in out:
    d.setdefault(i["a"].lower(),[]).append(i)
tekrar=[k for k,v in d.items() if len(v)>1]
print("toplam:",len(out),"| tekrar ad:",tekrar)
print("makro uyumsuz:",len(uyari)); [print("  ",u) for u in uyari]
nopor=[i["a"] for i in out if not i["o"]]; print("porsiyonsuz:",nopor)
json.dump(out,open("db.json","w"),ensure_ascii=False,separators=(",",":"))
from collections import Counter; print(Counter(i["c"] for i in out).most_common())
