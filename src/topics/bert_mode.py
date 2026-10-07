from umap import UMAP
from hdbscan import HDBSCAN
from bertopic import BERTopic
from sentence_transformers import SentenceTransformer
from bertopic.vectorizers import ClassTfidfTransformer
from sklearn.feature_extraction.text import CountVectorizer
from bertopic.representation import MaximalMarginalRelevance, KeyBERTInspired

from config.bert import TopicModelConfig


class BertTopicModel:
    def __init__(self, config: TopicModelConfig):
        self.config = config
        
        self.umap_model = None
        self.ctfidf_model = None
        self.hdbscan_model = None
        self.embedding_model = None
        self.vectorizer_model = None
        self.representation_models = None
        
        self._init_models()
        
    def _init_models(self):
        self.umap_model = UMAP(**self.config.umap.to_dict())
        self.hdbscan_model = HDBSCAN(**self.config.hdbscan.to_dict())
        self.embedding_model = SentenceTransformer(**self.config.embedding.to_dict())
        self.ctfidf_model = ClassTfidfTransformer(**self.config.class_tfidf.to_dict())
        self.vectorizer_model = CountVectorizer(**self.config.count_vectorizer.to_dict())

        self.representation_models = {
            "KeyBERT": KeyBERTInspired(),
            "MMR": MaximalMarginalRelevance(**self.config.representation.to_dict())
        }

        self.ctfidf_model = ClassTfidfTransformer(**self.config.class_tfidf.to_dict())
        
    def build(self, corpus):
        topic_model = BERTopic(
            embedding_model=self.embedding_model,
            umap_model=self.umap_model,
            hdbscan_model=self.hdbscan_model,
            vectorizer_model=self.vectorizer_model,
            ctfidf_model=self.ctfidf_model,
            representation_model=self.representation_models,
            nr_topics="auto",
            low_memory=False,
            calculate_probabilities=True,
            verbose=True
        )

        topic_model.fit(corpus)
        
        if self.config.reduce_topics and self.config.nr_topics is not None:
            topic_model.reduce_topics(corpus, nr_topics=self.config.nr_topics)

        return topic_model