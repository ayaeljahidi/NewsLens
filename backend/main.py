from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from elasticsearch import Elasticsearch
import ollama, re

app = FastAPI(title="NewsLens API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

es = Elasticsearch("http://172.17.83.53:9200")  # Change IP if needed
INDEX = "newslens_articles"


@app.get("/health")
def health():
    return {"status": "ok", "es": es.ping()}


@app.get("/search")
def search(
    q: str = Query(..., min_length=1),
    size: int = Query(10, le=20),
    source: str = Query(None),
    from_: int = Query(0, alias="from"),
):
    must = [{"multi_match": {"query": q, "fields": ["title^3", "description^2", "text"], "type": "best_fields", "fuzziness": "AUTO"}}]
    if source:
        must.append({"term": {"source": source}})

    resp = es.search(index=INDEX, body={
        "from": from_,
        "size": size,
        "query": {"bool": {"must": must}},
        "highlight": {
            "fields": {"title": {}, "description": {"fragment_size": 200, "number_of_fragments": 1}},
            "pre_tags": ["<mark>"], "post_tags": ["</mark>"]
        },
        "aggregations": {
            "sources": {"terms": {"field": "source", "size": 10}},
        }
    })

    hits = resp["hits"]["hits"]
    results = []
    for h in hits:
        src = h["_source"]
        hl  = h.get("highlight", {})
        results.append({
            "id":          h["_id"],
            "title":       hl.get("title", [src.get("title","")])[0],
            "description": hl.get("description", [src.get("description","")])[0],
            "source":      src.get("source",""),
            "url":         src.get("url",""),
            "published":   src.get("published",""),
            "score":       round(h["_score"], 2),
        })

    sources = [b["key"] for b in resp["aggregations"]["sources"]["buckets"]]
    total   = resp["hits"]["total"]["value"]
    return {"results": results, "total": total, "sources": sources}


@app.get("/summarize")
def summarize(q: str = Query(...), articles: str = Query(...)):
    titles = articles.split("||")[:5]
    context = "\n".join(f"- {t}" for t in titles)

    raw = ollama.chat(model="tinyllama", messages=[{
        "role": "user",
        "content": f"Based on these news articles about '{q}':\n{context}\n\nWrite a 2-3 sentence neutral summary of what's happening. Be concise and factual. No bullet points."
    }])["message"]["content"]

    summary = re.sub(r"<think>.*?</think>", "", raw, flags=re.DOTALL).strip()
    return {"summary": summary}


@app.get("/suggest")
def suggest(q: str = Query(..., min_length=2)):
    resp = es.search(index=INDEX, body={
        "size": 5,
        "query": {"match_phrase_prefix": {"title": {"query": q, "max_expansions": 10}}},
        "_source": ["title"]
    })
    suggestions = [h["_source"]["title"][:80] for h in resp["hits"]["hits"]]
    return {"suggestions": suggestions}
