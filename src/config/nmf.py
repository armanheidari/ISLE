from dataclasses import dataclass


@dataclass
class VectorizerConfig:
    ngram_range: tuple = (3, 4)
    max_features: int = 10000
    min_df: tuple = (0.0001, 0.1)
    max_df: tuple = (0.99, 1.0)
    stop_words: str = 'english'
    
    def to_dict(self):
        return {
            "ngram_range": {'type': 'int', 'low': self.ngram_range[0], 'high': self.ngram_range[1]},
            "max_features": {'type': 'int', 'low': self.max_features, 'high': self.max_features},
            "min_df": {'type': 'float', 'low': self.min_df[0], 'high': self.min_df[1]},
            "max_df": {'type': 'float', 'low': self.max_df[0], 'high': self.max_df[1]},
            "stop_words": {'type': 'categorical', 'choices': [self.stop_words, None]}
        }


@dataclass
class NMFConfig:
    n_components: tuple = (5, 30)
    max_iter: int = 800

    def to_dict(self):
        return {
            "n_components": {'type': 'int', 'low': self.n_components[0], 'high': self.n_components[1]},
            "max_iter": self.max_iter
        }

        
@dataclass
class TopicModelConfig:
    vectorizer: VectorizerConfig = VectorizerConfig()
    nmf: NMFConfig = NMFConfig()
    random_state: int = 42
    n_trials: int = 20
    n_jobs: int = 10
    
    def to_dict(self):
        return {
            "vectorizer": self.vectorizer.to_dict(),
            "nmf": self.nmf.to_dict(),
            "random_state": self.random_state,
            "n_init": self.n_init,
            "max_iter": self.max_iter
        }