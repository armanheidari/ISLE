import pickle

from umap import UMAP
from hdbscan import HDBSCAN
from bertopic import BERTopic
from sentence_transformers import SentenceTransformer
from bertopic.vectorizers import ClassTfidfTransformer
from sklearn.feature_extraction.text import CountVectorizer
from bertopic.representation import MaximalMarginalRelevance, KeyBERTInspired


def bertopic_pipeline(corpus, reduce_topics, device, nr_topics=None, save=None):
    embedding_model = SentenceTransformer("all-mpnet-base-v2", device=device)

    umap_model = UMAP(
        n_neighbors=30,
        n_components=10,
        min_dist=0.1,
        metric='cosine',
        random_state=42
    )

    hdbscan_model = HDBSCAN(
        min_cluster_size=15,
        min_samples=5,
        metric='euclidean',
        cluster_selection_method='eom',
        prediction_data=True,
        cluster_selection_epsilon=0.1
    )

    vectorizer_model = CountVectorizer(
        ngram_range=(1, 3),
        stop_words="english",
        lowercase=True,
        token_pattern=r'\b[a-zA-Z][a-zA-Z]+\b'
    )

    ctfidf_model = ClassTfidfTransformer(
        reduce_frequent_words=True, 
        bm25_weighting=True
    )

    keybert_model = KeyBERTInspired()
    mmr_model = MaximalMarginalRelevance(diversity=0.3)

    representation_models = {
        "MMR": mmr_model,
        "KeyBERT": keybert_model
    }

    topic_model = BERTopic(
        embedding_model=embedding_model,
        umap_model=umap_model,
        hdbscan_model=hdbscan_model,
        vectorizer_model=vectorizer_model,
        ctfidf_model=ctfidf_model,
        representation_model=representation_models,
        nr_topics="auto",
        low_memory=False,
        calculate_probabilities=True,
        verbose=True
    )

    topic_model.fit(corpus)
    
    if reduce_topics:
        topic_model.reduce_topics(corpus, nr_topics=nr_topics)

    if save:
        pickle.dump(topic_model, open(save, "wb"))

    return topic_model


def inference_pipeline(model, corpus, save=None):
    topics, probs = model.transform(corpus)

    if save:
        pickle.dump({
            "topics": topics,
            "probabilities": probs
        }, open(save, "wb"))

    return topics, probs