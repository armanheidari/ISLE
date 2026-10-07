import torch
from dataclasses import dataclass


if torch.cuda.is_available():
    DEVICE = "cuda"
    
elif torch.backends.mps.is_available():
    DEVICE = "mps"
    
else:
    DEVICE = "cpu"


@dataclass
class EmbeddingConfig:
    model_name_or_path: str = "all-mpnet-base-v2"
    device: str = DEVICE
    
    def to_dict(self):
        return {
            "model_name_or_path": self.model_name_or_path,
            "device": self.device
        }


@dataclass
class UMAPConfig:
    n_neighbors: int = 30
    n_components: int = 10
    min_dist: float = 0.1
    metric: str = 'cosine'
    random_state: int = 42
    
    def to_dict(self):
        return {
            "n_neighbors": self.n_neighbors,
            "n_components": self.n_components,
            "min_dist": self.min_dist,
            "metric": self.metric,
            "random_state": self.random_state
        }
    

@dataclass
class HDBSCANConfig:
    min_cluster_size: int = 15
    min_samples: int = 5
    metric: str = 'euclidean'
    cluster_selection_method: str = 'eom'
    prediction_data: bool = True
    cluster_selection_epsilon: float = 0.1
    
    def to_dict(self):
        return {
            "min_cluster_size": self.min_cluster_size,
            "min_samples": self.min_samples,
            "metric": self.metric,
            "cluster_selection_method": self.cluster_selection_method,
            "prediction_data": self.prediction_data,
            "cluster_selection_epsilon": self.cluster_selection_epsilon
        }
    

@dataclass
class CountVectorizerConfig:
    ngram_range: tuple = (1, 3)
    stop_words: str = "english"
    lowercase: bool = True
    token_pattern: str = r'\b[a-zA-Z][a-zA-Z]+\b'
    
    def to_dict(self):
        return {
            "ngram_range": self.ngram_range,
            "stop_words": self.stop_words,
            "lowercase": self.lowercase,
            "token_pattern": self.token_pattern
        }
    

@dataclass
class ClassTfidfTransformerConfig:
    reduce_frequent_words: bool = True
    bm25_weighting: bool = True
    
    def to_dict(self):
        return {
            "reduce_frequent_words": self.reduce_frequent_words,
            "bm25_weighting": self.bm25_weighting
        }
    

@dataclass
class RepresentationModelConfig:
    diversity: float = 0.3
    
    def to_dict(self):
        return {
            "diversity": self.diversity
        }


@dataclass
class TopicModelConfig:
    embedding: EmbeddingConfig = EmbeddingConfig()
    umap: UMAPConfig = UMAPConfig()
    hdbscan: HDBSCANConfig = HDBSCANConfig()
    count_vectorizer: CountVectorizerConfig = CountVectorizerConfig()
    class_tfidf: ClassTfidfTransformerConfig = ClassTfidfTransformerConfig()
    representation: RepresentationModelConfig = RepresentationModelConfig()
    reduce_topics: bool = False
    nr_topics: int = None