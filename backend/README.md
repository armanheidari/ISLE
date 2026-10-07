# ISLE Backend API

A modern, high-performance FastAPI-based backend for the ISLE (Intelligent Scientific Literature Explorer) project that provides comprehensive scientific paper analysis through advanced topic modeling, knowledge graph construction, and interactive network visualization.

## 🚀 Overview

ISLE Backend is a sophisticated analysis engine designed to process and analyze large collections of scientific papers. It combines state-of-the-art natural language processing with graph theory to provide deep insights into research trends, collaboration networks, and knowledge structures.

### Key Capabilities
- **Advanced Topic Modeling**: Uses BERTopic and NMF for semantic understanding of research topics
- **Knowledge Graph Analytics**: Constructs and analyzes complex relationships between papers, authors, and institutions
- **Interactive Network Visualization**: Generates dynamic networks for citations, collaborations, and topics
- **Real-time Filtering**: Multi-dimensional filtering with session-based caching
- **Statistical Analysis**: Comprehensive metrics and trend analysis
- **Scalable Architecture**: Handles large datasets with intelligent sampling and caching
- **Hybrid Search**: Combines semantic and keyword search for optimal results

## ✨ Features

### 🔍 **Paper Analysis Engine**
- **Semantic Topic Modeling**: Advanced BERTopic and NMF implementation for topic discovery
- **Knowledge Graph Construction**: Multi-layered graph representation of academic relationships  
- **Statistical Analytics**: Comprehensive metrics on papers, authors, institutions, and countries
- **Trend Analysis**: Temporal analysis of topic evolution and research trends
- **Citation Analysis**: Advanced citation network construction and analysis
- **Hybrid Search**: Elasticsearch-powered semantic and keyword search

### 📊 **Visualization & Data Export**
- **Topic Word Clouds**: Interactive topic visualization with weighted terms
- **Network Graphs**: Citation, author collaboration, and institutional networks
- **Trend Charts**: Topic evolution over time with statistical trends
- **Interactive Data**: JSON-formatted data ready for frontend visualization libraries
- **Standardized Formats**: Compatible with D3.js, Cytoscape.js, Vis.js, and React Flow

### 🎛️ **Advanced Filtering System**
- **Multi-dimensional Filters**: Author, institution, country, and year-based filtering
- **Session-based Caching**: Efficient filter application with session management
- **Real-time Updates**: Dynamic filter application without full reprocessing
- **Combinatorial Logic**: Complex AND/OR filtering logic support

### 🏗️ **Modern API Architecture**
- **FastAPI Framework**: High-performance, modern Python web framework
- **Automatic Documentation**: Interactive OpenAPI/Swagger documentation
- **Type Safety**: Full Pydantic model validation and type checking
- **Session Management**: Intelligent session-based data caching
- **CORS Support**: Pre-configured for seamless frontend integration
- **Comprehensive Error Handling**: Detailed error responses with proper HTTP status codes

### 🔄 **Two-Phase Analysis Workflow**
1. **Phase 1 - Core Analysis**: Fast topic modeling and basic statistics
2. **Phase 2 - Network Generation**: On-demand network analysis with filtering

## 🏛️ Project Architecture

### Directory Structure
```
backend/
├── app/
│   ├── core/
│   │   ├── config.py          # Application configuration & settings
│   │   ├── constants.py       # Application constants
│   │   ├── dependencies.py    # FastAPI dependency injection
│   │   └── exceptions.py      # Custom exception classes
│   ├── models/
│   │   └── schemas.py         # Pydantic models & data structures
│   ├── routers/
│   │   └── analysis.py        # API endpoints & route handlers
│   ├── services/
│   │   ├── analysis_service.py    # Core business logic & analysis engine
│   │   ├── elastic_services.py    # Elasticsearch integration
│   │   ├── node_details_service.py # Node detail extraction
│   │   └── statistics_service.py  # Statistical analysis
│   ├── utils/
│   │   ├── data_processing.py     # Data processing utilities
│   │   └── network_processing.py  # Network processing utilities
│   └── main.py               # FastAPI application & middleware setup
├── requirements.txt          # Python dependencies
├── run.py                   # Development server runner
├── start.sh                 # Production startup script
├── docker-compose.yml       # Docker containerization
├── Dockerfile              # Docker image definition
└── README.md               # This documentation
```

### Service Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   Frontend      │────│   FastAPI       │────│   Analysis Service  │
│   Application   │    │   Router        │    │   (Business Logic)  │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
                                │                         │
                                │                         │
                       ┌────────▼──────────┐    ┌─────────▼───────────┐
                       │   Pydantic       │    │   Session          │
                       │   Schemas        │    │   Management       │
                       └──────────────────┘    └─────────────────────┘
                                                         │
                                               ┌─────────▼───────────┐
                                               │   Knowledge Graph  │
                                               │   & Topic Model    │
                                               └─────────────────────┘
                                                         │
                                               ┌─────────▼───────────┐
                                               │   Elasticsearch    │
                                               │   Search Engine    │
                                               └─────────────────────┘
```

## 📦 Installation & Setup

### Prerequisites
- **Python**: 3.8 or higher (3.9+ recommended)
- **Memory**: 4GB+ RAM (8GB+ for large datasets)
- **Storage**: 2GB+ free space
- **Elasticsearch**: 8.x or higher (for search functionality)

### Quick Start

1. **Clone and navigate to the backend directory:**
   ```bash
   cd ISLE/backend
   ```

2. **Create and activate virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment (optional):**
   ```bash
   cp .env.example .env
   # Edit .env with your specific configuration
   ```

5. **Start Elasticsearch (required for search functionality):**
   ```bash
   # Using Docker
   docker run -d --name elasticsearch -p 9200:9200 -e "discovery.type=single-node" elasticsearch:8.13.0
   
   # Or using the provided docker-compose
   cd ../services/elasticsearch
   docker-compose up -d
   ```

6. **Start the development server:**
   ```bash
   python run.py
   ```

### Server Access Points
- **🌐 API Endpoint**: http://localhost:8000
- **📚 Interactive Documentation**: http://localhost:8000/docs
- **📖 ReDoc Documentation**: http://localhost:8000/redoc
- **❤️ Health Check**: http://localhost:8000/health

## 🛠️ API Reference

### Core Analysis Endpoints

#### 🔍 **Analyze Papers** - `POST /api/v1/analysis/search`

Performs comprehensive paper analysis with topic modeling and knowledge graph construction.

**Request Model**: `AnalysisQuery`
```json
{
  "query": "machine learning in healthcare",
  "filters": {
    "author": ["John Doe", "Jane Smith"],
    "country": ["USA", "UK", "Germany"],
    "year_range": [2020, 2024],
    "location": ["MIT", "Stanford", "Oxford"]
  },
  "settings": {
    "model": "BERT",
    "max_papers_limit": 2000,
    "max_nodes_limit": 10000,
    "max_edges_limit": 30000
  }
}
```

**Response Model**: `AnalysisResult`
- `basic_stats`: Comprehensive dataset statistics
- `most_cited_papers`: Top cited papers with citation counts
- `top_authors_by_papers`: Most prolific authors by paper count
- `top_authors_by_citations`: Most cited authors
- `top_countries_by_papers`: Leading countries by publication count
- `top_countries_by_citations`: Most cited countries
- `top_institutions_by_papers`: Most active institutions by paper count
- `top_institutions_by_citations`: Most cited institutions
- `all_countries_by_papers`: All countries data for world map visualization
- `all_countries_by_citations`: All countries citation data
- `topic_distribution`: Topic frequency distribution
- `topic_wordclouds`: Topic terms with semantic weights
- `topics_over_time`: Temporal topic evolution
- `active_filters`: Currently applied filters
- `session_id`: Session identifier for subsequent requests

#### 🌐 **Build Network** - `POST /api/v1/analysis/network`

Generates network visualizations on-demand for existing analysis sessions.

**Request Model**: `NetworkQuery`
```json
{
  "session_id": "uuid-session-identifier",
  "network_type": "complete", // "complete" | "author_collaboration" | "institution_collaboration" | "country_collaboration"
  "filters": {
    "country": ["USA", "China"],
    "year_range": [2020, 2024]
  }
}
```

**Response Model**: `NetworkData`
- `session_id`: Reference session identifier
- `network_type`: Type of network generated
- `network_data`: Graph data with nodes and edges
- `applied_filters`: Filters used for network generation

#### 📊 **Session Information** - `GET /api/v1/analysis/session/{session_id}`

Retrieves information about an active analysis session.

**Response:**
```json
{
  "status": "active",
  "session_id": "uuid-session-identifier",
  "query": "original search query",
  "dataset_size": 1500,
  "created_filters": {}
}
```

#### 🗑️ **Remove Session** - `DELETE /api/v1/analysis/session/{session_id}`

Cleans up session data to free memory resources.

**Response:**
```json
{
  "message": "Session uuid-session-identifier cleaned up successfully"
}
```

#### 🔍 **Node Details** - `GET /api/v1/analysis/node/{session_id}/{node_id}`

Retrieves detailed information about a specific node in the knowledge graph.

**Response Model**: `NodeDetails`
- `id`: Node identifier
- `label`: Human-readable node label
- `type`: Node type (paper, author, institution, country, topic)
- `properties`: Node-specific properties and metadata
- `connections`: Number of connections in the graph
- `paper_details`: Detailed paper information (if applicable)
- `author_details`: Detailed author information (if applicable)
- `institution_details`: Detailed institution information (if applicable)
- `country_details`: Detailed country information (if applicable)
- `topic_details`: Detailed topic information (if applicable)

#### ❤️ **Health Check** - `GET /api/v1/analysis/health`

Provides detailed service health status and active session information.

**Response:**
```json
{
  "status": "healthy",
  "active_sessions": 3,
  "session_ids": ["session-1", "session-2", "session-3"]
}
```

## 📋 Data Models

### Core Request Models

#### `PaperFilters`
Advanced filtering options for paper analysis:
```python
{
  "location": ["MIT", "Stanford"],     # Institution names
  "author": ["John Doe"],              # Author names
  "country": ["USA", "UK"],            # Country codes/names
  "year_range": [2020, 2024],          # Publication year range
  "max_nodes": 100                     # Maximum nodes in network
}
```

#### `AnalysisQuery`  
Main analysis request structure:
```python
{
  "query": "machine learning",         # Search query string
  "filters": PaperFilters,            # Optional filtering
  "settings": AnalysisSettings        # Optional analysis configuration
}
```

#### `AnalysisSettings`
Analysis configuration options:
```python
{
  "model": "BERT",                     # Topic model: "NMF" or "BERT"
  "max_papers_limit": 2000,           # Maximum papers to analyze
  "max_nodes_limit": 10000,           # Maximum nodes in network
  "max_edges_limit": 30000            # Maximum edges in network
}
```

#### `NetworkQuery`
Network generation request:
```python
{
  "session_id": "uuid",               # Session identifier
  "network_type": "complete",         # Network type
  "filters": PaperFilters             # Optional filters
}
```

### Response Data Models

#### `DataStats`
Comprehensive dataset statistics:
```python
{
  "num_papers": 1500,
  "num_authors": 3200,
  "num_institutions": 450,
  "num_countries": 67,
  "num_topics": 25,
  "num_years": 10
}
```

#### `RankedEntity`
Represents ranked entities (authors, institutions, papers):
```python
{
  "name": "Dr. John Smith",
  "count": 12,
  "id": "author_123"
}
```

#### `PaperEntity`
Represents a paper with detailed information:
```python
{
  "name": "Machine Learning in Healthcare",
  "count": 45,
  "id": "paper_123",
  "authors": ["John Doe", "Jane Smith"],
  "year": 2023
}
```

#### `TopicTerms`
Topic word cloud data with semantic weights:
```python
{
  "topic_id": "1",
  "topic_label": "Topic 1: machine, learning, neural",
  "words": [
    {"word": "machine", "weight": 0.85},
    {"word": "learning", "weight": 0.72}
  ]
}
```

#### `GraphData`
Network visualization data:
```python
{
  "nodes": [
    {
      "id": "paper_123",
      "label": "ML in Healthcare",
      "type": "paper",
      "size": 15,
      "color": "#3498db",
      "properties": {}
    }
  ],
  "edges": [
    {
      "source": "paper_123",
      "target": "paper_456", 
      "weight": 1.0,
      "type": "citation"
    }
  ]
}
```

## ⚙️ Configuration

### Environment Variables
Configure the application through environment variables or `.env` file:

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `API_TITLE` | API title for documentation | "ISLE API" | "My Research API" |
| `API_VERSION` | API version string | "1.0.0" | "2.1.0" |
| `API_DESCRIPTION` | API description | "Scientific Paper Analysis API" | "Custom description" |
| `ALLOWED_ORIGINS` | CORS allowed origins (JSON array) | localhost variants | `["https://mydomain.com"]` |
| `ALLOWED_METHODS` | CORS allowed methods | `["GET", "POST", "DELETE"]` | Custom methods array |
| `ALLOWED_HEADERS` | CORS allowed headers | `["*"]` | Custom headers array |
| `DEFAULT_DATASET_PATH` | Path to dataset CSV | "data/corpus/topic_dataset.csv" | "/path/to/data.csv" |
| `MAX_PAPERS_LIMIT` | Maximum papers for analysis | 5000 | 10000 |
| `MAX_WORDCLOUD_WORDS` | Words per topic wordcloud | 50 | 100 |
| `ELASTICSEARCH_URL` | Elasticsearch server URL | "http://localhost:9200" | "http://es-cluster:9200" |
| `ELASTICSEARCH_INDEX` | Elasticsearch index name | "papers" | "research_papers" |

### Example Configuration
```bash
# .env file
API_TITLE="My Research Analysis API"
API_VERSION="2.0.0"
ALLOWED_ORIGINS='["https://mydomain.com", "https://app.mydomain.com"]'
MAX_PAPERS_LIMIT=10000
MAX_WORDCLOUD_WORDS=75
ELASTICSEARCH_URL="http://localhost:9200"
ELASTICSEARCH_INDEX="research_papers"
```

## 🌐 Frontend Integration

### CORS Configuration
Pre-configured for popular development servers:
- **React**: `http://localhost:3000`
- **Vue/Vite**: `http://localhost:5173`  
- **Angular**: `http://localhost:4200`
- **Generic**: `http://localhost:8080`

### Supported Visualization Libraries
The API data format is compatible with:
- **D3.js**: Direct node/edge format support
- **Cytoscape.js**: Native graph data structure
- **Vis.js**: Compatible network format
- **React Flow**: Ready-to-use node/edge arrays
- **Sigma.js**: Standard graph format
- **Plotly**: Network graph support

### Integration Example

```javascript
// Modern async/await API integration
class PaperAnalysisAPI {
  constructor(baseUrl = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
  }

  // Phase 1: Core Analysis
  async analyzeResearch(query, filters = {}, settings = {}) {
    const response = await fetch(`${this.baseUrl}/api/v1/analysis/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, filters, settings })
    });

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.statusText}`);
    }

    return await response.json();
  }

  // Phase 2: Network Generation  
  async buildNetwork(sessionId, networkType, filters = {}) {
    const response = await fetch(`${this.baseUrl}/api/v1/analysis/network`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        network_type: networkType,
        filters
      })
    });

    if (!response.ok) {
      throw new Error(`Network generation failed: ${response.statusText}`);
    }

    return await response.json();
  }

  // Node Details
  async getNodeDetails(sessionId, nodeId) {
    const response = await fetch(`${this.baseUrl}/api/v1/analysis/node/${sessionId}/${nodeId}`);
    return await response.json();
  }

  // Session Management
  async getSessionInfo(sessionId) {
    const response = await fetch(`${this.baseUrl}/api/v1/analysis/session/${sessionId}`);
    return await response.json();
  }

  async cleanupSession(sessionId) {
    await fetch(`${this.baseUrl}/api/v1/analysis/session/${sessionId}`, {
      method: 'DELETE'
    });
  }
}

// Usage Example
const api = new PaperAnalysisAPI();

// Complete analysis workflow
async function performAnalysis() {
  try {
    // Step 1: Analyze papers
    const analysis = await api.analyzeResearch(
      "artificial intelligence healthcare",
      { 
        country: ["USA", "China", "UK"],
        year_range: [2020, 2024] 
      },
      {
        model: "BERT",
        max_papers_limit: 2000
      }
    );

    console.log(`Found ${analysis.basic_stats.num_papers} papers`);
    console.log(`Identified ${analysis.basic_stats.num_topics} topics`);

    // Step 2: Generate citation network
    const citationNetwork = await api.buildNetwork(
      analysis.session_id,
      "complete",
      { year_range: [2022, 2024] }
    );

    // Step 3: Generate collaboration network
    const collabNetwork = await api.buildNetwork(
      analysis.session_id,
      "author_collaboration"
    );

    // Use the data for visualization
    renderTopicWordClouds(analysis.topic_wordclouds);
    renderNetworkGraph(citationNetwork.network_data);
    renderTrendCharts(analysis.topics_over_time);

    // Cleanup when done
    await api.cleanupSession(analysis.session_id);

  } catch (error) {
    console.error('Analysis failed:', error);
  }
}
```

## 🔧 Advanced Features

### Session-Based Analysis
- **Efficient Caching**: Analysis results cached per session
- **Memory Management**: Automatic cleanup and resource management  
- **Concurrent Sessions**: Multiple simultaneous analysis sessions
- **Session Persistence**: Session data maintained during analysis workflow

### Intelligent Data Processing
- **Smart Sampling**: Large datasets automatically sampled for performance
- **Network Pruning**: Complex networks optimized for visualization
- **Adaptive Filtering**: Efficient filter application without full reprocessing
- **Memory Optimization**: Intelligent memory usage for large-scale analysis

### Performance Optimizations
- **Asynchronous Processing**: Non-blocking analysis operations
- **Lazy Loading**: Networks generated only when requested
- **Caching Strategy**: Service-level caching for repeated operations
- **Resource Monitoring**: Built-in memory and performance monitoring

### Hybrid Search Engine
- **Semantic Search**: BERT-based semantic similarity search
- **Keyword Search**: BM25-based keyword matching
- **Combined Ranking**: Intelligent fusion of semantic and keyword results
- **Elasticsearch Integration**: Scalable search infrastructure

## 🛡️ Error Handling

### HTTP Status Codes
- **200 OK**: Successful operation
- **400 Bad Request**: Invalid request parameters or malformed JSON
- **404 Not Found**: Session or resource not found
- **422 Unprocessable Entity**: Validation errors in request data
- **500 Internal Server Error**: Analysis engine or processing errors

### Error Response Format
```json
{
  "error": "Validation Error",
  "detail": "Field 'query' is required and cannot be empty"
}
```

### Common Error Scenarios
1. **Invalid Query**: Empty or malformed search query
2. **Session Expired**: Requesting operations on non-existent session
3. **Resource Limits**: Exceeding maximum paper limits or memory constraints
4. **Data Processing**: Errors in topic modeling or graph construction
5. **Network Generation**: Failures in network analysis or conversion
6. **Elasticsearch Connection**: Search engine connectivity issues

## 🚀 Deployment

### Development Deployment
```bash
# Standard development server
python run.py

# With custom host and port
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Production Deployment

#### Using Gunicorn (Recommended)
```bash
# Install production server
pip install gunicorn

# Run with multiple workers
gunicorn app.main:app -w 4 -k uvicorn.workers.UnicornWorker --bind 0.0.0.0:8000
```

#### Docker Deployment
```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Set environment variables
ENV PYTHONPATH=/app
ENV ALLOWED_ORIGINS='["https://yourdomain.com"]'

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run application
CMD ["gunicorn", "app.main:app", "-w", "4", "-k", "uvicorn.workers.UnicornWorker", "--bind", "0.0.0.0:8000"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  elasticsearch:
    image: elasticsearch:8.13.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - es_data:/usr/share/elasticsearch/data

  isle-backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - ALLOWED_ORIGINS=["https://yourdomain.com"]
      - MAX_PAPERS_LIMIT=10000
      - ELASTICSEARCH_URL=http://elasticsearch:9200
    volumes:
      - ./data:/app/data
    depends_on:
      - elasticsearch
    restart: unless-stopped

volumes:
  es_data:
```

### Production Configuration
```bash
# Set production environment variables
export ALLOWED_ORIGINS='["https://yourdomain.com"]'
export API_VERSION="1.0.0"
export MAX_PAPERS_LIMIT=10000
export ELASTICSEARCH_URL="http://elasticsearch:9200"
```

## 🔍 Monitoring & Troubleshooting

### Health Monitoring
- **Health Endpoint**: `/api/v1/analysis/health`
- **Session Tracking**: Active session monitoring
- **Resource Usage**: Memory and processing monitoring
- **Error Logging**: Comprehensive error logging and tracking

### Common Issues & Solutions

#### Memory Issues
```bash
# Reduce memory usage
export MAX_PAPERS_LIMIT=2000
export MAX_WORDCLOUD_WORDS=25
```

#### Performance Issues
- **Dataset Size**: Use smaller datasets for testing
- **Session Cleanup**: Regular session cleanup to free memory
- **Network Limits**: Limit network size for large datasets
- **Concurrent Sessions**: Monitor and limit concurrent analysis sessions

#### Connection Issues
- **CORS Configuration**: Verify `ALLOWED_ORIGINS` settings
- **Port Configuration**: Ensure port 8000 is available
- **Firewall**: Check firewall settings for network access
- **Elasticsearch**: Verify Elasticsearch connectivity

### Logging Configuration
```python
# Enable debug logging
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 🧪 Development

### Adding New Features

1. **Schema Definition**: Add new Pydantic models in `app/models/schemas.py`
2. **Service Logic**: Implement business logic in `app/services/analysis_service.py`
3. **API Endpoints**: Create new endpoints in `app/routers/analysis.py`
4. **Route Registration**: Include routes in `app/main.py`

### Code Structure Guidelines
- **Type Hints**: Use comprehensive type hints throughout
- **Error Handling**: Implement proper exception handling
- **Documentation**: Document all public methods and classes
- **Testing**: Add unit tests for new functionality

### Testing Framework
```bash
# Install testing dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=app --cov-report=html
```

## 📚 Dependencies

### Core Dependencies
- **FastAPI**: Modern, fast web framework for building APIs
- **Pydantic**: Data validation using Python type annotations
- **Pandas**: Data manipulation and analysis
- **NumPy**: Numerical computing
- **Scikit-learn**: Machine learning library
- **NetworkX**: Network analysis and graph algorithms
- **BERTopic**: Advanced topic modeling
- **UMAP**: Dimensionality reduction
- **HDBSCAN**: Clustering algorithm
- **Elasticsearch**: Search and analytics engine
- **Sentence Transformers**: Semantic embeddings

### Development Dependencies
- **Pytest**: Testing framework
- **Pytest-asyncio**: Async testing support
- **HTTPx**: HTTP client for testing
- **Uvicorn**: ASGI server

## 📚 API Reference Summary

| Method | Endpoint | Description | Request Model | Response Model |
|--------|----------|-------------|---------------|----------------|
| POST | `/api/v1/analysis/search` | Analyze papers | `AnalysisQuery` | `AnalysisResult` |
| POST | `/api/v1/analysis/network` | Build network | `NetworkQuery` | `NetworkData` |
| GET | `/api/v1/analysis/session/{id}` | Session info | - | Session details |
| DELETE | `/api/v1/analysis/session/{id}` | Remove session | - | Success message |
| GET | `/api/v1/analysis/node/{session_id}/{node_id}` | Node details | - | `NodeDetails` |
| GET | `/api/v1/analysis/health` | Health check | - | Service status |
| GET | `/health` | Simple health | - | Basic status |
| GET | `/` | API info | - | Welcome message |

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Follow code style guidelines
4. Add comprehensive tests
5. Update documentation
6. Submit pull request

### Code Standards
- **Python Style**: Follow PEP 8 guidelines
- **Type Safety**: Use type hints throughout
- **Documentation**: Document all public APIs
- **Error Handling**: Comprehensive error handling
- **Testing**: Unit tests for new features

## 📄 License

This project is part of the ISLE research initiative. See LICENSE file for details.

## 📞 Support

For technical support or questions:
- 📚 **Documentation**: Check `/docs` endpoint for interactive API documentation
- 🐛 **Issues**: Report bugs through the project issue tracker
- 💬 **Discussions**: Join project discussions for feature requests

---

**ISLE Backend** - Empowering research through intelligent paper analysis and visualization.