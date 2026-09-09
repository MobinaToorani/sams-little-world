/**
 * ---------------------------------------------------------------------------
 *  EVERYTHING SAM SAYS AND SHOWS LIVES IN THIS FILE.
 * ---------------------------------------------------------------------------
 *  To change a memory: edit `lines` (each string is revealed one at a time).
 *  To change a photo:   drop a jpg in `public/photos/` and put its filename
 *                       in `photos` below. A photo that is missing simply
 *                       does not appear -- nothing else breaks.
 *  To reorder or remove one: move or delete the whole block. The counter
 *  ("x / y memories") and the ending both follow this array automatically.
 *
 *  Quoted lines marked "-- Clara" are Clara's own words and are reproduced
 *  exactly as she wrote them. Please edit those only if she wants them changed.
 * ---------------------------------------------------------------------------
 */

export type Photo = {
  /** File inside public/photos/ */
  src: string;
  /** Alt text. Please keep this descriptive -- screen readers read it aloud. */
  alt: string;
  /** Handwritten caption on the polaroid. Keep it short. */
  caption?: string;
};

export type Memory = {
  id: string;
  /** Small label on the memory card. */
  title: string;
  /** Revealed one line at a time, with a beat in between. */
  lines: string[];
  /** Shown instead if the player comes back and pokes the same thing again. */
  encore?: string[];
  photos?: Photo[];
  /** Tiny glyph drawn in the collection strip once found. */
  icon: 'box' | 'bowl' | 'bag' | 'drawer' | 'cat' | 'frame' | 'heart' | 'blanket';
  /** What Sam does when you touch this object. See samBrain.ts */
  samReaction?: 'box' | 'bowl' | 'stella' | 'blanket' | 'lookUp' | 'cupboard' | 'come';
};

export const MEMORIES: Memory[] = [
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
    encore: [
      'Sam has claimed the box.',
      'Why buy a cat bed when there is a perfectly good box?',
      'Please respect his privacy.',
    ],
    photos: [
      {
        src: 'the-actual-box.jpg',
        alt: 'Sam sitting inside a small shallow box on a green puzzle mat, surrounded by puzzle pieces.',
        caption: 'the size of the box was never the point',
      },
      {
        src: 'sexy-boy-sam.jpg',
        alt: 'Sam lying on a kitchen table, looking straight at the camera.',
        caption: 'the face of a cat who owns the box',
      },
    ],
  },

  {
    id: 'chicken',
    title: 'swiss chalet',
    icon: 'bowl',
    samReaction: 'bowl',
    lines: [
      "Sam's weakness.",
      'Swiss Chalet chicken.',
      'Somehow, he always knew when it was around.',
    ],
    encore: [
      'Chicken skin, specifically.',
      'He would appear out of nowhere.',
      'Every single time.',
    ],
    photos: [
      {
        src: 'hand-jail.jpg',
        alt: 'Sam sitting on a dining table being gently held by two hands, with a red Swiss Chalet takeout box beside him.',
        caption: 'caught, mid-heist',
      },
    ],
  },

  {
    id: 'cupboard',
    title: 'the cupboard',
    icon: 'bag',
    samReaction: 'cupboard',
    lines: ['This is not where cats go.', 'Sam disagreed.', 'Sun chips. Oatmeal cookies.'],
    encore: [
      'Anything that crinkled, really.',
      'Plastic bags were, apparently, for chewing.',
    ],
    photos: [
      {
        src: 'snack-cupboard.jpg',
        alt: 'Sam sitting on a shelf inside an open kitchen cupboard, among jars, cereal boxes and bags of snacks.',
        caption: 'he lives here now',
      },
    ],
  },

  {
    id: 'drawer',
    title: 'the drawer',
    icon: 'drawer',
    samReaction: 'lookUp',
    lines: ['Technically not a box.', 'Close enough.', 'Somehow, every box became Sam’s box.'],
    encore: ['Drawers. Shoes. Laps.', 'If you put it down, it was his.'],
    photos: [
      {
        src: 'loafing-in-drawer.jpg',
        alt: 'Sam loafing inside an open white dresser drawer on a red plaid blanket, looking up.',
        caption: 'this is my drawer now',
      },
      {
        src: 'on-the-shoes.jpg',
        alt: 'Sam standing on a pair of shoes by the front door, looking up at the camera.',
        caption: 'also his',
      },
    ],
  },

  {
    id: 'stella',
    title: 'stella',
    icon: 'cat',
    samReaction: 'stella',
    lines: ['STELLA', 'Sam loved his sister very much.'],
    encore: [
      'They did a lot of napping together.',
      'Very important work.',
      '“I’ll take care of Stella for you.” -- Clara',
    ],
    photos: [
      {
        src: 'sleeping-with-stella.jpg',
        alt: 'Sam and his sister Stella curled up asleep on a bed with a floral duvet.',
        caption: 'Sam & Stella',
      },
      {
        src: 'sam-and-stella-couch.jpg',
        alt: 'Sam and Stella sitting side by side on a couch, both facing away, watching the room.',
        caption: 'supervising',
      },
      {
        src: 'cuddling-his-sister.jpg',
        alt: 'Sam and Stella curled together in a nest of blankets on the floor.',
        caption: 'one cat, two cats',
      },
    ],
  },

  {
    id: 'family',
    title: 'the family',
    icon: 'frame',
    samReaction: 'come',
    lines: ['The people Sam loved most.', 'He loved his family very much.'],
    encore: ['Every lap in the house was, technically, his.', 'Fifteen years of them.'],
    photos: [
      {
        src: 'mom-and-sam.jpg',
        alt: 'Sam sitting up against Mom on the couch by a bright window; both of them look very pleased about it.',
        caption: 'mom',
      },
      {
        src: 'dad-and-sam.jpg',
        alt: 'Dad, in a beanie and plaid jacket, holding Sam against his chest; Sam’s white paws hang over his arm.',
        caption: 'dad',
      },
      {
        src: 'resting-on-moms-lap.jpg',
        alt: 'Sam stretched out across a lap on a sunny living room couch.',
        caption: 'occupied',
      },
      {
        src: 'puzzle-helper.jpg',
        alt: 'Sam sitting on a green puzzle mat while someone works on a jigsaw around him.',
        caption: 'helping',
      },
    ],
  },

  {
    id: 'clara',
    title: 'clara',
    icon: 'heart',
    samReaction: 'come',
    lines: ['Sam had a very special person.', 'Clara.', 'He was loved so, so much.'],
    encore: [
      'She called him Bubba.',
      'Her emotional support cat. His emotional support human.',
      '“Thank you for being my person.” -- Clara',
    ],
    photos: [
      {
        src: 'clara-hugging-sam.jpg',
        alt: 'Clara lying on a bed with her cheek against Sam, both with their eyes closed.',
        caption: 'his person',
      },
      {
        src: 'good-boy-with-clara.jpg',
        alt: 'Clara holding Sam up in her arms by a sunny window; Sam looks calmly at the camera.',
        caption: 'good boy',
      },
      {
        src: 'clara-squeezing-him.jpg',
        alt: 'Clara hugging Sam close to her face in a kitchen, both looking very content.',
        caption: 'the squeeze',
      },
    ],
  },

  {
    id: 'blanket',
    title: 'the loaf',
    icon: 'blanket',
    samReaction: 'blanket',
    lines: ['Paws in. Eyes half shut.', 'The loaf.', 'He was very good at being a cat.'],
    encore: ['Sometimes he rolled over.', 'That was a privilege, not a right.'],
    photos: [
      {
        src: 'burrito.jpg',
        alt: 'Sam wrapped up in a white duvet with only his face and ears showing, eyes half closed.',
        caption: 'fully installed',
      },
      {
        src: 'belly.jpg',
        alt: 'Sam lying on his back by a door, showing his white belly, with a hand resting on it.',
        caption: 'a privilege',
      },
      {
        src: 'getting-all-the-lve.jpg',
        alt: 'Sam sprawled on a bed getting scratched, surrounded by stuffed animals.',
        caption: 'all of the love',
      },
      {
        src: 'cuddlinghand.jpg',
        alt: "Sam lying against someone's arm on a bed, one white paw resting on their wrist.",
        caption: 'a paw, placed deliberately',
      },
    ],
  },
];

/** Shown once the player has found most of the memories. */
export const QUIET_MOMENT = {
  triggerAfter: 5,
  lines: ['Sam was a very sweet boy.', 'He was loved.', 'He still is.'],
};

export const ALL_FOUND = {
  lines: ['You found them all.', 'Well... almost.'],
  hint: 'the window',
};

export const ENDING = {
  lines: [
    'Some cats leave paw prints.',
    'Some leave memories.',
    'Some leave a whole little world behind.',
  ],
  beat: ['Sam was here.', 'And he was loved.'],
  /** Clara's wish for him, in her words. */
  wish: {
    text:
      'I hope there are endless greenies, oatmeal cookies, cream, sun chips, ' +
      'chicken skin, boxes, plastic bags to chew on and squirrels for you to ' +
      'chase up there my love',
    by: 'Clara',
  },
  dedication: ['For Clara & the Kemperman family', 'Always.'],
  photo: {
    src: 'resting-on-claras-lap.jpg',
    alt: "Sam lying across Clara's lap in the evening, half asleep, while she smiles down at him.",
    caption: 'always',
  } satisfies Photo,
};

/**
 * What Clara wrote for Sam, reproduced as she wrote it.
 * It is tucked behind a button so nobody has it thrust at them.
 */
export const LETTER = {
  invite: 'Clara wrote this for him.',
  open: 'read it',
  close: 'fold it back up',
  signature: '-- Clara',
  paragraphs: [
    'My Sam💛 You are and forever will be my best friend. You were my emotional support cat as much as I was your emotional support human. You’ve been there for me through the past 15 years of my life. Through my mental health, every breakup, every day I was struggling with my IBS…You were by my side. (As in you would literally sit with me in the washroom) Thank you for being my person💛 You always knew how to cheer me up. There was never a day I didn’t smile and laugh at how so uniquely you you are. I’ll take care of Stella for you💛',
    'I love you Bubba 💛',
    'I hope there are endless greenies, oatmeal cookies, cream, sun chips, chicken skin, boxes, plastic bags to chew on and squirrels for you to chase up there my love💛',
    'Thank you for being you💛 I love you',
  ],
};

export const TITLE = {
  name: 'SAM',
  tagline: 'a little place for a very sweet boy',
  enter: 'enter',
  dedication: 'made with love for Clara & the Kemperman family',
};

export const NOTES = {
  prompt: 'Leave something for Sam',
  placeholder: "Write something you'd like Sam to know...",
  submit: 'pin it up',
  empty: 'The wall is empty. For now.',
};
