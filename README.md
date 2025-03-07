# Demon Valuation Agent

A sophisticated real estate valuation platform featuring interactive heatmaps, market analysis, and AI-driven insights.

## Features

- **Interactive Map Visualization**
  - Property heatmaps with multiple data layers
  - Cluster analysis and market patterns
  - Real-time property selection and filtering

- **Market Analysis**
  - AI-powered value predictions
  - Cluster-based market comparisons
  - Outlier detection and analysis

- **Report Generation**
  - Multi-format export (PDF, CSV, JSON, XML)
  - Customizable report components
  - Performance-optimized for large datasets

- **Data Integration**
  - NARRPR data synchronization
  - Automated geocoding
  - Data integrity validation

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/demon-valuation-agent.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── components/           # React components
│   ├── MapView/         # Map visualization
│   ├── reports/         # Report generation
│   └── training/        # Training modules
├── lib/                 # Core utilities
│   ├── clustering.ts    # Clustering algorithms
│   ├── heatmap.ts      # Heatmap calculations
│   ├── ml.ts           # Machine learning utilities
│   └── narrpr/         # NARRPR integration
├── context/            # React context providers
└── types/              # TypeScript definitions
```

## Environment Setup

Create a `.env` file with the following variables:
```
VITE_MAPBOX_TOKEN=your_mapbox_token
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

## Development Workflow

1. Create feature branches from `main`
2. Follow conventional commits
3. Submit PRs with detailed descriptions
4. Ensure tests pass before merging

## Testing

Run the test suite:
```bash
npm run test
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - See LICENSE file for details