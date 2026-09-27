"""Read local reference videos and create timestamped research contact sheets."""
import argparse, pathlib, subprocess
from PIL import Image, ImageDraw, ImageFont
p=argparse.ArgumentParser(); p.add_argument('part',type=int); p.add_argument('--times',type=int,nargs='+'); args=p.parse_args()
root=pathlib.Path(__file__).resolve().parents[1]
source=pathlib.Path('D:/windoc/cc/Downloads/【黯井微光】100%地毯式全收集全成就全流程攻略解说（更新中 P7 深渊）')
video=next(source.glob(f'P{args.part}-*.mp4'))
out=root/'_research/an-jing-wei-guang/images'/f'p{args.part}'; out.mkdir(parents=True,exist_ok=True)
ff='E:/codespace/GPT-SoVITS/.conda-env/Library/bin/ffmpeg.exe'
if args.times:
    for sec in args.times:
        target=out/f'frame-{sec:04d}.webp'
        subprocess.run([ff,'-hide_banner','-loglevel','error','-y','-ss',str(sec),'-i',str(video),'-frames:v','1','-c:v','libwebp','-quality','90',str(target)],check=True)
        print(target)
    raise SystemExit(0)
subprocess.run([ff,'-hide_banner','-loglevel','error','-y','-i',str(video),'-vf','fps=1/45','-q:v','3',str(out/'index-%03d.jpg')],check=True)
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',20)
files=sorted(out.glob('index-*.jpg'))
for start in range(0,len(files),12):
    canvas=Image.new('RGB',(3*426,4*272),'white'); draw=ImageDraw.Draw(canvas)
    for local,file in enumerate(files[start:start+12]):
        number=int(file.stem.split('-')[1]); sec=(number-1)*45+22.5
        x=(local%3)*426; y=(local//3)*272
        with Image.open(file) as im: canvas.paste(im.resize((426,240)),(x,y+30))
        draw.text((x+6,y+2),f'P{args.part} #{number} ~{int(sec)//60:02d}:{int(sec)%60:02d}',font=font,fill='black')
    target=out/f'contact-{start//12+1}.jpg'; canvas.save(target,quality=93); print(target)
