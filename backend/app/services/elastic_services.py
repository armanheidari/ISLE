from enum import Enum
from typing import List, Dict, Any, Optional

import logging
import pandas as pd

from psycopg2 import connect
from dataclasses import dataclass
from elasticsearch import Elasticsearch
from sentence_transformers import SentenceTransformer

from app.models.schemas import PaperFilters

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class SearchType(Enum):
    CONTENT = "content"
    AUTHORS = "authors"
    COUNTRIES = "countries"
    INSTITUTIONS = "institutions"


@dataclass
class FilterWeights:
    authors: float = 1.0
    countries: float = 1.0
    institutions: float = 1.0
    query: float = 2.0



class DataFrameAdapter:
    @classmethod
    def adapt(cls, elasticsearch_response):
        data = {
            "id": [],
            "title": [],
            "text": [],
            "publication_date": [],
            "authors": [],
            "institution": [],
            "country": [],
            "citations": [],
            "citation_count": [],
            "publication_year": []    
        }
        
        for hit in elasticsearch_response:
            data["title"].append(hit["_source"]['title'])
            data["text"].append(hit["_source"]['abstract'])
            data["authors"].append(str(hit["_source"]['authors']))
            data["institution"].append(str(hit["_source"]['institutions']))
            data["country"].append(str(hit["_source"]['countries']))
            data["id"].append(hit["_source"]['paper_id'])
        
        
        conn = connect(
            dbname="arxiv_db",
            user="arxiv_user",
            password="arxiv_password",
            host="localhost",
            port="5432"
        )
        cur = conn.cursor()
        cur.execute(
            """
            select ar.id, ar.publication_date, array_agg(cm.cited_article_id) as citations, count(cm.cited_article_id) as citation_count,  extract(year from ar.publication_date) as year
            from articles ar
            left join citation_mappings cm 
            on ar.id = cm.citing_article_id 
            where ar.arxiv_id in %s
            group by ar.id
            """,
            (tuple(data["id"]),)
        )
        papers = cur.fetchall()
        
        cur.close()
        conn.close()

        data["id"] = []
        for (paper_id, publication_date, citations, citation_count, publication_year) in papers:
            data["id"].append(paper_id)
            data["publication_date"].append(publication_date)
            data["citations"].append(f"{citations}" if citations != [None] else "[]")
            data["citation_count"].append(citation_count)
            data["publication_year"].append(int(publication_year))

        return pd.DataFrame(data)


class HybridSearchEngine:
    def __init__(
        self, 
        elasticsearch_url: str = "http://localhost:9200",
        model_name: str = "sentence-transformers/all-MiniLM-L6-v2",
        index_name: str = "papers"
    ):
        self.index_name = index_name
        self.es = Elasticsearch(elasticsearch_url)
        self.model = SentenceTransformer(model_name, local_files_only=False)
        
        self._source_fields = [
            "paper_id", 
            "title", 
            "abstract", 
            "authors",
            "countries", 
            "institutions"
        ]
    
    def _build_content_query(self, query_text: str) -> Dict[str, Any]:
        if query_text == "*":
            return {"match_all": {}}
        
        return {
            "bool": {
                "should": [
                    {
                        "match_phrase": {
                            "title": {
                                "query": query_text,
                                "boost": 5.0
                            }
                        }
                    },
                    {
                        "match_phrase": {
                            "abstract": {
                                "query": query_text,
                                "boost": 3.0
                            }
                        }
                    },
                    {
                        "multi_match": {
                            "query": query_text,
                            "fields": ["title^3", "abstract^1.5"],
                            "type": "best_fields",
                            "operator": "and",
                            "boost": 2.5
                        }
                    },
                    {
                        "multi_match": {
                            "query": query_text,
                            "fields": ["title^2", "abstract^1"],
                            "type": "best_fields",
                            "operator": "and",
                            "fuzziness": "AUTO",
                            "boost": 1.5
                        }
                    },
                    {
                        "multi_match": {
                            "query": query_text,
                            "fields": ["title^1.5", "abstract^0.5"],
                            "type": "best_fields",
                            "operator": "or",
                            "boost": 1.0
                        }
                    }
                ]
            }
        }
    
    def _build_authors_query(self, query_text: str) -> Dict[str, Any]:
        return {
            "bool": {
                "should": [
                    {
                        "match_phrase": {
                            "authors": {
                                "query": query_text,
                                "boost": 4.0
                            }
                        }
                    },
                    {
                        "match": {
                            "authors": {
                                "query": query_text,
                                "operator": "and",
                                "boost": 3.0
                            }
                        }
                    },
                    {
                        "match": {
                            "authors": {
                                "query": query_text,
                                "operator": "and",
                                "fuzziness": "1",
                                "boost": 2.0
                            }
                        }
                    },
                    {
                        "wildcard": {
                            "authors": {
                                "value": f"*{query_text.lower()}*",
                                "boost": 1.0
                            }
                        }
                    }
                ]
            }
        }
    
    def _build_countries_query(self, countries: List[str]) -> Dict[str, Any]:
        return {
            "terms": {
                "countries": countries
            }
        }
    
    def _build_institutions_query(self, query_text: str) -> Dict[str, Any]:
        return {
            "bool": {
                "should": [
                    {
                        "match_phrase": {
                            "institutions": {
                                "query": query_text,
                                "boost": 4.0
                            }
                        }
                    },
                    {
                        "match": {
                            "institutions": {
                                "query": query_text,
                                "operator": "and",
                                "boost": 3.0
                            }
                        }
                    },
                    {
                        "match": {
                            "institutions": {
                                "query": query_text,
                                "operator": "and",
                                "fuzziness": "1",
                                "boost": 2.0
                            }
                        }
                    },
                    {
                        "wildcard": {
                            "institutions": {
                                "value": f"*{query_text.lower()}*",
                                "boost": 1.0
                            }
                        }
                    }
                ]
            }
        }
    
    def _get_query_by_type(self, query_text: str, search_type: SearchType) -> Dict[str, Any]:
        query_builders = {
            SearchType.CONTENT: self._build_content_query,
            SearchType.AUTHORS: self._build_authors_query,
            SearchType.COUNTRIES: lambda x: self._build_countries_query(x.split()),
            SearchType.INSTITUTIONS: self._build_institutions_query
        }
        return query_builders[search_type](query_text)
    
    def _search_with_document_ids(
        self, 
        query: Dict[str, Any], 
        document_ids: List[str], 
        size: int = 50
    ) -> List[Dict[str, Any]]:
        body = {
            "size": size,
            "_source": {"includes": self._source_fields},
            "query": {
                "bool": {
                    "must": [query],
                    "filter": {
                        "ids": {"values": document_ids}
                    }
                }
            }
        }
        
        response = self.es.search(index=self.index_name, body=body)
        return response["hits"]["hits"]
    
    def _semantic_search_with_document_ids(
        self,
        query_text: str,
        document_ids: List[str],
        size: int = 10,
        k: int = 256,
        num_candidates: int = 2048
    ) -> List[Dict[str, Any]]:
        query_vector = self.model.encode([query_text], normalize_embeddings=True)[0].tolist()
        
        body = {
            "size": size,
            "_source": {"includes": self._source_fields},
            "knn": {
                "field": "embedding",
                "query_vector": query_vector,
                "k": k,
                "num_candidates": num_candidates,
                "filter": {
                    "ids": {"values": document_ids}
                }
            }
        }
        
        response = self.es.search(index=self.index_name, body=body)
        return response["hits"]["hits"]
    
    def bm25_search(
        self, 
        query_text: str, 
        size: int = 50, 
        search_type: SearchType = SearchType.CONTENT,
        document_ids: Optional[List[str]] = None,
        min_score: Optional[float] = None
    ) -> List[Dict[str, Any]]:
        query = self._get_query_by_type(query_text, search_type)
        
        if document_ids:
            return self._search_with_document_ids(query, document_ids, size)
        
        body = {
            "size": size,
            "_source": {"includes": self._source_fields},
            "query": query
        }
        
        if min_score is not None:
            body["min_score"] = min_score
        
        response = self.es.search(index=self.index_name, body=body)
        results = response["hits"]["hits"]

        if len(results) < size and min_score is None and document_ids is None:
            logger.info(f"BM25 search returned only {len(results)} results, trying more liberal approaches")
            
            if len(results) < size:
                if search_type == SearchType.CONTENT:
                    liberal_query = {
                        "bool": {
                            "should": [
                                query,
                                {
                                    "bool": {
                                        "should": [
                                            {
                                                "terms": {
                                                    "title": query_text.lower().split(),
                                                    "boost": 0.8
                                                }
                                            },
                                            {
                                                "terms": {
                                                    "abstract": query_text.lower().split(),
                                                    "boost": 0.4
                                                }
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                else:
                    liberal_query = {
                        "bool": {
                            "should": [
                                query,
                                {
                                    "wildcard": {
                                        "title": {
                                            "value": f"*{query_text.lower()}*",
                                            "boost": 0.5
                                        }
                                    }
                                },
                                {
                                    "wildcard": {
                                        "abstract": {
                                            "value": f"*{query_text.lower()}*",
                                            "boost": 0.3
                                        }
                                    }
                                }
                            ]
                        }
                    }
                
                liberal_body = {
                    "size": size,
                    "_source": {"includes": self._source_fields},
                    "query": liberal_query
                }
                
                try:
                    liberal_response = self.es.search(index=self.index_name, body=liberal_body)
                    liberal_results = liberal_response["hits"]["hits"]
                    
                    existing_ids = {hit["_id"] for hit in results}
                    for hit in liberal_results:
                        if hit["_id"] not in existing_ids and len(results) < size:
                            results.append(hit)
                            existing_ids.add(hit["_id"])
                except Exception as e:
                    logger.warning(f"Liberal query failed: {e}")
            
            if len(results) < size:
                logger.info(f"Still only {len(results)} results, trying very broad match")
                broad_query = {
                    "bool": {
                        "should": [
                            {
                                "wildcard": {
                                    "title": {
                                        "value": f"*{query_text.lower()}*",
                                        "boost": 0.3
                                    }
                                }
                            },
                            {
                                "wildcard": {
                                    "abstract": {
                                        "value": f"*{query_text.lower()}*",
                                        "boost": 0.1
                                    }
                                }
                            }
                        ]
                    }
                }
                
                broad_body = {
                    "size": size,
                    "_source": {"includes": self._source_fields},
                    "query": broad_query
                }
                
                try:
                    broad_response = self.es.search(index=self.index_name, body=broad_body)
                    broad_results = broad_response["hits"]["hits"]
                    
                    existing_ids = {hit["_id"] for hit in results}
                    for hit in broad_results:
                        if hit["_id"] not in existing_ids and len(results) < size:
                            results.append(hit)
                            existing_ids.add(hit["_id"])
                except Exception as e:
                    logger.warning(f"Broad query failed: {e}")
        
        return results[:size]
    
    def semantic_search(
        self, 
        query_text: str, 
        size: int = 10, 
        k: int = 256, 
        num_candidates: int = 2048,
        document_ids: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        if document_ids:
            return self._semantic_search_with_document_ids(
                query_text, document_ids, size, k, num_candidates
            )
        
        query_vector = self.model.encode([query_text], normalize_embeddings=True)[0].tolist()
        
        body = {
            "size": size,
            "_source": {"includes": self._source_fields},
            "knn": {
                "field": "embedding",
                "query_vector": query_vector,
                "k": k,
                "num_candidates": num_candidates
            }
        }
        
        try:
            response = self.es.search(index=self.index_name, body=body)
            results = response["hits"]["hits"]
            
            if len(results) < size and document_ids is None:
                logger.info(f"Semantic search returned only {len(results)} results, trying with more candidates")
                
                body["knn"]["num_candidates"] = min(num_candidates * 2, 10000)
                body["knn"]["k"] = min(k * 2, 1000)
                
                try:
                    response = self.es.search(index=self.index_name, body=body)
                    results = response["hits"]["hits"]
                except Exception as e:
                    logger.warning(f"Extended semantic search failed: {e}")
            
            return results[:size]
            
        except Exception as e:
            logger.error(f"Semantic search failed: {str(e)}")
            return []
    
    def rrf_fusion(
        self, 
        bm25_hits: List[Dict[str, Any]], 
        semantic_hits: List[Dict[str, Any]], 
        k: int = 60, 
        final_size: int = 10,
        bm25_weight: float = 1.0,
        semantic_weight: float = 1.0
    ) -> List[Dict[str, Any]]:
        scores = {}
        
        def add_scores(hits: List[Dict[str, Any]], weight: float):
            for rank, hit in enumerate(hits, start=1):
                doc_id = hit["_id"]
                rrf_score = weight * (1.0 / (k + rank))
                scores[doc_id] = scores.get(doc_id, 0.0) + rrf_score
        
        add_scores(bm25_hits, bm25_weight)
        add_scores(semantic_hits, semantic_weight)
        
        docs_by_id = {hit["_id"]: hit for hit in bm25_hits + semantic_hits}
        
        fused_results = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:final_size]
        
        return [
            {"_id": doc_id, "rrf_score": score, **docs_by_id[doc_id]} 
            for doc_id, score in fused_results
        ]
    
    def _normalize_scores(self, hits: List[Dict[str, Any]]) -> Dict[str, float]:
        if not hits:
            return {}
        
        scores = [hit["_score"] for hit in hits]
        max_score = max(scores)
        min_score = min(scores)
        
        if max_score == min_score:
            return {hit["_id"]: 1.0 for hit in hits}
        
        normalized = {}
        for hit in hits:
            doc_id = hit["_id"]
            normalized_score = (hit["_score"] - min_score) / (max_score - min_score)
            normalized[doc_id] = normalized_score
        
        return normalized
    
    def _combine_filter_scores(
        self,
        filter_results: List[tuple[str, List[Dict[str, Any]], float]],
        final_document_ids: List[str]
    ) -> Dict[str, float]:
        combined_scores = {}
        
        for doc_id in final_document_ids:
            combined_scores[doc_id] = 0.0
        
        for filter_name, hits, weight in filter_results:
            normalized_scores = self._normalize_scores(hits)
            logger.debug(f"Filter '{filter_name}': {len(normalized_scores)} scored documents, weight={weight}")
            
            for doc_id in final_document_ids:
                if doc_id in normalized_scores:
                    filter_score = weight * normalized_scores[doc_id]
                    combined_scores[doc_id] += filter_score
        
        return combined_scores
    
    def _validate_filter_match(self, document: Dict[str, Any], filters: PaperFilters) -> bool:
        source = document.get('_source', {})
        
        def fuzzy_match(needle: str, haystack: str, max_distance: int = 1) -> bool:
            needle = needle.lower().strip()
            haystack = haystack.lower().strip()
            
            if needle in haystack:
                return True
            
            needle_words = needle.split()
            haystack_words = haystack.split()
            
            for needle_word in needle_words:
                for haystack_word in haystack_words:
                    if needle_word == haystack_word:
                        return True
                    
                    if len(needle_word) >= 3 and len(haystack_word) >= 3:
                        if abs(len(needle_word) - len(haystack_word)) <= max_distance:
                            differences = sum(1 for a, b in zip(needle_word, haystack_word) if a != b)
                            if differences <= max_distance and len(needle_word) == len(haystack_word):
                                return True
                            
                            if len(needle_word) == len(haystack_word) + 1:
                                for i in range(len(needle_word)):
                                    if needle_word[:i] + needle_word[i+1:] == haystack_word:
                                        return True
                            elif len(haystack_word) == len(needle_word) + 1:
                                for i in range(len(haystack_word)):
                                    if haystack_word[:i] + haystack_word[i+1:] == needle_word:
                                        return True
            
            return False
        
        if filters.author:
            authors = source.get('authors', [])
            author_match = False
            
            author_filters = filters.author if isinstance(filters.author, list) else [filters.author]
            
            if isinstance(authors, list):
                for filter_author in author_filters:
                    for author in authors:
                        if fuzzy_match(filter_author, author, max_distance=1):
                            author_match = True
                            break
                    if author_match:
                        break
            elif isinstance(authors, str):
                for filter_author in author_filters:
                    if fuzzy_match(filter_author, authors, max_distance=1):
                        author_match = True
                        break
            
            if not author_match:
                return False
        
        if filters.country:
            doc_countries = source.get('countries', [])
            if isinstance(doc_countries, list):
                country_match = any(country in doc_countries for country in filters.country)
            else:
                country_match = False
            
            if not country_match:
                return False
        
        if filters.location:
            institutions = source.get('institutions', [])
            institution_match = False
            
            location_filters = filters.location if isinstance(filters.location, list) else [filters.location]
            
            if isinstance(institutions, list):
                for filter_location in location_filters:
                    for institution in institutions:
                        if fuzzy_match(filter_location, institution, max_distance=1):
                            institution_match = True
                            break
                    if institution_match:
                        break
            elif isinstance(institutions, str):
                for filter_location in location_filters:
                    if fuzzy_match(filter_location, institutions, max_distance=1):
                        institution_match = True
                        break
            
            if not institution_match:
                return False
        
        return True

    def search_with_filters(
        self,
        filters: PaperFilters,
        query_text: Optional[str] = None,
        size: int = 10,
        bm25_size: int = 50,
        semantic_size: int = 50,
        use_hybrid: bool = True,
        filter_weights: Optional[FilterWeights] = None,
        **kwargs
    ) -> List[Dict[str, Any]]:
        if filter_weights is None:
            filter_weights = FilterWeights()
        
        current_document_ids = None
        filter_results = []
        
        if filters.author:
            author_query = " ".join(filters.author) if isinstance(filters.author, list) else filters.author
            logger.info(f"Filtering by authors: {author_query}")
            results = self.bm25_search(
                author_query, 
                size=size,
                search_type=SearchType.AUTHORS
            )
            validated_results = []
            for result in results:
                temp_filter = PaperFilters(
                    author=filters.author,
                    location=[],
                    country=[],
                    year_range=None,
                    max_nodes=100
                )
                if self._validate_filter_match(result, temp_filter):
                    validated_results.append(result)
            
            current_document_ids = [hit["_id"] for hit in validated_results]
            filter_results.append(("authors", validated_results, filter_weights.authors))
            logger.info(f"Found {len(current_document_ids)} papers with matching authors")
        
        if filters.country:
            logger.info(f"Filtering by countries: {filters.country}")
            results = self.bm25_search(
                " ".join(filters.country),
                size=size,
                search_type=SearchType.COUNTRIES,
                document_ids=current_document_ids
            )
            validated_results = []
            for result in results:
                temp_filter = PaperFilters(
                    country=filters.country,
                    author=[],
                    location=[],
                    year_range=None,
                    max_nodes=100
                )
                if self._validate_filter_match(result, temp_filter):
                    validated_results.append(result)
            
            current_document_ids = [hit["_id"] for hit in validated_results]
            filter_results.append(("countries", validated_results, filter_weights.countries))
            logger.info(f"Found {len(current_document_ids)} papers with matching countries")
        
        if filters.location:
            location_query = " ".join(filters.location) if isinstance(filters.location, list) else filters.location
            logger.info(f"Filtering by institutions: {location_query}")
            results = self.bm25_search(
                location_query,
                size=size,
                search_type=SearchType.INSTITUTIONS,
                document_ids=current_document_ids
            )
            validated_results = []
            for result in results:
                temp_filter = PaperFilters(
                    location=filters.location,
                    author=[],
                    country=[],
                    year_range=None,
                    max_nodes=100
                )
                if self._validate_filter_match(result, temp_filter):
                    validated_results.append(result)
            
            current_document_ids = [hit["_id"] for hit in validated_results]
            filter_results.append(("institutions", validated_results, filter_weights.institutions))
            logger.info(f"Found {len(current_document_ids)} papers with matching institutions")
        
        if query_text:
            logger.info(f"Searching content with query: {query_text}")
            if current_document_ids:
                logger.debug(f"Searching within {len(current_document_ids)} filtered documents")
            
            if use_hybrid:
                bm25_hits = self.bm25_search(
                    query_text,
                    size=bm25_size,
                    search_type=SearchType.CONTENT,
                    document_ids=current_document_ids
                )
                semantic_hits = self.semantic_search(
                    query_text,
                    size=semantic_size,
                    document_ids=current_document_ids
                )
                content_results = self.rrf_fusion(bm25_hits, semantic_hits, final_size=size*3, **kwargs)
                content_hits = [{"_id": r["_id"], "_score": r["rrf_score"]} for r in content_results]
            else:
                content_hits = self.bm25_search(
                    query_text,
                    size=size*3,
                    search_type=SearchType.CONTENT,
                    document_ids=current_document_ids
                )
            
            filter_results.append(("content_query", content_hits, filter_weights.query))
            final_document_ids = [hit["_id"] for hit in content_hits[:size*2]]
            logger.info(f"Content search found {len(content_hits)} matches")
        else:
            final_document_ids = current_document_ids[:size*2] if current_document_ids else []
        
        if not final_document_ids:
            logger.warning("No documents found matching all criteria")
            return []
        
        combined_scores = self._combine_filter_scores(filter_results, final_document_ids)
        sorted_docs = sorted(combined_scores.items(), key=lambda x: x[1], reverse=True)[:size]
        
        final_doc_ids = [doc_id for doc_id, _ in sorted_docs]
        body = {
            "size": len(final_doc_ids),
            "_source": {"includes": self._source_fields},
            "query": {
                "ids": {"values": final_doc_ids}
            }
        }
        
        response = self.es.search(index=self.index_name, body=body)
        docs_by_id = {hit["_id"]: hit for hit in response["hits"]["hits"]}
        
        final_results = []
        for doc_id, combined_score in sorted_docs:
            if doc_id in docs_by_id:
                doc = docs_by_id[doc_id]
                if self._validate_filter_match(doc, filters):
                    result = doc.copy()
                    result["combined_filter_score"] = combined_score
                    final_results.append(result)
                else:
                    logger.warning(f"Filtered out document {doc_id} - failed final validation")
        
        if len(final_results) < size:
            logger.info(f"Found {len(final_results)} results after filtering, but requested {size}. This is normal for filtered searches - returning original filtered results.")
        
        logger.info(f"Returning {len(final_results)} final results")
        return final_results
    
    def search(
        self, 
        query_text: Optional[str] = None,
        search_type: SearchType = SearchType.CONTENT,
        size: int = 10,
        bm25_size: int = 50,
        semantic_size: int = 50,
        use_hybrid: bool = True,
        filters: Optional[PaperFilters] = None,
        filter_weights: Optional[FilterWeights] = None,
        **kwargs
    ) -> pd.DataFrame:
        if filters:
            return DataFrameAdapter.adapt(
                    self.search_with_filters(
                    filters, query_text, size, bm25_size, semantic_size, use_hybrid, filter_weights, **kwargs
                )
            )
        
        if not query_text:
            logger.info("No query provided, using match_all to get all papers")
            query_text = "*"
            use_hybrid = False
            
        if search_type == SearchType.CONTENT and use_hybrid:
            bm25_hits = self.bm25_search(query_text, size=bm25_size, search_type=search_type)
            semantic_hits = self.semantic_search(query_text, size=semantic_size)
            
            fused_results = self.rrf_fusion(bm25_hits, semantic_hits, final_size=size, **kwargs)
            
            return DataFrameAdapter.adapt(fused_results[:size])
        
        else:
            results = self.bm25_search(query_text, size=size, search_type=search_type)
            return DataFrameAdapter.adapt(results[:size])