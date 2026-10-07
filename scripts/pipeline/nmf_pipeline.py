import sys
sys.path.append("../..")

import pickle

from sklearn.decomposition import NMF
from sklearn.feature_extraction.text import TfidfVectorizer

from src.topics.utils.nmf import NMFTopic
from src.topics.utils.tuning import optimize


def nmf_pipeline(corpus, vectorizer_params, nmf_params, n_trials, n_jobs, save=None):
    best_params = optimize(
        corpus, 
        vectorizer_params=vectorizer_params, 
        nmf_params=nmf_params, 
        static_params={"vectorizer": {}, "nmf": {}},
        n_iter=n_trials,
        n_jobs=n_jobs
    )
    
    vectorizer = TfidfVectorizer(**best_params["vectorizer"])
    tfidf = vectorizer.fit_transform(corpus)

    nmf_model = NMF(**best_params["nmf"])
    nmf_model.fit(tfidf)
    
    print("BEST PARAMS VECTORIZER:", best_params["vectorizer"])
    print("BEST PARAMS NMF:", best_params["nmf"])

    topic_model = NMFTopic(
        nmf_model=nmf_model,
        vectorizer=vectorizer,
        documents=corpus
    )

    if save: 
        pickle.dump(topic_model, open(save, 'wb'))
        
    return topic_model


def inference_pipeline(model, corpus, save=None):
    topics = model.transform(corpus)
    
    if save:
        with open(save, 'wb') as f:
            pickle.dump(topics, f)
        
    return topics