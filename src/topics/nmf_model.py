from sklearn.decomposition import NMF
from sklearn.feature_extraction.text import TfidfVectorizer

from topics.utils.nmf import NMFTopic
from config.nmf import TopicModelConfig
from topics.utils.tuning import optimize


class NMFTopicModel:
    def __init__(self, config: TopicModelConfig):
        self.config = config
        
        self.nmf_model = None
        self.tfidf_model = None

    def _init_models(self, best_params, static_params):
        best_params["nmf"].update(static_params["nmf"])
        best_params["vectorizer"].update(static_params["vectorizer"])
    
        self.nmf_model = NMF(**best_params["nmf"])
        self.tfidf_model = TfidfVectorizer(**best_params["vectorizer"])
        
    def _get_params(self):
        static_params_vectorizer = {
            key: value 
            for key, value in self.config.vectorizer.to_dict().items()
            if not isinstance(value, dict)
        }
        
        static_params_nmf = {
            key: value 
            for key, value in self.config.nmf.to_dict().items()
            if not isinstance(value, dict)
        }
        
        optimize_params_vectorizer = {
            key: value 
            for key, value in self.config.vectorizer.to_dict().items()
            if isinstance(value, dict) 
        }
        
        optimize_params_nmf = {
            key: value 
            for key, value in self.config.nmf.to_dict().items()
            if isinstance(value, dict) 
        }
        
        return {
            "static": {
                "vectorizer": static_params_vectorizer,
                "nmf": static_params_nmf
            },
            "optimize": {
                "vectorizer": optimize_params_vectorizer,
                "nmf": optimize_params_nmf
            }
        }

    def build(self, corpus):
        params = self._get_params()
        
        best_params = optimize(
            corpus, 
            vectorizer_params=params["optimize"]["vectorizer"],
            nmf_params=params["optimize"]["nmf"],
            static_params=params["static"],
            n_iter=self.config.n_trials,
            n_jobs=self.config.n_jobs
        )
        
        self._init_models(best_params, params["static"])
        self.nmf_model.fit(self.tfidf_model.fit_transform(corpus))
        
        topic_model = NMFTopic(        
            nmf_model=self.nmf_model, 
            vectorizer=self.tfidf_model,
            documents=corpus
        )

        return topic_model