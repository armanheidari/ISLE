# ISLE: Intelligent Scientific Literature Explorer using Machine Learning

[![arXiv](https://img.shields.io/badge/arXiv-2512.12760-b31b1b.svg)](https://arxiv.org/abs/2512.12760)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688.svg)](https://fastapi.tiangolo.com/)

Official codebase and implementation for the paper:
> **Intelligent Scientific Literature Explorer using Machine Learning (ISLE)**  
> Sina Jani, Arman Heidari, Amirmohammad Anvari, Zahra Rahimi  
> *arXiv preprint arXiv:2512.12760*  
> Paper: [https://arxiv.org/abs/2512.12760](https://arxiv.org/abs/2512.12760) | [PDF](https://arxiv.org/pdf/2512.12760)

---

## 🚀 Overview

The rapid acceleration of scientific publishing creates substantial challenges for researchers attempting to discover, contextualize, and interpret relevant literature. Traditional keyword-based search systems provide limited semantic understanding, while existing AI tools typically focus on isolated tasks (e.g., retrieval, clustering, or bibliometric visualization).

**ISLE (Intelligent Scientific Literature Explorer)** is an integrated, end-to-end platform for scientific literature exploration that unifies:
1. **Large-scale Data Acquisition**: Merging full-text papers from arXiv with rich metadata from OpenAlex.
2. **Hybrid Retrieval Architecture**: Fusing BM25 lexical retrieval and transformer embedding semantic search via Reciprocal Rank Fusion (RRF).
3. **Semantic Topic Modeling**: Unsupervised topic discovery and representation using BERTopic or Non-negative Matrix Factorization (NMF).
4. **Heterogeneous Knowledge Graphs**: Multi-layered graph construction uniting papers, authors, institutions, countries, and topics into an interpretable structure with graph-topological metrics.
5. **Interactive Exploration Interface**: A high-performance web dashboard providing dynamic visualizations, network graphs, word clouds, geographic distributions, and in-depth analytical panels.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          ISLE Platform                          │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (Next.js 15)       │  Backend (FastAPI)              │
│  ┌─────────────────────────┐ │  ┌─────────────────────────────┐ │
│  │ • Hybrid Search UI      │ │  │ • Analysis Engine           │ │
│  │ • Analytics Dashboard   │ │  │ • Topic Modeling (BERT/NMF) │ │
│  │ • Knowledge Graphs      │ │  │ • Knowledge Graph Builder   │ │
│  │ • Semantic Word Clouds  │ │  │ • Network Analysis          │ │
│  │ • Geographic World Map  │ │  │ • RRF Fusion & Statistics   │ │
│  │ • Detailed Entity Views │ │  │ • Session Cache Manager     │ │
│  └─────────────────────────┘ │  └─────────────────────────────┘ │
│              │                │              │                   │
│              └────────────────┼──────────────┘                   │
│                               │                                  │
│  ┌─────────────────────────┐ │  ┌─────────────────────────────┐ │
│  │ • D3.js Visualizations  │ │  │ • Elasticsearch 8 Cluster   │ │
│  │ • Vis.js Interactive Net│ │  │ • PostgreSQL Database       │ │
│  │ • Recharts Analytics    │ │  │ • Redis Caching             │ │
│  │ • Tailwind CSS & Lucide │ │  │ • Docker Containers         │ │
│  └─────────────────────────┘ │  └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, D3.js, Vis.js, Recharts, React Simple Maps
- **Backend**: FastAPI, Python 3.10+, BERTopic, NMF (scikit-learn), NetworkX, PyTorch, Sentence Transformers
- **Search & Storage**: Elasticsearch 8.13+, PostgreSQL, MinIO
- **Deployment**: Docker & Docker Compose

---

## 🎯 Core Features

- 🔍 **Hybrid Retrieval Engine**:
  - BM25 lexical keyword matching
  - BERT dense semantic vector search
  - Reciprocal Rank Fusion (RRF) for balanced, robust result ranking
  - Multi-dimensional filtering across authors, institutions, countries, and publication years

- 📊 **Dynamic Semantic Topic Modeling**:
  - Neural topic modeling via BERTopic
  - Efficient matrix decomposition via NMF
  - Topic distribution, keyword weights, and temporal topic evolution

- 🌐 **Heterogeneous Knowledge Graphs**:
  - Multi-entity graph construction (Papers, Authors, Institutions, Countries, Topics)
  - Citation networks, collaboration graphs, and topic-entity relations
  - Topological impact aggregation and interactive graph exploration

- 🗺️ **Comprehensive Visualizations**:
  - Interactive citation and collaboration networks (Vis.js / D3.js)
  - Semantic word clouds for topic representations
  - Global choropleth maps depicting research distribution
  - Statistical charts and publication trends over time

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v20 or higher
- **Python**: 3.10 or higher
- **Docker & Docker Compose**: For containerized deployment
- **Memory**: 8GB+ RAM recommended

---

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/armanheidari/ISLE.git
cd ISLE

# Start all services with Docker Compose
docker-compose -f backend/docker-compose.yml up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# Elasticsearch: http://localhost:9200
```

---

### Option 2: Manual Setup

#### 1. Elasticsearch Setup
```bash
docker run -d --name elasticsearch -p 9200:9200 -e "discovery.type=single-node" -e "xpack.security.enabled=false" elasticsearch:8.13.4
```

#### 2. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# On Linux/macOS:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server
python run.py
```
The backend API documentation is available at [http://localhost:8000/docs](http://localhost:8000/docs).

#### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
ISLE/
├── backend/                    # FastAPI backend service
│   ├── app/
│   │   ├── core/              # Settings, constants, exceptions
│   │   ├── models/            # Pydantic schemas and models
│   │   ├── routers/           # REST API endpoints
│   │   ├── services/          # Business logic, Elasticsearch, analysis
│   │   └── utils/             # Data and network processing utilities
│   ├── docker-compose.yml     # Docker container definition
│   ├── Dockerfile             # Backend container image
│   ├── requirements.txt       # Backend dependencies
│   ├── run.py                 # Development runner
│   └── start.sh               # Startup shell script
├── frontend/                   # Next.js 15 frontend application
│   ├── public/                # Static assets and icons
│   ├── src/
│   │   ├── app/              # Next.js App Router (pages & layouts)
│   │   ├── components/       # UI components (search, charts, graphs)
│   │   ├── contexts/         # React Context providers
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # API clients & configuration
│   │   ├── types/            # TypeScript interfaces
│   │   └── utils/            # Helper functions
│   ├── package.json          # Frontend dependencies
│   └── tailwind.config.js    # Tailwind CSS config
├── data/                      # Dataset files & sample corpus
│   ├── corpus/               # Topic dataset samples
│   └── raw/                  # Processed articles
├── notebooks/                 # Jupyter notebooks for experiments
│   ├── bertopic.ipynb        # BERTopic analysis
│   ├── nmf.ipynb             # NMF experiments
│   ├── preprocessing.ipynb   # Data integration and preprocessing
│   └── top2vec.ipynb         # Top2Vec exploratory analysis
├── scripts/                   # Pipelines and preprocessing utilities
│   ├── pipeline/             # BERT/NMF pipelines & visualizers
│   └── preprocessing/        # Corpus preparation scripts
├── services/                  # Infrastructure configurations
│   ├── elastic/              # Elasticsearch & Kibana compose setup
│   └── postgres/             # PostgreSQL database compose setup
├── src/                       # Core ISLE analysis library
│   ├── config/               # Model configurations
│   ├── graph/                # Knowledge graph construction & analysis
│   ├── topics/               # BERTopic and NMF model implementations
│   └── isle.py               # Core ISLE class
├── .gitignore                 # Git ignore specification
├── LICENSE                    # MIT License
└── README.md                  # This documentation
```

---

## 🔧 Configuration

### Backend Environment Variables (`backend/.env`)

```env
API_TITLE="ISLE API"
API_DESCRIPTION="API for Intelligent Scientific Literature Explorer (ISLE)"
API_VERSION="1.0.0"

ALLOWED_ORIGINS=["http://localhost:3000","http://localhost:8080","http://localhost:5173"]

DEFAULT_DATASET_PATH="data/corpus/topic_dataset.csv"
MAX_PAPERS_LIMIT=5000
DEFAULT_PAPERS_LIMIT=1000

DEFAULT_TOP_N=10
MAX_WORDCLOUD_WORDS=50

ENABLE_CACHING=true
CACHE_TTL=3600
```

### Frontend Environment Variables (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL="http://localhost:8000"
BACKEND_URL="http://localhost:8000"
```

---

## 📚 Citation

If you find ISLE helpful in your research or application, please consider citing our paper:

```bibtex
@misc{jani2025intelligentscientificliteratureexplorer,
      title={Intelligent Scientific Literature Explorer using Machine Learning (ISLE)}, 
      author={Sina Jani and Arman Heidari and Amirmohammad Anvari and Zahra Rahimi},
      year={2025},
      eprint={2512.12760},
      archivePrefix={arXiv},
      primaryClass={cs.IR},
      url={https://arxiv.org/abs/2512.12760}
}
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support & Contact

- **Paper**: [arXiv:2512.12760](https://arxiv.org/abs/2512.12760)
- **Repository**: [https://github.com/armanheidari/ISLE](https://github.com/armanheidari/ISLE)
- **Issues**: [GitHub Issues](https://github.com/armanheidari/ISLE/issues)