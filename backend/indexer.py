"""
NewsLens — Indexer v3 (Python 3.14 compatible, zero external deps)

Usage:
    python indexer.py              # 500 articles demo (instantane)
    python indexer.py --n 1000     # plus d'articles
    python indexer.py --news MYKEY # vrais articles via newsapi.org (gratuit)
"""
import argparse, random
from datetime import datetime, timedelta
from elasticsearch import Elasticsearch, helpers

es    = Elasticsearch("http://172.17.83.53:9200")
INDEX = "newslens_articles"

TEMPLATES = [
    ("OpenAI announces GPT-5 with advanced reasoning","The latest model shows dramatic improvements in logical reasoning and code generation, outperforming human experts on several benchmarks.","tech","techcrunch.com"),
    ("Apple Silicon M4 chips bring AI to MacBook Pro","The new chips feature dedicated neural engine cores capable of running large language models locally without cloud connectivity.","tech","theverge.com"),
    ("Google DeepMind achieves breakthrough in protein prediction","AlphaFold 3 can now predict interactions between proteins and DNA, opening new possibilities for drug discovery.","tech","nature.com"),
    ("Microsoft integrates Copilot across all Office 365 apps","The AI assistant can now summarize emails, draft presentations, and analyze spreadsheets with a single prompt.","tech","zdnet.com"),
    ("Meta releases open-source AI model rivaling GPT-4","Llama 3 is freely available to researchers and businesses, challenging the dominance of closed-source models.","tech","wired.com"),
    ("Tesla Full Self-Driving software reaches Version 13","The update includes improved urban navigation and handles complex intersections with significantly fewer interventions.","tech","electrek.co"),
    ("Amazon AWS launches new AI infrastructure with custom chips","Trainium2 chips offer three times the performance of previous generation for AI training workloads.","tech","businessinsider.com"),
    ("Nvidia unveils next-generation Blackwell GPU architecture","The new chips deliver up to 30x more performance for AI inference tasks compared to the H100 generation.","tech","anandtech.com"),
    ("Samsung announces 2nm chip manufacturing breakthrough","The company achieved a 15% performance improvement and 30% power reduction compared to current 3nm production.","tech","semianalysis.com"),
    ("Anthropic releases Claude 4 with extended context window","The model supports up to 2 million tokens of context, enabling analysis of entire codebases in a single query.","tech","venturebeat.com"),
    ("Federal Reserve signals rate cuts as inflation cools","Consumer prices rose 2.4% year-over-year, the lowest reading since 2021, giving the Fed room to maneuver.","economy","reuters.com"),
    ("Global chip shortage eases as TSMC expands capacity","The Taiwanese manufacturer opened two new fabs, helping reduce lead times across the automotive sector.","economy","ft.com"),
    ("European Central Bank holds rates amid growth concerns","ECB officials cited slowing industrial output in Germany and France as key factors in their decision.","economy","bloomberg.com"),
    ("Oil prices fall as OPEC+ signals production increase","Brent crude dropped 3% after Saudi Arabia and Russia agreed to raise output targets.","economy","wsj.com"),
    ("US unemployment drops to 3.7% in strong jobs report","Nonfarm payrolls added 272,000 jobs in May, beating expectations, with healthcare and tech leading gains.","economy","cnbc.com"),
    ("IMF upgrades global growth forecast to 3.2% for 2024","Stronger performance in emerging markets, particularly India and Southeast Asia, drove the upward revision.","economy","economist.com"),
    ("Bitcoin surpasses 100,000 dollars for the first time","Institutional adoption and ETF inflows drove the cryptocurrency to a historic milestone after months of gains.","economy","coindesk.com"),
    ("2024 declared hottest year on record by climate scientists","Global average temperatures exceeded 1.5C above pre-industrial levels for the first time annually.","climate","bbc.com"),
    ("Renewable energy surpasses coal in US electricity generation","Solar and wind power together generated more electricity than coal for the first time in American history.","climate","guardian.com"),
    ("Arctic sea ice reaches record low in summer measurements","Scientists recorded the smallest Arctic ice coverage since satellite observations began in 1979.","climate","scientificamerican.com"),
    ("EU announces accelerated combustion engine phase-out","New regulations require all new passenger cars to be zero-emission by 2030, five years earlier than planned.","climate","euronews.com"),
    ("Amazon deforestation rate drops 50% under new policies","Brazil's agency reported a reduction in illegal logging following stricter enforcement and satellite monitoring.","climate","mongabay.com"),
    ("Solar panel costs fall below 10 cents per watt globally","Manufacturing efficiency gains and scale have made solar the cheapest source of new electricity in history.","climate","irena.org"),
    ("UN Security Council passes landmark AI governance resolution","The measure calls for international standards on military AI and transparency from member states.","politics","un.org"),
    ("G7 nations agree on coordinated China tariff strategy","Leaders reached consensus on semiconductor export controls and joint investment screening for critical technology.","politics","politico.com"),
    ("EU Parliament approves sweeping AI Act legislation","The world's first comprehensive AI law bans real-time facial recognition and requires transparency for high-risk systems.","politics","euractiv.com"),
    ("NATO expands membership amid changing security landscape","The alliance welcomed new members and announced increased defense spending commitments from existing partners.","politics","nato.int"),
    ("mRNA vaccine technology shows promise against cancer","Phase 2 trials combining personalized mRNA vaccines with immunotherapy showed 44% reduction in recurrence.","health","nejm.org"),
    ("WHO declares end to mpox global health emergency","Cases have declined significantly following vaccine rollout, though the agency urged continued vigilance.","health","who.int"),
    ("Alzheimer's drug receives full FDA approval","Lecanemab demonstrated consistent slowing of cognitive decline in patients with early-stage disease.","health","statnews.com"),
    ("New antibiotic discovered using AI screening method","Researchers used machine learning to identify a novel compound effective against drug-resistant bacteria.","health","cell.com"),
    ("SpaceX Starship completes first successful orbital flight","The fully reusable rocket reached orbit and both booster and upper stage were recovered successfully.","space","nasaspaceflight.com"),
    ("NASA discovers water ice deposits near Mars south pole","The Mars Reconnaissance Orbiter detected extensive subsurface ice supporting future crewed missions.","space","nasa.gov"),
    ("James Webb Telescope captures earliest galaxy ever observed","The galaxy JADES-GS-z14-0 formed just 290 million years after the Big Bang, reshaping early universe models.","space","space.com"),
    ("ESA Euclid mission reveals dark matter map of the universe","The telescope produced the most detailed large-scale structure map ever created, spanning billions of light years.","space","esa.int"),
]

EXTRAS = ["according to experts","analysts say","new research suggests","officials confirmed","data shows","marking a significant milestone","which could impact millions","following months of development","in a landmark decision","sources close to the matter indicate"]

def make_articles(n):
    arts, base = [], datetime(2024, 1, 1)
    for i in range(n):
        t = TEMPLATES[i % len(TEMPLATES)]
        title, desc, cat, src = t
        extra = random.choice(EXTRAS)
        full  = f"{desc} — {extra}." if i % 4 == 0 else desc
        pub   = (base + timedelta(days=random.randint(0, 400))).strftime("%Y-%m-%d")
        arts.append({"title": title, "description": full, "text": full+" "+desc,
                     "source": src, "url": f"https://{src}/article/{i+1}",
                     "published": pub, "category": cat})
    return arts

def create_index():
    if es.indices.exists(index=INDEX):
        es.indices.delete(index=INDEX)
        print("Deleted existing index")
    es.indices.create(index=INDEX, body={
        "settings": {"number_of_shards":1,"number_of_replicas":0,
            "analysis":{"analyzer":{"news_analyzer":{"type":"standard","stopwords":"_english_"}}}},
        "mappings": {"properties": {
            "title":       {"type":"text","analyzer":"news_analyzer"},
            "description": {"type":"text","analyzer":"news_analyzer"},
            "text":        {"type":"text","analyzer":"news_analyzer"},
            "source":      {"type":"keyword"},
            "url":         {"type":"keyword"},
            "published":   {"type":"date","ignore_malformed":True},
            "category":    {"type":"keyword"},
        }}
    })
    print(f"Index '{INDEX}' created.\n")

def index_demo(n):
    create_index()
    arts = make_articles(n)
    helpers.bulk(es, [{"_index":INDEX,"_source":a} for a in arts])
    es.indices.refresh(index=INDEX)
    cats = list(set(a["category"] for a in arts))
    print(f"Done! {n} articles indexed.")
    print(f"Categories: {', '.join(cats)}")
    print(f"\nTry searching: 'AI', 'climate change', 'Apple', 'vaccine', 'economy'")

def index_newsapi(api_key, n):
    import requests
    create_index()
    queries = ["technology","economy","climate","health","space","AI","politics"]
    batch, total = [], 0
    for q in queries:
        if total >= n: break
        try:
            r = requests.get("https://newsapi.org/v2/everything", timeout=15, params={
                "q":q,"language":"en","pageSize":min(100,n//len(queries)+10),
                "sortBy":"publishedAt","apiKey":api_key})
            for art in r.json().get("articles",[]):
                if total >= n: break
                title = (art.get("title") or "").strip()
                if not title or title=="[Removed]": continue
                batch.append({"_index":INDEX,"_source":{
                    "title":title[:300],
                    "description":(art.get("description") or "")[:600],
                    "text":(art.get("content") or "")[:2000],
                    "source":(art.get("source",{}).get("name") or "")[:60],
                    "url":art.get("url",""),
                    "published":(art.get("publishedAt") or "")[:10],
                    "category":q}})
                total += 1
        except Exception as e:
            print(f"Warning ({q}): {e}")
    if batch: helpers.bulk(es, batch)
    es.indices.refresh(index=INDEX)
    print(f"Done! {total} real articles indexed.")

if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--n",    type=int, default=500)
    p.add_argument("--news", type=str, default=None, metavar="API_KEY",
                   help="Real articles from newsapi.org (free key)")
    a = p.parse_args()
    if a.news: index_newsapi(a.news, a.n)
    else:      index_demo(a.n)