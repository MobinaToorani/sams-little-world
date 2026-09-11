# Sam's Little World

A tiny handmade world made to remember Sam, a very sweet tuxedo cat who
loved boxes, Swiss Chalet chicken, his sister Stella, and his family.

Made for **Clara & the Kemperman family**.

---

## What it is

A small cosy room you can potter around in for about five minutes.

- **A title screen.** Sam sits beside his name and blinks at you.
- **One room**, drawn as hand-authored pixel art: a sunny window, framed
  photos, a garland, a dresser with a drawer left open, a snack cupboard,
  a cardboard box, a food bowl next to a Swiss Chalet takeout box, Stella
  asleep on her cushion, and a blanket on the floor.
- **Sam lives in it.** He is not controlled by the player. He wanders, sits,
  loafs, stretches, blinks, naps, sometimes leaves the room entirely and comes
  back a little later. If you touch something he cares about, he ambles over:
  the box, the bowl, Stella's cushion.
- **Eight memories** hidden in the objects. Each one opens a paper card with a
  line or two and real photographs taped to it. Poke the same object again and
  you get a different, quieter line.
- **A quiet moment** after five memories: the room dims, Sam walks to the front
  and sits down with you.
- **A secret ending** once all eight are found. The window opens onto a
  rooftop at night, Sam under the stars, Clara's own words, and a place to
  leave him a note.

Notes are stored in `localStorage` on that one device. Nothing is uploaded,
there is no account, no backend, no tracking.

**Accessibility:** every object is a real focusable button with a label, arrow
keys and Tab move between them, Escape closes a card, focus rings are visible,
photos have alt text, and `prefers-reduced-motion` slows the world right down
and turns off the drifting dust.

**Responsive:** the CSS is written mobile-first. The base rules describe a
phone, and larger screens are enhancements layered on with `min-width`
queries. The room is capped by the height actually available (`--room-max`),
so a phone held sideways still shows the room and its HUD together without
scrolling. Safe-area insets are respected on notched phones, `100svh` avoids
the address-bar jump, every tap target clears 44px, hover labels only appear
where there is a real pointer, and the note box uses 16px text so iOS does not
zoom when you tap it.

**Sound** is off until you turn it on, and it is a small ambient chord
synthesised in the browser. No audio files, nothing licensed from anyone.

---

## Running it

```bash
npm install
npm run dev
```

Then open the address it prints (usually <http://localhost:5173>).

```bash
npm run build     # production build into dist/
npm run preview   # check the production build locally
```

---

## Changing what Sam says

**Everything Sam shows is in one file:**

### `src/data/memories.ts`

Each memory looks like this:

```ts
{
  id: 'box',
  title: 'the box',
  icon: 'box',
  samReaction: 'box',
  lines: [
    'Sam has discovered the box.',
    'Of course he chose the box.',
    'Sam loved being in boxes.',
  ],
  encore: [           // shown if you poke it a second time
    'Sam has claimed the box.',
    'Please respect his privacy.',
  ],
  photos: [ /* see below */ ],
}
```

- `lines` are revealed **one at a time**, with a pause between them. 
- `encore` is optional.
- `icon` picks the little glyph in the collection strip:
  `box | bowl | bag | drawer | cat | frame | heart | blanket`.
- `samReaction` is where Sam wanders when you touch that object:
  `box | bowl | stella | blanket | lookUp | cupboard | come`.

The same file also holds:

| What | Constant |
|---|---|
| The title screen wording | `TITLE` |
| The quiet "sweet boy" moment | `QUIET_MOMENT` |
| "You found them all." | `ALL_FOUND` |
| The ending, and Clara's wish | `ENDING` |
| **Clara's letter** | `LETTER` |
| The wording around the note box | `NOTES` |

> Clara's letter and the quoted lines marked `-- Clara` are her own words,
> reproduced as she wrote them. They are the most personal thing in here, so
> the letter is deliberately tucked behind a **read it** button so it is never
> thrust at anyone. 

---

## Photos

Photos live in **`public/photos/`** and are referenced by filename only:

```ts
photos: [
  {
    src: 'clara-hugging-sam.jpg',        // the file in public/photos/
    alt: 'Clara lying on a bed with her cheek against Sam.',
    caption: 'his person',               // the handwriting under the polaroid
  },
]
```

**To swap a photo:** drop the new file into `public/photos/` and change `src`.
That is the whole job.

If a photo is missing, that polaroid simply does not appear. Nothing breaks,
no broken-image icon. So you can add them as you find them.

**To keep the site fast** (optional, since big camera photos work fine, just
slower): put the full-size originals in `photos-original/` and run

```bash
npm run photos      # needs: pip install Pillow
```

which resizes everything to 1200px and writes it into `public/photos/`.

### Which photo appears where

All the photos are in. This is just a map, for when you want to swap one out.

| Memory | Photos |
|---|---|
| the box | `the-actual-box`, `sexy-boy-sam` |
| swiss chalet | `hand-jail` |
| the cupboard | `snack-cupboard` |
| the drawer | `loafing-in-drawer`, `on-the-shoes` |
| stella | `sleeping-with-stella`, `sam-and-stella-couch`, `cuddling-his-sister` |
| the family | `mom-and-sam`, `dad-and-sam`, `resting-on-moms-lap`, `puzzle-helper` |
| clara | `clara-hugging-sam`, `good-boy-with-clara`, `clara-squeezing-him` |
| the loaf | `burrito`, `belly`, `getting-all-the-lve`, `cuddlinghand` |
| the ending | `resting-on-claras-lap` |

`the-actual-box.jpg` is only 237x247, so it looks a little soft next to the
others. If the full-resolution original turns up, drop it in
`photos-original/`, run `npm run photos`, and push.

---

## How it is put together

```
src/
  data/
    memories.ts     <- ALL the words and photos. Start here.
    palette.ts      <- every colour in the room
    icons.ts        <- 9x9 glyphs for the memory strip
  game/
    sprites.ts      <- Sam and Stella, hand-drawn as 18x20 character grids
    room.ts         <- the room, drawn once into an offscreen canvas
    draw.ts         <- Sam, Stella, dust, highlights, the night scene
    samBrain.ts     <- what Sam decides to do next
    layout.ts       <- room geometry and where each object sits
    pixel.ts        <- small drawing helpers
  components/       <- title, room, memory card, HUD, night scene, letter, notes
  styles/global.css
  App.tsx           <- which screen you are on, and what has been found
```

The sprites are literal pixel grids you can edit by hand:

```ts
sit: [
  '...K.........K....',
  '..KKK.......KKK...',
  '.KKrKK.....KKrKK..',
  ...
]
```

`K` is his black fur, `W` his white, `E` an eye, `r` the inside of an ear.
The key is `SPRITE_PALETTE` at the top of `src/game/sprites.ts`. Every row
must stay 18 characters wide.

Only Sam, Stella, the dust and the highlights are redrawn each frame; the room
itself is drawn once and reused, so it stays smooth on an old phone.
