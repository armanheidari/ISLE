from config.nmf import TopicModelConfig as NMFTopicModelConfig
from config.bert import TopicModelConfig as BertTopicModelConfig


NMF_CONFIG_DEFAULT = NMFTopicModelConfig(
    n_trials=20,
    n_jobs=10,
    random_state=42
)

BERT_CONFIG_DEFAULT = BertTopicModelConfig(
    reduce_topics=False,
    nr_topics=None
)