"""Build three transparent Tori GIFs from the 3x3 source character sheet."""

from __future__ import annotations

from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "tori-three-action-sheet.png"
OUTPUT = ROOT / "assets"
CANVAS_SIZE = 520

# The generated source is visually arranged as three rows of three poses. These
# boxes avoid neighboring poses while leaving room for the leaf-shaped ears.
CROPS = (
    (0, 0, 445, 465), (435, 0, 875, 465), (855, 0, 1300, 465),
    (0, 445, 445, 875), (425, 445, 875, 875), (855, 445, 1300, 875),
    (0, 855, 445, 1210), (425, 840, 875, 1210), (855, 855, 1300, 1210),
)


def keep_character_only(image: Image.Image) -> Image.Image:
    """Remove disconnected generation speckles while preserving soft edges."""
    rgba = image.convert("RGBA")
    alpha = np.asarray(rgba.getchannel("A"))
    solid = alpha > 12
    height, width = solid.shape
    visited = np.zeros_like(solid, dtype=bool)
    largest: list[tuple[int, int]] = []

    for y in range(height):
        for x in range(width):
            if not solid[y, x] or visited[y, x]:
                continue
            component: list[tuple[int, int]] = []
            queue = deque([(y, x)])
            visited[y, x] = True
            while queue:
                cy, cx = queue.popleft()
                component.append((cy, cx))
                for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
                    if 0 <= ny < height and 0 <= nx < width and solid[ny, nx] and not visited[ny, nx]:
                        visited[ny, nx] = True
                        queue.append((ny, nx))
            if len(component) > len(largest):
                largest = component

    main_mask = np.zeros_like(alpha, dtype=np.uint8)
    if largest:
        ys, xs = zip(*largest)
        main_mask[np.asarray(ys), np.asarray(xs)] = 255

    # Re-include the antialiased fringe immediately around the solid body.
    expanded = Image.fromarray(main_mask, mode="L").filter(ImageFilter.MaxFilter(7))
    expanded_array = np.asarray(expanded) > 0
    cleaned_alpha = np.where(expanded_array, alpha, 0).astype(np.uint8)
    rgba.putalpha(Image.fromarray(cleaned_alpha, mode="L"))
    return rgba


def gif_palette_frame(frame: Image.Image) -> Image.Image:
    """Reserve palette index 255 for GIF transparency."""
    rgb = frame.convert("RGB")
    paletted = rgb.quantize(colors=255, method=Image.Quantize.MEDIANCUT)
    transparent = frame.getchannel("A").point(lambda value: 255 if value < 96 else 0)
    paletted.paste(255, mask=transparent)
    paletted.info["transparency"] = 255
    paletted.info["disposal"] = 2
    return paletted


def main() -> None:
    sheet = Image.open(SOURCE).convert("RGBA")
    characters: list[Image.Image] = []
    for crop_box in CROPS:
        cleaned = keep_character_only(sheet.crop(crop_box))
        bbox = cleaned.getchannel("A").getbbox()
        if not bbox:
            raise RuntimeError(f"No character pixels found in crop {crop_box}")
        characters.append(cleaned.crop(bbox))

    max_width = max(character.width for character in characters)
    max_height = max(character.height for character in characters)
    scale = min(470 / max_width, 470 / max_height)

    frames: list[Image.Image] = []
    for character in characters:
        size = (round(character.width * scale), round(character.height * scale))
        resized = character.resize(size, Image.Resampling.LANCZOS)
        canvas = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
        x = (CANVAS_SIZE - resized.width) // 2
        y = CANVAS_SIZE - resized.height - 20
        canvas.alpha_composite(resized, (x, y))
        frames.append(canvas)

    actions = (
        ("tori-ready.gif", frames[0:3], [420, 240, 340]),
        ("tori-walk.gif", frames[3:6], [180, 180, 180]),
        ("tori-jump.gif", frames[6:9], [260, 300, 340]),
    )
    for filename, action_frames, durations in actions:
        gif_frames = [gif_palette_frame(frame) for frame in action_frames]
        gif_frames[0].save(
            OUTPUT / filename,
            save_all=True,
            append_images=gif_frames[1:],
            duration=durations,
            loop=0,
            transparency=255,
            disposal=2,
            optimize=False,
        )


if __name__ == "__main__":
    main()
