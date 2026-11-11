# Drawing Style Guidelines for The DaC Catalog

This document defines the architectural drawing conventions, lineweights, scales, and styling standards for all details and constructs authored in `dac-catalog`.

---

## 1. Lineweight Hierarchy (`strokeWidth`)

In DaC, `strokeWidth` represents **annotative points** (1/72 inch on paper). The renderer automatically normalizes line thicknesses by drawing scale (`((strokeWidth / 72) / scaleMultiplier)`), ensuring lineweights remain visually constant across all viewports and sheet outputs.

All details and constructs should adhere to this 5-tier integer hierarchy:

| Level | `strokeWidth` | Drafting Purpose | Examples in DaC Details |
|---|---|---|---|
| **Fine / Thin** | `1.0` | Hatches, material textures, annotations, membranes, light fasteners, background/beyond lines, break lines | `TimberCross` hatch diagonals, soil/gravel/insulation hatches, dimension & leader lines, centerlines, hidden/dashed lines, 16d/8d nails, sill gasket, vapor barrier, building wrap, flashing, drip edge, framing edges beyond, break lines (`breakline`) |
| **Medium (Default)** | `2.0` | Cut wood/light-gauge framing, sheet goods, finishes, structural hardware | Studs, top/bottom/sill plates (`wood-section`), floor/rim joists, rafters, blocking, subfloor/wall sheathing, drywall, siding, stucco, trim, anchor bolts, joist hangers, hold-downs |
| **Heavy / Cut** | `3.0` | Primary masonry/concrete section cuts and site grade lines | Foundation stem walls, spread footings, turned-down slab edges, slab-on-grade cuts, CMU/masonry cuts, finish grade / ground line, primary envelope cut |
| **Bold / Reinforcement** | `4.0` | Embedded reinforcing steel and heavy structural steel profiles | Longitudinal rebar & hooks (`rebar-longitudinal`), stirrups, column ties, welded wire fabric, steel beams/angles/weld plates |
| **Extra Heavy** | `5.0` | Sheet-level borders & major callouts | — |

> [!NOTE]
> - **Fill-only shapes**: Solid filled elements without outlines (such as `rebar-section` dots or masking polygons) use `strokeWidth: 0`.
> - **Constructs**: Constructs (`scale: "1:1"`) inherit the parent detail's scale when embedded, so author construct `strokeWidth` values directly in these paper-point tiers.

---

## 2. Standard Scales for Details & Constructs

DaC models geometry in real-world units of **inches** (`1.0 = 1 inch`). Every document defines its drawing scale via the `scale` property, which maps model inches to paper inches:

| Scale String | Architectural Label | Paper Ratio | Standard Application |
|---|---|---|---|
| `"1:1"` | Full Scale | `1.0` | **Constructs** (reusable parametric parts: nominal lumber sections, clips, brackets, custom joinery) |
| `"3=1-0"` | `3" = 1'-0"` | `1:4` (`0.25`) | **Close-Up Connection Details** (sill plate to foundation, joist hangers, flashing, weep holes) |
| `"1-1/2=1-0"` | `1-1/2" = 1'-0"` | `1:8` (`0.125`) | **Framing Assembly Details** (floor-to-wall assemblies, roof eave/soffit, window head/sill/jamb) |
| `"1=1-0"` | `1" = 1'-0"` | `1:12` (`0.0833`) | **Partial Wall Sections & Stair Conditions** (multi-story wall envelopes, stair stringers/treads, millwork runs) |
| `"3/4=1-0"` | `3/4" = 1'-0"` | `1:16` (`0.0625`) | **Large Building Sections** (floor-to-floor overview sections) |

### Scale Selection Defaults:
- **Constructs**: Always use `"1:1"`.
- **Standard Details**: Default to `"1-1/2=1-0"` for multi-member assemblies and `"3=1-0"` for close-up connection conditions.

---

## 3. Color & Fill Policy

- **No colors by default**:
  - Do not hardcode custom hex colors for geometry outlines or strokes.
  - Omit `color` or set `"color": "auto"`. This allows the theme engine (`BlueprintTheme` vs. `PaperTheme`) to automatically manage stroke contrast (`var(--cad-stroke)`).
  - Omit `fill` or set `"fill": "none"`.
- **Material Differentiation**:
  - Differentiate materials through standard architectural **hatching patterns** rather than colored fills:
    - `hatch: "TimberCross"`: Cross-cut nominal lumber.
    - `hatch: "Concrete"`: Cast-in-place concrete footings, stem walls, and slabs.

---

## 4. Coordinate System & Reference Datums

- **Cartesian Coordinates**: DaC uses standard CAD Cartesian coordinates where **`+X` is to the right** and **`+Y` is up**. The renderer automatically handles Cartesian-to-SVG inverted Y translation.
- **Reference Origin `(0, 0)` Strategy**:
  - Position `(0, 0)` at a meaningful, repeatable architectural datum:
    - **Foundation Details**: Top of foundation concrete / underside of sill plate.
    - **Floor & Wall Details**: Top of subfloor or top of double top plate.
    - **Constructs**: Primary insertion or bearing point (typically the bottom-left corner `(0, 0)`).

---

## 5. Annotations & Dimensions

- **Dimensions**:
  - `offset`: Default `20` to `24` paper points from the measured geometry.
  - `fontSize`: Standard `11` pt.
  - `format`: Set `"format": "architectural"` for standard feet-and-inches notation (e.g., `3'-6"`), or `"decimal"` where fractional decimals are preferred.
- **Leaders & Text**:
  - Leader line `strokeWidth`: `1.0` pt.
  - `fontSize`: Standard `11` pt.
  - Use parametric expressions for centered labels (e.g., `"{parameters.lumberSize.width} / 2"`).
