const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const reelsDir = path.join(projectRoot, 'assets', 'reels');
const tmpDir = path.join(projectRoot, 'scripts', 'tmp_reels');

if (!fs.existsSync(reelsDir)) fs.mkdirSync(reelsDir, { recursive: true });
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

function findFfmpeg() {
  try {
    const out = execFileSync('where.exe', ['ffmpeg'], { encoding: 'utf8' }).trim();
    if (out) return out.split(/\r?\n/)[0].trim();
  } catch (e) {}

  const localAppData = process.env.LOCALAPPDATA || '';
  const pkgRoot = path.join(localAppData, 'Microsoft', 'WinGet', 'Packages');
  if (fs.existsSync(pkgRoot)) {
    for (const dir of fs.readdirSync(pkgRoot)) {
      if (dir.startsWith('Gyan.FFmpeg')) {
        const subRoot = path.join(pkgRoot, dir);
        for (const sub of fs.readdirSync(subRoot)) {
          const candidate = path.join(subRoot, sub, 'bin', 'ffmpeg.exe');
          if (fs.existsSync(candidate)) return candidate;
        }
      }
    }
  }
  throw new Error('ffmpeg.exe não encontrado.');
}

function wrapText(text, maxChars = 24, maxLines = 3) {
  const words = String(text || '').split(/\s+/);
  const lines = [];
  let current = '';
  for (const w of words) {
    if ((current + ' ' + w).trim().length <= maxChars) {
      current = (current + ' ' + w).trim();
    } else {
      if (current) lines.push(current);
      current = w;
      if (lines.length >= maxLines - 1) break;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  return lines.join('\n');
}

function escapeDrawtext(txt) {
  return String(txt || '')
    .replace(/\\/g, '\\\\')
    .replace(/:/g, '\\:')
    .replace(/'/g, "\\'");
}

async function downloadCover(url, destPath) {
  const fallback = path.join(projectRoot, 'assets', 'og-banner.jpg');
  if (!url || !url.startsWith('http')) {
    fs.copyFileSync(fallback, destPath);
    return;
  }
  const hiRes = url.includes('images.unsplash.com')
    ? url.split('?')[0] + '?w=1080&h=1080&auto=format&fit=crop&q=85'
    : url;
  try {
    const res = await fetch(hiRes, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(destPath, buf);
  } catch (e) {
    fs.copyFileSync(fallback, destPath);
  }
}

async function main() {
  const ffmpeg = findFfmpeg();
  console.log('✅ FFmpeg localizado:', ffmpeg);

  const limitArg = process.argv.find(a => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 15;

  const courses = JSON.parse(fs.readFileSync(path.join(projectRoot, 'api', 'cache_courses.json'), 'utf8'));
  const active = courses.filter(c => c.isActive !== false && c.id && c.title);
  // Priorizar cursos em destaque (featured) e mais recentes
  const prioritized = [
    ...active.filter(c => c.featured),
    ...active.filter(c => !c.featured && (c.id.startsWith('fiap-on-') || c.id.startsWith('evg-'))),
    ...active.filter(c => !c.featured && !c.id.startsWith('fiap-on-') && !c.id.startsWith('evg-'))
  ].slice(0, limit);

  const fontBold = 'C\\:/Windows/Fonts/segoeuib.ttf';
  const fontReg = 'C\\:/Windows/Fonts/segoeui.ttf';

  let generated = 0;
  for (const c of prioritized) {
    const outMp4 = path.join(reelsDir, `${c.id}.mp4`);
    if (fs.existsSync(outMp4) && fs.statSync(outMp4).size > 50000) {
      console.log(`⏭️ Já existe: ${c.id}.mp4`);
      continue;
    }

    const imgPath = path.join(tmpDir, `${c.id}.jpg`);
    await downloadCover(c.imageUrl, imgPath);

    const titleWrapped = escapeDrawtext(wrapText(c.title, 22, 3));
    const providerText = escapeDrawtext(`${c.provider || 'Portal Você Pode Tudo'}`);
    const infoText = escapeDrawtext(`${c.workloadHours || 20}h  •  100% Online  •  ${c.hasFreeCertificate ? 'Certificado Grátis' : 'Aulas Gratuitas'}`);
    const badgeText = escapeDrawtext('CURSO 100% GRATUITO');
    const ctaText = escapeDrawtext('Acesse: vocepodetudo.com');

    // Filtro complexo: split do vídeo em 2 para fundo desfocado + capa nítida + painel escuro + textos
    const vf = [
      '[0:v]split=2[v1][v2]',
      '[v1]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=25:5,eq=brightness=-0.18[bg]',
      '[v2]scale=980:660:force_original_aspect_ratio=increase,crop=980:660[fg]',
      '[bg][fg]overlay=50:220[comp]',
      `[comp]drawbox=x=40:y=940:w=1000:h=720:color=#0a192f@0.88:t=fill,drawbox=x=40:y=940:w=1000:h=10:color=#009639:t=fill,drawbox=x=80:y=990:w=420:h=56:color=#009639:t=fill,drawtext=fontfile='${fontBold}':expansion=none:text='${badgeText}':fontcolor=white:fontsize=28:x=105:y=1005,drawtext=fontfile='${fontBold}':expansion=none:text='${titleWrapped}':fontcolor=white:fontsize=56:line_spacing=14:x=80:y=1090,drawtext=fontfile='${fontReg}':expansion=none:text='Instituição\\: ${providerText}':fontcolor=#ffcc29:fontsize=34:x=80:y=1380,drawtext=fontfile='${fontReg}':expansion=none:text='${infoText}':fontcolor=#cbd5e1:fontsize=30:x=80:y=1445,drawbox=x=80:y=1530:w=920:h=86:color=#ffcc29:t=fill,drawtext=fontfile='${fontBold}':expansion=none:text='${ctaText}':fontcolor=#0a192f:fontsize=38:x=(w-text_w)/2:y=1553[vout]`
    ].join(';');

    try {
      execFileSync(ffmpeg, [
        '-y',
        '-loop', '1',
        '-framerate', '30',
        '-t', '6',
        '-i', imgPath,
        '-f', 'lavfi',
        '-t', '6',
        '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
        '-filter_complex', vf,
        '-map', '[vout]',
        '-map', '1:a',
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '23',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        '-b:a', '96k',
        '-movflags', '+faststart',
        outMp4
      ], { stdio: 'pipe' });
      generated++;
      console.log(`🎬 Gerado (${generated}): assets/reels/${c.id}.mp4`);
    } catch (err) {
      console.error(`❌ Erro em ${c.id}:`, err.stderr ? err.stderr.toString() : err.message);
    }
  }

  fs.rmSync(tmpDir, { recursive: true, force: true });
  console.log(`🎉 Concluído! ${generated} vídeos Reels prontos em assets/reels/`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
