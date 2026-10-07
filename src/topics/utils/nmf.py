import numpy as np
import pandas as pd 


class NMFTopic:
    def __init__(self, nmf_model, vectorizer, documents, n_top_words=10):
        self.nmf_model = nmf_model
        self.vectorizer = vectorizer
        self.documents = documents
        self.n_top_words = n_top_words
        self.feature_names = vectorizer.get_feature_names_out()
        
        self.tfidf_matrix = vectorizer.transform(documents)
        self.doc_topic_matrix = nmf_model.transform(self.tfidf_matrix)

        self.topic_assignments = self.doc_topic_matrix.argmax(axis=1)

        self._calculate_topic_info()
    
    def _calculate_topic_info(self):
        unique_topics, topic_counts = np.unique(self.topic_assignments, return_counts=True)
        total_docs = len(self.documents)
        
        self.topic_sizes = {}
        self.topic_frequencies = {}
        
        for topic_id, count in zip(unique_topics, topic_counts):
            self.topic_sizes[topic_id] = count
            self.topic_frequencies[topic_id] = count / total_docs
    
    def get_topics(self, full=False):
        topics = {}
        n_words = len(self.feature_names) if full else self.n_top_words
        
        for topic_idx, topic_weights in enumerate(self.nmf_model.components_):
            top_indices = topic_weights.argsort()[-n_words:][::-1]

            topic_words = [
                (self.feature_names[i], float(topic_weights[i])) 
                for i in top_indices
            ]
            
            topics[topic_idx] = topic_words
            
        return topics
    
    def get_topic_info(self, topic_id=None):
        topics_data = []
        topics_dict = self.get_topics()
        
        topic_ids = [topic_id] if topic_id is not None else range(self.nmf_model.n_components)
        
        for tid in topic_ids:
            if tid in topics_dict:
                top_words = topics_dict[tid][:3]
                topic_words_str = ', '.join([word for word, _ in top_words])
                
                topics_data.append({
                    'Topic': tid,
                    'Count': self.topic_sizes.get(tid, 0),
                    'Frequency': self.topic_frequencies.get(tid, 0.0),
                    'Name': f"{tid}_{topic_words_str.replace(', ', '_')}",
                    'Representation': topic_words_str,
                    'Representative_Docs': self._get_representative_docs(tid, n_docs=3)
                })
        
        return pd.DataFrame(topics_data)
    
    def get_topic(self, topic_id, full=False):
        if topic_id >= self.nmf_model.n_components or topic_id < 0:
            raise ValueError(f"Topic ID {topic_id} out of range")
            
        topics = self.get_topics(full=full)
        return topics.get(topic_id, [])
    
    def _get_representative_docs(self, topic_id, n_docs=3):
        topic_doc_indices = np.where(self.topic_assignments == topic_id)[0]
        
        if len(topic_doc_indices) == 0:
            return []

        topic_probs = self.doc_topic_matrix[topic_doc_indices, topic_id]
        top_doc_indices = topic_doc_indices[topic_probs.argsort()[-n_docs:][::-1]]
        
        return [
            self.documents[i][:100] + "..." if len(self.documents[i]) > 100 else self.documents[i]
            for i in top_doc_indices
        ]

    def get_document_info(self, docs=None):
        doc_data = []
        for i, doc in enumerate(docs):
            if i < len(self.topic_assignments):
                topic_id = self.topic_assignments[i]
                probability = self.doc_topic_matrix[i, topic_id]
                
                doc_data.append({
                    'Document': doc[:100] + "..." if len(doc) > 100 else doc,
                    'Topic': topic_id,
                    'Probability': probability,
                    'Document_Index': i
                })
        
        return pd.DataFrame(doc_data)
    
    def transform(self, documents):
        tfidf_new = self.vectorizer.transform(documents)
        nmf_new = self.nmf_model.transform(tfidf_new)

        topic_probs = nmf_new / nmf_new.sum(axis=1, keepdims=True)
    
        return nmf_new.argmax(axis=1), topic_probs
    
    def predict(self, documents):
        topic_probs = self.transform(documents)
        return topic_probs.argmax(axis=1)