# ISLE Frontend

A modern, responsive frontend application for the ISLE (Intelligent Scientific Literature Explorer) system. Built with Next.js 15, TypeScript, and Tailwind CSS, providing an intuitive interface for exploring research papers through advanced analytics and interactive visualizations.

## 🚀 Overview

ISLE Frontend is a sophisticated web application that provides researchers and academics with powerful tools to discover, analyze, and visualize scientific papers. The application features advanced search capabilities, comprehensive analytics dashboards, interactive knowledge graphs, and detailed paper exploration tools.

### Key Features
- **Advanced Search Interface**: Multi-dimensional filtering with real-time suggestions
- **Comprehensive Analytics**: Statistical dashboards with interactive visualizations
- **Interactive Knowledge Graphs**: Dynamic network visualizations for research relationships
- **Word Cloud Visualizations**: Topic discovery through semantic word clouds
- **World Map Analytics**: Geographic distribution of research
- **Detailed Paper Exploration**: In-depth paper, author, and institution details
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

## ✨ Features

### 🔍 **Advanced Search & Filtering**
- **Semantic Search**: Natural language queries with intelligent suggestions
- **Multi-dimensional Filters**: Author, institution, country, and year-based filtering
- **Real-time Search**: Instant search results with loading states
- **Filter Combinations**: Complex AND/OR logic for precise filtering
- **Search History**: Recent searches and saved filters
- **Query Building**: Visual query builder with filter management

### 📊 **Analytics Dashboard**
- **Statistical Overview**: Comprehensive dataset statistics and metrics
- **Interactive Charts**: 
  - Pie charts for topic distribution
  - Line charts for publication trends over time
  - Bar charts for top entities (authors, countries, institutions)
  - World map for geographic research distribution
- **Topic Analysis**: Word clouds and topic evolution visualization
- **Ranking Systems**: Multiple ranking criteria (papers, citations, collaborations)
- **Export Capabilities**: Data export in multiple formats

### 🌐 **Knowledge Graph Visualization**
- **Network Types**:
  - Citation networks between papers
  - Author collaboration networks
  - Institution collaboration networks
  - Country collaboration networks
- **Interactive Controls**:
  - Zoom, pan, and selection tools
  - Node sizing and coloring options
  - Filter controls for network refinement
  - Export functionality for network data
- **Network Statistics**: Real-time network metrics and analysis
- **Node Details**: Comprehensive information about selected nodes

### 📝 **Word Cloud Visualization**
- **Topic Discovery**: Semantic word clouds for research topics
- **Interactive Elements**: Hover effects and tooltips
- **Customizable Display**: Color schemes and sizing options
- **Export Options**: Download word clouds as images
- **Responsive Design**: Adaptive sizing for different screen sizes

### 🗺️ **World Map Analytics**
- **Geographic Distribution**: Research activity by country
- **Interactive Map**: Clickable countries with detailed statistics
- **Multiple Metrics**: Papers count, citations, and collaboration data
- **Color Coding**: Visual representation of research intensity
- **Tooltips**: Detailed country information on hover

### 📋 **Detailed Information Panels**
- **Paper Details**: Complete paper information including abstracts, authors, citations
- **Author Profiles**: Author statistics, publications, and collaboration networks
- **Institution Information**: Institution details, research focus, and partnerships
- **Country Analytics**: Country-specific research statistics and trends
- **Topic Details**: Topic information, related papers, and evolution over time

## 🛠️ Technology Stack

### Core Framework
- **Next.js 15.5.3**: React framework with App Router
- **React 18.3.1**: Modern React with hooks and concurrent features
- **TypeScript 5.5.4**: Type-safe JavaScript development
- **Tailwind CSS 3.4.7**: Utility-first CSS framework

### Visualization Libraries
- **Recharts 2.12.7**: React-based charting library
- **Vis.js 9.1.13**: Network visualization library
- **D3.js 7.9.0**: Data visualization toolkit
- **D3-Cloud 1.2.7**: Word cloud generation
- **React Simple Maps 3.0.0**: World map visualization

### UI Components & Icons
- **Lucide React 0.424.0**: Modern icon library
- **React Select 5.8.0**: Advanced select components
- **Custom Components**: Tailored UI components for the application

### Development Tools
- **ESLint 8.57.0**: Code linting and quality assurance
- **PostCSS 8.4.40**: CSS processing
- **Autoprefixer 10.4.19**: CSS vendor prefixing
- **Node.js 20.19.5**: JavaScript runtime (managed via nvm)

## 📦 Installation & Setup

### Prerequisites
- **Node.js**: v20 or higher (recommended: v20.19.5)
- **npm**: v10 or higher
- **Backend API**: Running ISLE backend server
- **Memory**: 4GB+ RAM recommended
- **Storage**: 1GB+ free space

### Quick Start

1. **Clone and navigate to the frontend directory:**
   ```bash
   cd ISLE/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   BACKEND_URL=http://localhost:8000
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Access the application:**
   Open your browser and navigate to `http://localhost:3000`

### Alternative: Using the Node.js Version Manager Script
The project includes a custom script to ensure Node.js v20 compatibility:

```bash
# Use the provided script for guaranteed Node.js v20 compatibility
./start-with-node.sh npm run dev
./start-with-node.sh npm run build
./start-with-node.sh npm run start
```

## 🏗️ Project Structure

```
frontend/src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles and Tailwind imports
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Home page component
├── components/            # React components
│   ├── analytics/         # Analytics dashboard components
│   │   ├── ErrorBoundary.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── MostCitedPapers.tsx
│   │   ├── RankingsSection.tsx
│   │   ├── StatsSection.tsx
│   │   ├── TopicDistributionChart.tsx
│   │   ├── TrendsChart.tsx
│   │   ├── WordCloudsSection.tsx
│   │   └── worldMap/      # World map components
│   ├── knowledgeGraph/    # Knowledge graph components
│   │   ├── FilterPanel.tsx
│   │   ├── NetworkControls.tsx
│   │   ├── NetworkVisualization.tsx
│   │   └── ...
│   ├── search/           # Search interface components
│   │   ├── FilterPanel.tsx
│   │   ├── SearchInput.tsx
│   │   ├── filters/      # Individual filter components
│   │   └── ...
│   ├── sidePanel/        # Side panel components
│   │   ├── AuthorDetails.tsx
│   │   ├── PaperDetails.tsx
│   │   ├── InstitutionDetails.tsx
│   │   └── ...
│   ├── wordCloud/        # Word cloud components
│   │   ├── components/
│   │   ├── hooks/
│   │   └── ...
│   ├── AnalyticsDashboard.tsx
│   ├── GlobalSettings.tsx
│   ├── KnowledgeGraphSection.tsx
│   ├── SearchSection.tsx
│   ├── SidePanel.tsx
│   └── WordCloudVisualization.tsx
├── constants/            # Application constants
│   ├── analytics.ts
│   ├── knowledgeGraph.ts
│   ├── search.ts
│   └── worldMap.ts
├── contexts/            # React contexts
│   └── SettingsContext.tsx
├── hooks/              # Custom React hooks
│   ├── useAnalyticsDashboard.ts
│   ├── useFilters.ts
│   ├── useKnowledgeGraph.ts
│   ├── useNodeDetails.ts
│   └── useSearch.ts
├── lib/               # Utility libraries
│   └── api.ts         # API client and TypeScript interfaces
├── types/             # TypeScript type definitions
│   ├── analytics.ts
│   ├── knowledgeGraph.ts
│   ├── sidePanel.ts
│   └── worldMap.ts
└── utils/             # Utility functions
    ├── analyticsDataTransformers.ts
    ├── knowledgeGraph.ts
    ├── sidePanel.ts
    └── worldMapUtils.ts
```

## 🎯 Key Components

### SearchSection
**Location**: `src/components/SearchSection.tsx`

Advanced search interface with comprehensive filtering capabilities:
- **Search Input**: Natural language query input with suggestions
- **Filter Panel**: Multi-dimensional filtering options
- **Query Builder**: Visual query construction
- **Real-time Validation**: Input validation and error handling
- **Loading States**: User feedback during search operations

**Features**:
- Author, institution, country, and year range filtering
- Real-time search suggestions
- Filter combination logic
- Search history and saved queries
- Responsive design for all screen sizes

### AnalyticsDashboard
**Location**: `src/components/AnalyticsDashboard.tsx`

Comprehensive analytics dashboard with interactive visualizations:
- **Multi-tab Interface**: Overview, Trends, Word Clouds, Rankings, World Map
- **Statistical Cards**: Key metrics and statistics
- **Interactive Charts**: Recharts-based data visualizations
- **Export Functionality**: Data export in multiple formats
- **Responsive Layout**: Adaptive design for different screen sizes

**Tabs**:
- **Overview**: Basic statistics and key metrics
- **Trends**: Publication trends over time
- **Word Clouds**: Topic visualization
- **Rankings**: Top authors, institutions, countries
- **World Map**: Geographic distribution

### KnowledgeGraphSection
**Location**: `src/components/KnowledgeGraphSection.tsx`

Interactive network visualization system:
- **Network Types**: Citation, collaboration, and institutional networks
- **Interactive Controls**: Zoom, pan, selection, and filtering
- **Node Details**: Comprehensive node information
- **Export Options**: Network data export
- **Performance Optimization**: Efficient rendering for large networks

**Network Types**:
- **Complete Network**: Citation relationships between papers
- **Author Collaboration**: Author collaboration networks
- **Institution Collaboration**: Institutional partnership networks
- **Country Collaboration**: International collaboration patterns

### WordCloudVisualization
**Location**: `src/components/WordCloudVisualization.tsx`

Advanced word cloud generation and visualization:
- **D3.js Integration**: Custom word cloud implementation
- **Interactive Elements**: Hover effects and tooltips
- **Customizable Styling**: Color schemes and sizing options
- **Export Capabilities**: Image download functionality
- **Responsive Design**: Adaptive sizing for different screens

### SidePanel
**Location**: `src/components/SidePanel.tsx`

Detailed information panel for selected nodes:
- **Paper Details**: Complete paper information and metadata
- **Author Profiles**: Author statistics and collaboration data
- **Institution Information**: Institutional details and research focus
- **Country Analytics**: Country-specific research statistics
- **Topic Details**: Topic information and related papers

## 🔌 API Integration

### API Client
**Location**: `src/lib/api.ts`

Comprehensive TypeScript API client with full type safety:

```typescript
class ApiClient {
  // Core analysis endpoints
  async searchAndAnalyze(query: AnalysisQuery): Promise<AnalysisResult>
  async getNetworkData(query: NetworkQuery): Promise<NetworkData>
  
  // Node details and session management
  async getNodeDetails(sessionId: string, nodeId: string): Promise<NodeDetails>
  async getSessionData(sessionId: string): Promise<AnalysisResult>
  async deleteSession(sessionId: string): Promise<{ message: string }>
  
  // Health monitoring
  async healthCheck(): Promise<{ status: string; message: string }>
}
```

### TypeScript Interfaces
Complete type definitions for all API interactions:
- **Request Models**: `AnalysisQuery`, `NetworkQuery`, `PaperFilters`
- **Response Models**: `AnalysisResult`, `NetworkData`, `NodeDetails`
- **Data Models**: `DataStats`, `RankedEntity`, `GraphData`, `TopicTerms`

### Error Handling
Robust error handling with user-friendly messages:
- **Network Errors**: Connection timeout and retry logic
- **API Errors**: Detailed error messages from backend
- **Validation Errors**: Input validation feedback
- **Loading States**: User feedback during operations

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md)
- **Desktop**: > 1024px (lg)
- **Large Desktop**: > 1280px (xl)

### Mobile Optimization
- **Touch-friendly Interface**: Optimized for touch interactions
- **Responsive Navigation**: Collapsible navigation for mobile
- **Adaptive Layouts**: Components adapt to screen size
- **Performance**: Optimized for mobile performance

### Desktop Features
- **Multi-panel Layout**: Side panels and detailed views
- **Keyboard Shortcuts**: Power user features
- **Advanced Interactions**: Complex filtering and selection
- **High-resolution Displays**: Optimized for retina displays

## 🎨 Design System

### Color Palette
- **Primary**: Blue variants (#0ea5e9, #3b82f6, #6366f1)
- **Secondary**: Gray scale for text and backgrounds
- **Accent**: Green for success states (#10b981)
- **Warning**: Yellow for warnings (#f59e0b)
- **Error**: Red for errors (#ef4444)
- **Data Visualization**: Custom color schemes for charts

### Typography
- **Font Family**: Inter (Google Fonts)
- **Headings**: Font weights 600-800
- **Body Text**: Font weight 400
- **Code**: Monospace font for technical content
- **Responsive Sizing**: Fluid typography scales

### Component Design
- **Consistent Spacing**: 4px base unit system
- **Border Radius**: Consistent rounded corners
- **Shadows**: Subtle elevation system
- **Transitions**: Smooth animations and transitions
- **Loading States**: Skeleton screens and spinners

## 🔧 Build & Deployment

### Development Commands
```bash
npm run dev        # Start development server
npm run build      # Create production build
npm run start      # Start production server
npm run lint       # Run ESLint
```

### Build Process
- **TypeScript Compilation**: Full type checking
- **CSS Processing**: Tailwind CSS optimization
- **Code Splitting**: Automatic code splitting for performance
- **Static Optimization**: Next.js static optimization
- **Bundle Analysis**: Webpack bundle analysis

### Production Optimization
- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Route-based code splitting
- **Tree Shaking**: Dead code elimination
- **Minification**: CSS and JavaScript minification
- **Compression**: Gzip compression

### Environment Configuration
```env
# Development
NEXT_PUBLIC_API_URL=http://localhost:8000
BACKEND_URL=http://localhost:8000

# Production
NEXT_PUBLIC_API_URL=https://api.isle.local
BACKEND_URL=https://api.isle.local
```

## 🚀 Performance Optimization

### Code Splitting
- **Route-based Splitting**: Automatic code splitting by route
- **Component Lazy Loading**: Dynamic imports for heavy components
- **Library Splitting**: Separate chunks for large libraries

### Caching Strategy
- **Static Generation**: Pre-rendered static pages
- **API Caching**: Intelligent API response caching
- **Asset Caching**: Long-term caching for static assets
- **Service Worker**: Offline functionality (future enhancement)

### Bundle Optimization
- **Tree Shaking**: Remove unused code
- **Minification**: Compress JavaScript and CSS
- **Compression**: Gzip/Brotli compression
- **CDN Integration**: Content delivery network support

## 🧪 Testing

### Testing Framework
```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Testing Strategy
- **Unit Tests**: Component-level testing
- **Integration Tests**: API integration testing
- **Visual Regression**: Screenshot testing
- **Performance Tests**: Load time and bundle size testing

## 🔍 Browser Support

### Supported Browsers
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+
- **Mobile Safari**: 14+
- **Chrome Mobile**: 90+

### Feature Detection
- **Progressive Enhancement**: Graceful degradation for older browsers
- **Polyfills**: Automatic polyfill injection for missing features
- **Responsive Images**: Adaptive image loading

## 🐛 Troubleshooting

### Common Issues

#### Node.js Version Compatibility
**Issue**: Project requires Node.js v20+
**Solution**: Use the provided `start-with-node.sh` script or upgrade Node.js

#### API Connection Issues
**Issue**: Cannot connect to backend API
**Solution**: 
1. Verify backend server is running
2. Check `NEXT_PUBLIC_API_URL` configuration
3. Ensure CORS settings allow frontend origin

#### Build Errors
**Issue**: TypeScript or build errors
**Solution**:
1. Clear `.next` directory: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check TypeScript configuration

#### Performance Issues
**Issue**: Slow loading or rendering
**Solution**:
1. Check network tab for slow API calls
2. Reduce dataset size in search queries
3. Enable production optimizations

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# Enable React DevTools
npm install --save-dev @types/react @types/react-dom
```

## 📚 Dependencies

### Core Dependencies
- **Next.js 15.5.3**: React framework
- **React 18.3.1**: UI library
- **TypeScript 5.5.4**: Type system
- **Tailwind CSS 3.4.7**: Styling framework

### Visualization Dependencies
- **Recharts 2.12.7**: Chart library
- **Vis.js 9.1.13**: Network visualization
- **D3.js 7.9.0**: Data visualization
- **D3-Cloud 1.2.7**: Word clouds
- **React Simple Maps 3.0.0**: World maps

### Development Dependencies
- **ESLint 8.57.0**: Code linting
- **PostCSS 8.4.40**: CSS processing
- **Autoprefixer 10.4.19**: CSS prefixes
- **TypeScript 5.5.4**: Type checking

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Install dependencies (`npm install`)
4. Start development server (`npm run dev`)
5. Make changes and test thoroughly
6. Run linting (`npm run lint`)
7. Submit pull request

### Code Standards
- **TypeScript**: Use strict type checking
- **ESLint**: Follow configured linting rules
- **Component Structure**: Follow established patterns
- **Naming Conventions**: Use descriptive names
- **Documentation**: Document complex logic

### Pull Request Process
1. **Feature Complete**: Ensure feature is fully implemented
2. **Testing**: Add tests for new functionality
3. **Documentation**: Update relevant documentation
4. **Code Review**: Address review feedback
5. **Merge**: Merge after approval

## 📄 License

This project is part of the ISLE research initiative (arXiv: 2512.12760). See LICENSE file for details.

## 📞 Support

For technical support or questions:
- 📚 **Documentation**: Check this README and inline code documentation
- 🐛 **Issues**: Report bugs through the project issue tracker
- 💬 **Discussions**: Join project discussions for feature requests
- 🔧 **Development**: Check the development setup guide

---

**ISLE Frontend** - Empowering research discovery through intuitive interfaces and powerful visualizations.