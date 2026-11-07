import json,re,sys
sr=json.load(open("sr28.json"))
bydesc={}
for r in sr: bydesc.setdefault(r["d"].lower(),r)
def bul(q):
    ql=q.lower().strip()
    if ql in bydesc: return bydesc[ql],"tam"
    w=[x for x in re.split(r"[ ,()]+",ql) if x]
    c=[r for r in sr if all(t in r["d"].lower() for t in w)]
    if not c: return None,"yok"
    c.sort(key=lambda r:len(r["d"]))
    return c[0],"yakın"
out=[];bad=[]
for line in open("temel.txt",encoding="utf-8"):
    line=line.strip()
    if not line or line.startswith("#"): continue
    p=line.split("|")
    ad,kat,q,por=p[0],p[1],p[2],p[3]; ek=p[4] if len(p)>4 else ""
    r,how=bul(q)
    if not r: bad.append((ad,q)); continue
    if how!="tam": print("YAKIN:",ad,"=>",r["d"])
    out.append(dict(ad=ad,kat=kat,kaynak="USDA "+r["id"],kcal=r["kcal"],p=r["p"],k=r["k"],y=r["y"],lif=r["lif"],por=por,ek=ek))
json.dump(out,open("temel.json","w"),ensure_ascii=False)
print(len(out),"eşleşti;",len(bad),"bulunamadı");[print(" YOK:",b) for b in bad]
