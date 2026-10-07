import numpy as np
from joblib import Parallel, delayed
from sklearn.decomposition import NMF
from gensim.corpora import Dictionary
from gensim.models.coherencemodel import CoherenceModel
from sklearn.feature_extraction.text import TfidfVectorizer


def get_hyperparameter(rng, param_config):
    param_type = param_config['type']

    if param_type == 'int':
        low = int(param_config['low'])
        high = int(param_config['high'])

        return rng.randint(low, high + 1)

    elif param_type == 'float':
        low = float(param_config['low'])
        high = float(param_config['high'])

        return float(rng.uniform(low, high))

    elif param_type == 'categorical':
        choices = param_config['choices']
        return rng.choice(choices)

    elif param_type == 'loguniform':
        low = float(param_config['low'])
        high = float(param_config['high'])
        
        log_low = np.log(low)
        log_high = np.log(high)
        
        return float(np.exp(rng.uniform(log_low, log_high)))

    else:
        raise ValueError(f"Unsupported parameter type: {param_type}")


def get_score(documents, tokenized_docs, dictionary, vectorizer_params_suggest, nmf_params_suggest):
    try:
        if "ngram_range" in vectorizer_params_suggest and isinstance(vectorizer_params_suggest["ngram_range"], int):
            vectorizer_params_suggest["ngram_range"] = (1, vectorizer_params_suggest["ngram_range"])

        vectorizer = TfidfVectorizer(**vectorizer_params_suggest)
        tfidf = vectorizer.fit_transform(documents)
        feature_names = vectorizer.get_feature_names_out()

        nmf = NMF(**nmf_params_suggest)
        W = nmf.fit_transform(tfidf)
        H = nmf.components_

        topics = [
            [feature_names[i] for i in comp.argsort()[::-1][:20]]
            for comp in H
        ]

        cm = CoherenceModel(
            topics=topics,
            texts=tokenized_docs,
            dictionary=dictionary,
            coherence='c_v',
            processes=1
        )

        coherence_score = cm.get_coherence()
        reconstruction_error = nmf.reconstruction_err_

        normalized_error = reconstruction_error / (reconstruction_error + 1)
        combined_score = coherence_score - 0.1 * normalized_error

        return float(combined_score)
    
    except Exception as e:
        return float("-inf")


def optimize(documents, vectorizer_params, nmf_params, static_params, n_iter=50, n_jobs=1, seed=42):
    tokenized_docs = [doc.lower().split() for doc in documents]
    dictionary = Dictionary(tokenized_docs)

    rng = np.random.RandomState(seed)
    seeds = rng.randint(0, 2**31 - 1, size=n_iter)

    def _evaluate(local_seed):
        local_rng = np.random.RandomState(int(local_seed))
        v_params = {}
        n_params = {}

        for pname, pconfig in vectorizer_params.items():
            v_params[pname] = get_hyperparameter(local_rng, pconfig)

        if "ngram_range" in v_params and isinstance(v_params["ngram_range"], int):
            v_params["ngram_range"] = (1, int(v_params["ngram_range"]))

        for pname, pconfig in nmf_params.items():
            n_params[pname] = get_hyperparameter(local_rng, pconfig)

        n_params.update(static_params["nmf"])
        v_params.update(static_params["vectorizer"])
    
        score = get_score(documents, tokenized_docs, dictionary, v_params, n_params)
        return {"vectorizer": v_params, "nmf": n_params, "score": score}

    results = Parallel(n_jobs=n_jobs, prefer="processes", verbose=10)(
        delayed(_evaluate)(s) for s in seeds
    )

    best = max(results, key=lambda r: r["score"])
        
    best_nmf_params = {}
    best_vectorizer_params = {}

    for param_name, param_value in best["vectorizer"].items():
        if param_name in vectorizer_params:
            best_vectorizer_params[param_name] = param_value

    for param_name, param_value in best["nmf"].items():
        if param_name in nmf_params:
            best_nmf_params[param_name] = param_value

    return {
        "vectorizer": best_vectorizer_params,
        "nmf": best_nmf_params
    }