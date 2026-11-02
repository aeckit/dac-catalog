# DaC Catalog

The official component gallery and architectural detail catalog for **Drawing-as-Code (DaC)** in the [aeckit](https://github.com/aeckit/dac) ecosystem.

Live Gallery: **[aeckit.github.io/dac-catalog](https://aeckit.github.io/dac-catalog/)**

## Features

- **Interactive Detail Sandbox**: Real-time 2D CAD viewer powered by SolidJS and `@aeckit/dac-solid`.
- **Dynamic Parameter Controls**: Tweak lumber sizes, spacings, and dimensions live with instant SVG recalculation.
- **Architectural Specs & Notes**: Integrated specification notes and metadata for every assembly.
- **One-Click Exports**:
  - **Copy JSON**: Ready to drop into the VS Code extension or web editor.
  - **Export SVG**: Clean vector drawings for reports or documentation.
  - **Open in Playground**: Deep-link any detail directly into the full playground editor.
- **Zero-Config Content Addition**: Drop a new `.json` file into `catalog/` and it automatically appears in the gallery!

## Adding a New Detail to the Catalog

Add a `.json` file directly into the flat `catalog/` directory:

```json
{
  "type": "CAD::Detail",
  "version": "1.0",
  "metadata": {
    "id": "my-detail-name",
    "title": "My Architectural Detail",
    "description": "Short summary of what this assembly represents.",
    "category": "Framing",
    "tags": ["timber", "residential", "framing"],
    "notes": [
      "Key specification note 1.",
      "Key specification note 2."
    ]
  },
  "scale": "1\"=1'-0\"",
  "parameters": { ... },
  "geometry": [ ... ]
}
```

## Development

```bash
# Install dependencies
npm install

# Start local dev server (http://localhost:5175)
npm run dev

# Build production bundle
npm run build
```

## Deployment

Deployments to **GitHub Pages** are fully automated via GitHub Actions on every push to the `main` branch.

## License

MIT © [aeckit](https://github.com/aeckit/dac)
