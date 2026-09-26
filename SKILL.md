---
name: baran-album-shelf
description: "Build a 3D interactive bookshelf where each 'book' is a personal photo/video album shared between me and Baran. Each volume represents a chapter of memories — a moment, a trip, a season, or a person — rendered with Three.js r165 and the full carousel, inspection, and page-turn system from the verified bookshelf source."
---

# Baran Album Shelf

## Description

یه قفسه‌ی کتاب سه‌بعدی که هر کتاب یه آلبوم خاطره‌ست — از عکس‌ها و ویدیوهای من و باران.
هر جلد، یه فصل از زندگیمونه. وقتی روی یه کتاب کلیک می‌کنی، صفحه‌هاش باز می‌شن و عکس‌ها و ویدیوها داخلشه.

A seven-volume (or more) interactive 3D bookshelf where each book is a personal photo/video album.
Clicking a volume opens it to reveal paginated photos and embedded videos for that chapter.

Recreate the complete authored bookshelf behavior — carousel, cover art, inspection, opening, and page-turn — but replace the static cover textures and inner page geometry with real photo thumbnails and video players.

## Concept

| جلد (Volume) | موضوع |
|---|---|
| ۱ | اولین روزها — شروع ما |
| ۲ | سفرها |
| ۳ | خونه و لحظه‌های آروم |
| ۴ | جشن‌ها و تولدها |
| ۵ | طبیعت‌گردی |
| ۶ | شبا و غروب‌ها |
| ۷ | باران — از نگاه من |

Each volume has:
- A **custom cover** — one of our photos as the cover artwork atlas crop
- **Inner pages** — a paginated gallery of photos; video pages use `<video>` or a canvas texture
- A **title and date range** on the spine

## Technologies

- React and TypeScript lifecycle host
- Three.js r165 with OrbitControls, RoomEnvironment, RoundedBoxGeometry, and RectAreaLightUniformsLib
- Seven album records, each with a cover photo crop and an ordered media list (images + videos)
- Procedural cloth, foil, photo-page geometry, PMREM room lighting, and carousel shelf motion
- Pointer selection, cover/page dragging, shelf/detail state transitions, orbit, pan, keyboard, and reduced motion
- Video texture rendering via `THREE.VideoTexture` for video pages

## Verified source material

- `complete-shelf/index.html — exact seven volumes, seven cover crops, and complete renderer`
- `src/shaders/bookshelf/bookshelfRenderer.js`
- `src/shaders/bookshelf/BookshelfScene.tsx`

Source revision: `6ef16625e670b0285bb689bdebffc1d728c6deb1`

## Implementation steps

1. Open every verified source file listed above and identify the renderer, host lifecycle, styles, and assets before editing.
2. Pin Three.js r165 and define seven album records — each with `title`, `dateRange`, `coverCrop`, and `mediaList: MediaItem[]`.
3. Each `MediaItem` is either `{ type: "photo", src: string }` or `{ type: "video", src: string, poster: string }`.
4. Transfer the complete room, shelf, lighting, book rig, cloth, foil, and page geometry from source.
5. Replace static atlas page textures with dynamic photo textures loaded from the album's `mediaList`.
6. For video pages: create a `<video>` element off-screen, use `THREE.VideoTexture`, and play/pause on page visibility.
7. Keep shelf selection, continuous navigation, inspection transitions, cover dragging, page turns, orbit, pan, and keyboard focus as one state machine.
8. Expose `onAlbumOpen(albumIndex)`, `onPageTurn(page, mediaItem)`, and `onModeChange(mode)` to the React host.
9. Retain responsive camera targets, context handling, reduced-motion behavior, render scheduling, and complete disposal — including video element cleanup.
10. Give the local component a sized, overflow-controlled parent and verify desktop, mobile, reduced-motion, and context-loss behavior.

## Asset handling

- **Cover photos**: Crop and embed as base64 or serve from `/public/albums/<id>/cover.jpg`
- **Album media**: Serve from `/public/albums/<id>/photos/` and `/public/albums/<id>/videos/`
- **Wood/room atlas**: Keep the original walnut texture from the bookshelf source exactly as authored
- No network CDN lookup required; all assets are locally owned

## Album data schema

```ts
interface MediaItem {
  type: "photo" | "video";
  src: string;       // path relative to /public
  poster?: string;   // required for video
  caption?: string;
}

interface Album {
  id: number;
  title: string;        // e.g. "اولین روزها"
  subtitle?: string;    // e.g. "شروع ما — پاییز ۱۴۰۲"
  coverCrop: CoverCrop; // UV rect into the cover atlas
  spineColor: string;   // hex
  media: MediaItem[];
}
```

## Local component example

```tsx
import { BookshelfScene } from "./effects/bookshelf/BookshelfScene";
import "./effects/bookshelf/styles.css";

export function BaranAlbum() {
  return (
    <div className="effect-frame">
      <BookshelfScene
        albums={BARAN_ALBUMS}
        onAlbumOpen={(idx) => console.log("Opened album", idx)}
        onPageTurn={(page, item) => console.log("Page", page, item)}
      />
    </div>
  );
}
```

## Core renderer pattern

This excerpt documents orchestration only. Copy the exact shader, geometry, pass, and interaction code from the verified source files.

```tsx
const renderer = createBookshelfRenderer(host, canvas, {
  albums: BARAN_ALBUMS,
  onReady: () => setReady(true),
  onSelectionChange: ({ index, total, title }) => setSelection({ index, total, title }),
  onModeChange: (mode) => setMode(mode),
  onPageTurn: (page, mediaItem) => setCurrentMedia(mediaItem),
});
await renderer.ready;
return () => renderer.dispose(); // also pauses and removes all video elements
```

## Behavior contract

- **Runtime**: Three.js r165
- **Passes**: 1 live scene render + PMREM environment bake
- **Interaction**: Shelf navigation, album selection, click-to-inspect, cover drag, paginated photo/video leaf drag, orbit, pan, and reset
- **Assets**: Cover photos (per-album), media files (photos + videos), walnut wood atlas
- **collection** (fixed): 7 authored albums (expandable)
- **environment** (precompute): PMREM room
- **interaction** (pointer): Inspect + cover + pages + video playback
- **pixelRatio** (adaptive): ≤ 2
- **video**: THREE.VideoTexture, play on page focus, pause on page leave, dispose on teardown

## Verification

1. Compare the rendered composition, animation timing, pointer behavior, and state transitions with the source bookshelf implementation.
2. Open each album and verify photos render correctly on page geometry at native resolution.
3. Flip to a video page — confirm the video plays, pauses on page-leave, and resumes on page-return.
4. Exercise resize, high-DPI, mobile/coarse-pointer, reduced-motion, tab visibility, and WebGL context-loss paths.
5. Confirm every animation frame, observer, listener, geometry, buffer, texture, video element, framebuffer, material, and renderer is released on teardown.
6. Check the browser console — no errors, no leaked resources.

## Guardrails

- Do not substitute a visually similar package, demo, shader, or runtime.
- Do not approximate, reconstruct, or simplify the authored GLSL, render passes, geometry, interaction state, or assets.
- Keep all seven albums; do not reduce the collection.
- Adapt only the surrounding host boundary and media-loading layer; keep renderer behavior intact.
- Never store private photos in version control — use `.gitignore` for `/public/albums/` and document the expected folder structure instead.
