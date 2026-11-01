"""Python 3 port of the unofficial NYPL package (bibliocommons scraper).
Usage: python3 nypl_verity.py "verity colleen hoover"
Needs: pip install requests beautifulsoup4
"""
import re
import sys
import requests
from bs4 import BeautifulSoup

BASE = "https://nypl.bibliocommons.com"


def soup(url):
    r = requests.get(url, timeout=30, headers={"User-Agent": "Mozilla/5.0"})
    r.raise_for_status()
    return BeautifulSoup(r.content, "html.parser")


def search_books(keyword):
    url = f"{BASE}/search?q={requests.utils.quote(keyword)}&searchOpt=catalogue"
    page = soup(url)
    results = []
    for block in page.find_all(id=re.compile(r"bib\d")):
        link = block.find(attrs={"data-testid": "bib_link"})
        if not link:
            continue
        title = link.get("title") or link.get_text(strip=True)
        avail = block.find(attrs={"data-testid": "availability_details"})
        copies_url = BASE + avail["href"] if avail and avail.get("href") else None
        results.append((title, copies_url))
    return results


def get_copies(copies_url):
    rows = []
    for tr in soup(copies_url).find_all("tr"):
        def cell(tid):
            el = tr.find(attrs={"data-testid": tid})
            return el.get_text(strip=True) if el else None
        branch = cell("item_branch_name")
        if branch:
            rows.append({
                "branch": branch,
                "collection": cell("item_collection"),
                "call_no": cell("item_call_number"),
                "status": cell("item_status"),
            })
    return rows


if __name__ == "__main__":
    keyword = sys.argv[1] if len(sys.argv) > 1 else "verity colleen hoover"
    books = search_books(keyword)
    if not books:
        print("No results. The page layout may have changed (selectors are stale).")
    for title, copies_url in books[:5]:
        print(f"\n== {title}")
        if not copies_url:
            print("  (no availability link)")
            continue
        for c in get_copies(copies_url):
            flag = "AVAILABLE" if c["status"] == "Available" else c["status"]
            print(f"  {c['branch']:<30} {c['collection'] or '':<25} {flag}")
