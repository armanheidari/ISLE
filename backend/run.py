"""
FastAPI application entry point
"""
import sys
from pathlib import Path


backend_dir = Path(__file__).parent
project_root = backend_dir.parent
sys.path.insert(0, str(project_root / "src"))
sys.path.insert(0, str(backend_dir))

from app.main import app


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "run:app",
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )