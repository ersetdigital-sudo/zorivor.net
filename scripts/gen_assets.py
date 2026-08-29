"""Generate favicon.ico, icon.png, og-image.png for Zorivor.

Brand mark: dark bg with rounded square outline + violet/teal gradient,
white "Z" path inside.
"""
from PIL import Image, ImageDraw, ImageFont
import os
import math

OUT = r"D:\zorivor\web\public"
os.makedirs(OUT, exist_ok=True)

# Brand colors
BG = (8, 8, 15, 255)            # #08080f
INK = (245, 245, 251, 255)      # #f5f5fb
VIOLET = (167, 139, 250, 255)   # #a78bfa
VIOLET_DEEP = (139, 92, 246, 255)
TEAL = (45, 212, 191, 255)      # #2dd4bf
PINK = (249, 168, 212, 255)     # #f9a8d4


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3)) + (255,)


def draw_gradient_line(draw, p0, p1, colors, width):
    """Draw a stroked line with a multi-stop linear gradient (approximated)."""
    steps = 80
    x0, y0 = p0
    x1, y1 = p1
    for i in range(steps):
        t = i / max(steps - 1, 1)
        # pick color
        seg = t * (len(colors) - 1)
        idx = int(seg)
        frac = seg - idx
        c = lerp(colors[idx], colors[min(idx + 1, len(colors) - 1)], frac)
        nx = x0 + (x1 - x0) * t
        ny = y0 + (y1 - y0) * t
        draw.ellipse([nx - width / 2, ny - width / 2, nx + width / 2, ny + width / 2], fill=c)


def make_icon(size: int, with_bg: bool = True) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    s = size
    pad = max(2, int(s * 0.05))
    # Background rounded square (dark)
    if with_bg:
        d.rounded_rectangle([pad, pad, s - pad, s - pad], radius=int(s * 0.28), fill=BG)
    # Border — gradient stroke approximation by drawing multiple thin lines
    bx0, by0, bx1, by1 = pad + 1, pad + 1, s - pad - 1, s - pad - 1
    border_w = max(1, int(s * 0.06))
    # diagonal gradient from violet→teal
    colors = [(167, 139, 250), (139, 92, 246), (45, 212, 191)]
    # Approximate by sampling many tiny ellipses along the perimeter
    perim_steps = max(120, s * 2)
    cx = cy = s / 2
    rx_outer = (bx1 - bx0) / 2
    ry_outer = (by1 - by0) / 2
    rx_inner = rx_outer - border_w
    ry_inner = ry_outer - border_w
    for i in range(perim_steps):
        ang = (i / perim_steps) * 2 * math.pi
        t = i / perim_steps
        seg = t * (len(colors) - 1)
        idx = int(seg)
        frac = seg - idx
        c = lerp(colors[idx], colors[min(idx + 1, len(colors) - 1)], frac)
        # outer point
        ox = cx + rx_outer * math.cos(ang)
        oy = cy + ry_outer * math.sin(ang)
        ix = cx + rx_inner * math.cos(ang)
        iy = cy + ry_inner * math.sin(ang)
        d.line([(ox, oy), (ix, iy)], fill=c, width=2)
    # Z path (the brand) — draw as polygon
    # scale from viewBox 48 → size
    scale = s / 48
    Z = [(14, 14.5), (34.5, 14.5), (19.5, 33.5), (34.5, 33.5)]
    Zpx = [(p[0] * scale, p[1] * scale) for p in Z]
    # stroke width proportional
    sw = max(2, int(s * 0.075))
    # gradient stroke
    steps = 60
    for i in range(steps):
        # walk along segments
        seg_lengths = []
        total = 0
        for j in range(len(Zpx) - 1):
            dx = Zpx[j + 1][0] - Zpx[j][0]
            dy = Zpx[j + 1][1] - Zpx[j][1]
            L = math.hypot(dx, dy)
            seg_lengths.append(L)
            total += L
        t = i / (steps - 1)
        # find which segment
        target = t * total
        acc = 0
        seg_idx = 0
        for j, L in enumerate(seg_lengths):
            if acc + L >= target:
                seg_idx = j
                break
            acc += L
        local_t = (target - acc) / max(seg_lengths[seg_idx], 0.001)
        x0, y0 = Zpx[seg_idx]
        x1, y1 = Zpx[seg_idx + 1]
        px = x0 + (x1 - x0) * local_t
        py = y0 + (y1 - y0) * local_t
        # color (white to light violet)
        c = lerp((245, 245, 251), (196, 181, 253), t)
        d.ellipse([px - sw / 2, py - sw / 2, px + sw / 2, py + sw / 2], fill=c)
    return img


# favicon — small square PNG (32)
make_icon(32).save(os.path.join(OUT, "favicon-32.png"))
# favicon-16
make_icon(16).save(os.path.join(OUT, "favicon-16.png"))

# apple-touch-icon 180
make_icon(180).save(os.path.join(OUT, "apple-touch-icon.png"))

# ICO multi-size
sizes = [16, 32, 48]
icons = [make_icon(s) for s in sizes]
icons[0].save(
    os.path.join(OUT, "favicon.ico"),
    format="ICO",
    sizes=[(s, s) for s in sizes],
    append_images=icons[1:],
)


# ====== OG IMAGE (1200x630) ======
def make_og(width=1200, height=630) -> Image.Image:
    img = Image.new("RGB", (width, height), (8, 8, 15))
    # Background gradient (diagonal)
    for y in range(height):
        for x in range(width):
            t = ((x + y) / (width + height))
            c = lerp((8, 8, 15), (16, 11, 31), min(t, 1.0))
            img.putpixel((x, y), c)

    # Ambient orbs (radial)
    def add_orb(cx, cy, radius, color, alpha=120):
        for i in range(radius, 0, -2):
            a = int(alpha * (1 - i / radius) ** 2)
            rgba = color + (a,)
            layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
            ld = ImageDraw.Draw(layer)
            ld.ellipse([cx - i, cy - i, cx + i, cy + i], fill=rgba)
            img.paste(layer, (0, 0), layer)

    add_orb(1100, 130, 350, (167, 139, 250), 90)
    add_orb(150, 540, 380, (45, 212, 191), 70)

    d = ImageDraw.Draw(img)

    # Logo (top-left)
    logo = make_icon(72, with_bg=True)
    img.paste(logo, (80, 80), logo)

    # Brand text
    try:
        font_brand = ImageFont.truetype("C:\\Windows\\Fonts\\segoeuib.ttf", 36)
    except OSError:
        font_brand = ImageFont.load_default()
    d.text((170, 100), "ZORIVOR", fill=INK, font=font_brand)

    # Pill (badge)
    pad_x, pad_y = 80, 360
    pill_w, pill_h = 280, 50
    d.rounded_rectangle(
        [pad_x, pad_y, pad_x + pill_w, pad_y + pill_h],
        radius=999, fill=(167, 139, 250, 30), outline=(167, 139, 250, 80), width=2,
    )
    # dot
    d.ellipse([pad_x + 18, pad_y + 18, pad_x + 36, pad_y + 36], fill=(45, 212, 191))
    try:
        font_pill = ImageFont.truetype("C:\\Windows\\Fonts\\segoeui.ttf", 18)
    except OSError:
        font_pill = ImageFont.load_default()
    d.text((pad_x + 48, pad_y + 14), "9,2 detik rata-rata", fill=(196, 181, 253), font=font_pill)

    # Headline
    try:
        font_h1 = ImageFont.truetype("C:\\Windows\\Fonts\\segoeuib.ttf", 80)
        font_h2 = ImageFont.truetype("C:\\Windows\\Fonts\\segoeuib.ttf", 80)
        font_body = ImageFont.truetype("C:\\Windows\\Fonts\\segoeui.ttf", 26)
        font_chip = ImageFont.truetype("C:\\Windows\\Fonts\\segoeui.ttf", 20)
    except OSError:
        font_h1 = font_h2 = font_body = font_chip = ImageFont.load_default()

    d.text((80, 460), "Top up game", fill=INK, font=font_h1)
    # gradient text "instan, tanpa drama." — fake by drawing both colors via layered text
    # We'll just draw it in light violet
    d.text((80, 555), "instan, tanpa drama.", fill=(196, 181, 253), font=font_h2)

    return img


make_og().save(os.path.join(OUT, "og-image.png"), format="PNG", optimize=True)
print("Generated favicon.ico, icon.png, og-image.png")
