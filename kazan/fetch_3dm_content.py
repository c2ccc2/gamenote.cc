import time
import re
import os
from curl_cffi import requests as cffi_requests

headers = {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9",
    "Referer": "https://www.3dmgame.com/gl/3964895.html",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
    "Upgrade-Insecure-Requests": "1",
}

base_url = "https://www.3dmgame.com/gl/3964895.html"

# 读取图片映射
rep_dict = {}
if os.path.exists("替换清单.txt"):
    with open("替换清单.txt", "r", encoding="utf-8") as f:
        for line in f.readlines():
            line = line.strip()
            if " -> " in line:
                k, v = line.split(" -> ", 1)
                rep_dict[k] = v

page_data = {}

def get_page(url, retry=2):
    for _ in range(retry):
        try:
            resp = cffi_requests.get(
                url,
                headers=headers,
                impersonate="chrome130",
                timeout=25
            )
            if resp.status_code == 200:
                return resp.text
        except Exception as e:
            print(f"请求异常: {e}，等待重试...")
        time.sleep(2.2)
    return None


for page_num in range(1, 104+1):
    print(f"正在拉取原文 第{page_num}页")
    if page_num == 1:
        url = base_url
    else:
        url = base_url.replace(".html", f"_{page_num}.html")

    html = get_page(url)
    if html is None:
        page_data[page_num] = (f"第{page_num}页", f">>>页面获取失败，请手动查看网页 {url}", [])
        time.sleep(1.8)
        continue

    # 提取正文容器 news-content
    m_body = re.search(r'<div class="news-content">(.*?)<div class="news-page">', html, re.S)
    if not m_body:
        content_text = "【未能提取正文】"
    else:
        raw = m_body.group(1)
        # 简单html转markdown
        raw = re.sub(r'<br\s*/?>', '\n', raw)
        raw = re.sub(r'<p.*?>', '\n', raw)
        raw = re.sub(r'</p>', '\n', raw)
        raw = re.sub(r'<script.*?</script>', '', raw, flags=re.S)
        raw = re.sub(r'<style.*?</style>', '', raw, flags=re.S)
        raw = re.sub(r'<.*?>', '', raw)
        raw = re.sub(r'\n\s*\n+', '\n\n', raw).strip()
        content_text = raw

    # 提取标题
    title_m = re.search(r'<h1.*?>(.*?)</h1>', html, re.S)
    if title_m:
        page_title = title_m.group(1).strip()
    else:
        page_title = f"第{page_num}页"

    # 提取图片链接
    img_pattern = re.compile(r'(?:src|data-src)="(https://img\.3dmgame\.com/uploads/images/gl/[^"]+)"', re.S)
    imgs = img_pattern.findall(html)

    page_data[page_num] = (page_title, content_text, imgs)
    time.sleep(1.6) # 限速，防止封IP


jobs = [
    ("卡赞攻略_part1.md", 1, 22),
    ("卡赞攻略_part2.md", 23, 44),
    ("卡赞攻略_part3.md", 45, 64),
    ("卡赞攻略_part4.md", 65, 86),
    ("卡赞攻略_part5.md", 87, 104),
]

for fname, start, end in jobs:
    part_idx = jobs.index((fname, start, end)) + 1
    out_lines = [f"# 《第一狂战士：卡赞》全任务流程图文攻略 Part {part_idx}\n> 本地图文归档，图片路径 ./images\n"]
    for pn in range(start, end+1):
        title, text, imglist = page_data.get(pn, (f"第{pn}页","缺失内容",[]))
        out_lines.append(f"\n## 第{pn}页 · {title}")
        out_lines.append(text)
        # 按顺序插入本地图片标记
        for idx,_ in enumerate(imglist):
            tag_key = f"【截图{pn*100+idx:03d}】"
            real_img = rep_dict.get(tag_key, "")
            if real_img:
                out_lines.append(f"\n{real_img}\n")
        out_lines.append("\n---\n")
    full_text = "\n".join(out_lines)
    with open(fname, "w", encoding="utf-8") as f:
        f.write(full_text)
    print(f"✅输出 {fname} 页码 {start}-{end}")

print("\n全部任务完成！")
