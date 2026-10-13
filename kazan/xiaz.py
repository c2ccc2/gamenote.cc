import urllib.request
import re
import os
import time

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0",
    "Referer": "https://www.3dmgame.com/"
}

base_url = "https://www.3dmgame.com/gl/3964895.html"
start_page = 12
max_page = 104
save_dir = "./images"
os.makedirs(save_dir, exist_ok=True)

img_mapping = []
img_counter = 131
seen_url = set()

# 读取已有的映射表
if os.path.exists("替换清单.txt"):
    with open("替换清单.txt", "r", encoding="utf-8") as f:
        img_mapping = f.read().splitlines()

for page_num in range(start_page, max_page + 1):
    print(f"\n===== 处理第 {page_num} 页 =====")
    if page_num == 1:
        url = base_url
    else:
        url = base_url.replace(".html", f"_{page_num}.html")

    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=25) as r:
            html = r.read().decode("utf-8", errors="ignore")
        pattern = re.compile(r'(?:src|data-src)="(https://img\.3dmgame\.com/uploads/images/gl/[^"]+)"', re.S)
        img_urls = pattern.findall(html)
        print(f"本页抓到【攻略图】数量：{len(img_urls)}")

        for img_url in img_urls:
            if img_url in seen_url:
                continue
            seen_url.add(img_url)

            pure_url = img_url.split("?")[0]
            ext = pure_url.split(".")[-1]
            filename = f"img_{img_counter:03d}.{ext}"
            save_path = os.path.join(save_dir, filename)

            # 文件已经存在 → 跳过下载，只补映射
            if os.path.exists(save_path):
                print(f"⏭ 已存在，跳过：{filename}")
                img_mapping.append(f"【截图{img_counter}】 -> ![截图{img_counter}](./images/{filename})")
                img_counter += 1
                continue

            try:
                req_img = urllib.request.Request(img_url, headers=headers)
                with urllib.request.urlopen(req_img, timeout=20) as ri:
                    with open(save_path, "wb") as f:
                        f.write(ri.read())
                print(f"✅ {filename}")
                img_mapping.append(f"【截图{img_counter}】 -> ![截图{img_counter}](./images/{filename})")
                img_counter += 1
            except Exception as e:
                print(f"❌ 下载失败 {img_url} | {str(e)[:50]}")
    except Exception as e:
        print(f"⚠️ 页面 {page_num} 访问异常: {e}")
    time.sleep(1.5)  # 每页停顿1.5秒，防限流

# 回写映射表
with open("替换清单.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(img_mapping))

print("\n🎉 本轮处理完成！")
