# BUSHIDO BLITZ — Asset Spec

Everything the game needs beyond the character sprites. Use this as a
shopping list for CraftPix, itch.io, or your own art. All pixel art,
all the same visual family as the Shinobi character pack.

---

## Character sprites (you already have these)

| Format | Horizontal PNG strip, frames left→right |
|---|---|
| Frame size | 128 × 128 px |
| Color mode | RGBA (transparent background) |
| Style | Pixel art, nearest-neighbor scaling (no smoothing) |

Animations needed per character (3 characters total):

| Animation | Frames | Looping |
|---|---|---|
| Idle | 6 | yes |
| Idle 2 | 8 | yes |
| Walk | 8 | yes |
| Run | 8 | yes |
| Run+Attack | 8 | no |
| Jump | 8 | no |
| Attack 1 | 4 | no |
| Attack 2 | 4 | no |
| Hurt | 3 | no |
| Dead | 4 | no |

---

## Backgrounds (1 per stage — 4 total)

These sit behind the fight as a wide parallax-scrollable image, or as a
static backdrop rendered on a Three.js plane behind the arena.

| Property | Spec |
|---|---|
| Size | 1024 × 512 px (or 2048 × 512 for parallax scroll) |
| Format | PNG, no transparency needed |
| Style | Pixel art, matching the character resolution (~1px = 1px at native) |
| Perspective | Side-view, like a stage backdrop in Street Fighter or FOOTSIES |

### The 4 stages

**1. Courtyard** — a stone-floored Japanese courtyard. Wooden dojo walls
in the background, maybe a torii gate or sliding shoji screens. Warm
daylight, muted earth tones. This is the "default" neutral stage.

**2. Red Dusk** — same kind of scene but at sunset. The sky is deep
orange-red, long shadows on the ground, silhouetted trees or rooftops.
Dramatic, tense mood.

**3. Bamboo** — a bamboo forest clearing. Dense green bamboo stalks fill
the background, dappled light coming through. Ground is packed earth
with some fallen leaves.

**4. Cold Moon** — nighttime. A courtyard or bridge under a full moon.
Blue-grey tones, lanterns providing warm spots of light. Snow on the
ground is optional but nice.

### Where to find these on CraftPix

Search for "pixel art game background japanese" or "pixel art dojo
background". Relevant free/paid packs:
- "Free Pixel Art Japanese City" backgrounds
- "2D Pixel Art Samurai Game Backgrounds"
- Any parallax background pack that has a Japanese/feudal theme

If a pack gives you layered parallax strips (sky, far buildings, near
buildings, ground), even better — you can stack them on separate Three.js
planes at different Z depths for a parallax effect as the camera pans.

---

## Ground / floor strip

The fighters stand on this. Currently it's a flat Three.js plane with a
solid color. A textured ground strip makes it feel real.

| Property | Spec |
|---|---|
| Size | 1024 × 128 px (tileable horizontally) |
| Format | PNG, no transparency needed |
| Style | Pixel art, top-down angle showing the floor surface |
| Tile | Must tile seamlessly left→right |

Content: stone tiles, wooden dojo floor, packed earth, or snow — one per
stage, or one neutral stone floor that works everywhere.

On CraftPix, search "pixel art tileset ground" or "pixel art floor tiles
japanese". Many tilesets include ground strips.

---

## Hit / impact effects

Small animated bursts that play at the point of contact when a strike
lands, a parry triggers, or a block happens. These sell the combat.

| Property | Spec |
|---|---|
| Frame size | 64 × 64 px |
| Format | Horizontal PNG strip, RGBA transparent |
| Frames | 4–6 per effect |
| Looping | No — plays once and disappears |

### Effects needed

| Effect | Visual | When it plays |
|---|---|---|
| Hit spark | White/yellow slash lines radiating out | A strike connects (damage dealt) |
| Heavy hit | Bigger, more intense version of hit spark | Heavy attack connects |
| Parry flash | Bright white/blue circular burst | Perfect parry triggers |
| Block clang | Small metallic spark, more contained | Shield blocks (not perfect parry) |
| Dust puff | Small brown/grey cloud at feet | Landing from a jump, starting a run, lunge |

On CraftPix, search "pixel art hit effect sprites" or "pixel art VFX
sprites". Packs like "Free Pixel Art Effect Sprites" usually include
slash, impact, and dust effects in one set.

---

## UI elements (optional — CSS handles these now)

The HUD (health bars, parry pips, round pips) is currently pure CSS and
looks clean. You only need art assets here if you want a more stylized,
illustrated UI. If you do:

| Element | Spec |
|---|---|
| Health bar frame | 256 × 32 px, PNG with transparency. A decorative border that the CSS fill bar sits inside. |
| Health bar fill | 256 × 32 px, tileable or stretchable. The actual colored bar. |
| Parry pip (full) | 24 × 24 px | 
| Parry pip (empty) | 24 × 24 px |
| Round pip (won) | 24 × 24 px |
| Round pip (empty) | 24 × 24 px |
| Portrait frame | 96 × 96 px, decorative border for character select + HUD |

On CraftPix: "pixel art game UI" or "pixel art health bar". Many free
UI packs exist. But honestly, the CSS version looks good — skip this
unless you specifically want illustrated UI.

---

## Screen backgrounds (optional)

The title, character select, stage select, and result screens currently
use a dark vignette over the 3D scene. If you want dedicated art:

| Screen | Spec |
|---|---|
| Title screen | 1920 × 1080 px, a dramatic scene (two silhouettes facing off, swords drawn). The title text overlays this. |
| Character select | 1920 × 1080 px, a neutral dojo interior or scroll-like parchment background. |
| Result screen | Could reuse the title art with a color tint. |

These are big pieces and totally optional. The current dark-overlay style
works well for a fighting game — Street Fighter and FOOTSIES both do it.

---

## Audio (not pixel art, but you'll need these)

| Sound | Format | Duration | Notes |
|---|---|---|---|
| Light hit | WAV or MP3 | 0.1–0.3s | Short, sharp sword impact |
| Heavy hit | WAV or MP3 | 0.2–0.4s | Meatier, more bass |
| Parry | WAV or MP3 | 0.2–0.3s | Metallic clang, higher pitch, satisfying |
| Block | WAV or MP3 | 0.1–0.2s | Duller clang than parry |
| Whiff | WAV or MP3 | 0.1–0.2s | Sword cutting air (swoosh) |
| KO | WAV or MP3 | 0.3–0.5s | Body hitting ground |
| Jump | WAV or MP3 | 0.1s | Light whoosh |
| Footsteps (run) | WAV or MP3 | 0.1s | Loopable or a set of 3–4 variants |
| Round start ("Fight!") | WAV or MP3 | 0.5–1s | Announcer or gong |
| Round win | WAV or MP3 | 1–2s | Short victorious sting |
| Menu select | WAV or MP3 | 0.05–0.1s | Click / tap confirmation |
| BGM — fight | OGG or MP3 | 60–120s | Loopable, tense, Japanese-flavored |
| BGM — menu | OGG or MP3 | 60–120s | Loopable, calmer, sets the mood |

On CraftPix audio is limited. For sounds try:
- **freesound.org** — search "sword clash", "katana hit", "fighting game"
- **opengameart.org** — search "combat sounds", "japanese music"
- **itch.io** — search "pixel art SFX pack" or "fighting game sound effects"

---

## Priority order (what to get first)

1. **Backgrounds (4 stages)** — biggest visual upgrade for the least work
2. **Hit effects** — makes combat feel 10× better instantly
3. **Ground strip** — replaces the flat color floor
4. **Audio (SFX first, then BGM)** — sound sells the hits
5. **UI art** — only if the CSS version isn't enough
6. **Screen backgrounds** — last, lowest impact

---

## Folder structure once you have everything

```
assets/
  characters/
    ronin/
      Idle.png          (768 × 128, 6 frames)
      Walk.png          (1024 × 128, 8 frames)
      Run.png           (1024 × 128, 8 frames)
      Attack_1.png      (512 × 128, 4 frames)
      Attack_2.png      (512 × 128, 4 frames)
      ...
    reaper/
      (same set)
    kaito/
      (same set)
  backgrounds/
    courtyard.png       (1024 × 512 or wider for parallax)
    red_dusk.png
    bamboo.png
    cold_moon.png
  ground/
    stone.png           (1024 × 128, tileable)
  effects/
    hit_spark.png       (256–384 × 64, 4–6 frames)
    heavy_hit.png
    parry_flash.png
    block_clang.png
    dust_puff.png
  audio/
    sfx/
      hit_light.wav
      hit_heavy.wav
      parry.wav
      block.wav
      whiff.wav
      ko.wav
      jump.wav
      fight.wav
      round_win.wav
      menu_select.wav
    bgm/
      fight.ogg
      menu.ogg
  ui/                   (optional)
    hp_frame.png
    hp_fill.png
    ...
```

This structure matches what the game code expects. The `SPRITE_BASE`
variable in the game points to the characters folder, and backgrounds /
effects get loaded separately when you wire them in.
