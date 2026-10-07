import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(PROJECT_ROOT))

from topics.nmf_model import NMFTopicModel
from topics.bert_mode import BertTopicModel
from graph.knowledge_graph import PaperKnowledgeGraph
from graph.graph_analyzer import KnowledgeGraphAnalyzer


class ISLE:
    def __init__(self, config, topic_model_type):
        self.config = config
        
        self.df = None
        self.analyzer = None
        self.topic_model = None
        self.knowledge_graph = None
        self.topic_model_type = topic_model_type

    def load_data(self, df):
        self.df = df
        return self
    
    def build_topic_model(self, corpus):
        if self.df is None:
            raise ValueError("Dataframe not loaded. Call load_data() first.")
        
        if self.topic_model_type == 'nmf':
            self.topic_model = NMFTopicModel(self.config).build(corpus)
        
        elif self.topic_model_type == 'bert':
            self.topic_model = BertTopicModel(self.config).build(corpus)

        topics, probs = self.topic_model.transform(corpus)
        self.df['topic'] = topics
        self.df['probability'] = [prob.max() if prob is not None else 0.0 for prob in probs]
        
        return self
    
    def build_knowledge_graph(self):
        if self.df is None or self.topic_model is None:
            raise ValueError("Dataframe or topic model not available. Ensure both are set before building the knowledge graph.")
        
        self.knowledge_graph = PaperKnowledgeGraph(
            df=self.df, 
            topic_model=self.topic_model
        ).fast_build()
        
        return self
    
    def build_graph_analyzer(self):
        if self.knowledge_graph is None or self.topic_model is None:
            raise ValueError("Knowledge graph or topic model not available. Ensure both are set before building the analyzer.")

        self.analyzer = KnowledgeGraphAnalyzer(
            graph=self.knowledge_graph, 
            topic_model=self.topic_model
        )
    
        return self
    
    def get_graph_analyzer(self):
        if self.analyzer is None:
            raise ValueError("Analyzer not built. Call build_graph_analyzer() first.")

        return self.analyzer
    
    def get_knowledge_graph(self):
        if self.knowledge_graph is None:
            raise ValueError("Knowledge Graph not built. Call build_knowledge_graph() first.")

        return self.knowledge_graph
