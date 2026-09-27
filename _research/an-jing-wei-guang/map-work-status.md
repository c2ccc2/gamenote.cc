# Region map work — 2026-09-27

Implemented: three independently viewable crops from approved local video frames,
with paired Chinese/English titles, original creator watermark, source-frame links,
and an explicit partial-exploration label. No invented rooms, routes, or collectibles.

| Region | Source | Crop rectangle (x, y, width, height) |
| --- | --- | --- |
| The Bog | P2 12:45 | 100, 185, 480, 260 |
| Graven Valley | P4 04:50 | 240, 95, 225, 185 |
| The Docks | P6 13:10 | 0, 65, 525, 360 |

Editable configuration: `content/games/an-jing-wei-guang/map-crops.json`.
Generator: `scripts/lib/classic-map-crops.cjs`; runs with the regular build.
The original WebP files remain unchanged. Generated SVGs embed unchanged source
pixels and use clipping paths to show the selected rectangle. They are not redraws.
Only one SVG root is emitted so Live Server's reload-script injection does not
corrupt the response length when previewing these maps on port 5500.

## Remaining full-world work

The existing world SVG and its 16 regional views remain editorial relationship
diagrams, not room maps. The complete world redraw has not been delivered.

Reference inspected: https://www.gamerguides.com/well-dweller/maps/the-kingdom
The public page identifies map 502 with a 20000 × 20000 source coordinate system,
seven zoom levels, and two layers: Full Map (805), Rooms Map (806). A complete
redraw needs actual room geometry, region boundaries, and border connections
checked against the footage; the region list alone is insufficient.

Do not label the three video crops as a full regional map, and do not simply
repackage another guide's map tiles as a GAME NOTE original redraw. Preserve
reference attribution and distinguish geographic geometry from route sequence.
