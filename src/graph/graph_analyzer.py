import networkx as nx


class KnowledgeGraphAnalyzer:
    def __init__(self, graph, topic_model):
        self.G = graph 
        self.original_graph = graph
        self.topic_model = topic_model

        self._active_filters = {}
    
    def filter_graph(self, **filters):
        """Filter the graph based on multiple criteria
        
        Args:
            location: list of institution names to filter by
            author: list of author names to filter by
            country: list of country names to filter by
            topic: list of topic numbers to filter by
            year_range: tuple of (start_year, end_year) to filter by publication year
            paper_title: list of exact paper titles to filter by
        
        Returns:
            KnowledgeGraphAnalyzer: Returns self for method chaining
        """
        self._active_filters = filters
        filtered_papers = self._get_filtered_papers_multi(**filters)
        
        if not filtered_papers:
            self.G = self.original_graph.subgraph([]).copy()
        
        else:
            nodes_to_keep = set(filtered_papers)
            
            for paper in filtered_papers:
                for neighbor in self.original_graph.neighbors(paper):
                    nodes_to_keep.add(neighbor)
                    
                for predecessor in self.original_graph.predecessors(paper):
                    nodes_to_keep.add(predecessor)
            
            self.G = self.original_graph.subgraph(nodes_to_keep).copy()
        
        return self
    
    def reset_filter(self):
        """Reset to the original unfiltered graph
        
        Returns:
            KnowledgeGraphAnalyzer: Returns self for method chaining
        """
        self.G = self.original_graph
        self._active_filters = {}
        return self
    
    def get_active_filters(self):
        """Return currently active filters"""
        return self._active_filters.copy()
    
    def _get_filtered_papers_multi(self, **filters):
        """Get papers that match multiple filter criteria (AND logic)"""
        all_papers = set([n for n, d in self.original_graph.nodes(data=True) if d.get('type') == 'paper'])
        filtered_papers = all_papers.copy()

        if 'location' in filters and filters['location']:
            location_papers = set()
            filter_set = set(filters['location'])
            
            for paper in all_papers:
                for u, v, data in self.original_graph.edges(paper, data=True):
                    if (
                        data.get('relationship') == 'affiliated_with' and 
                        v in self.original_graph.nodes and 
                        self.original_graph.nodes[v].get('name') in filter_set
                    ):
                        location_papers.add(paper)
                        break
                    
            filtered_papers = filtered_papers.intersection(location_papers)

        if 'author' in filters and filters['author']:
            author_papers = set()
            filter_set = set(filters['author'])
            
            for paper in all_papers:
                for u, v, data in self.original_graph.in_edges(paper, data=True):
                    if (
                        data.get('relationship') == 'authored' and 
                        u in self.original_graph.nodes and
                        self.original_graph.nodes[u].get('name') in filter_set
                    ):
                        author_papers.add(paper)
                        break
                    
            filtered_papers = filtered_papers.intersection(author_papers)

        if 'country' in filters and filters['country']:
            country_papers = set()
            filter_set = set(filters['country'])
            
            for paper in all_papers:
                for u, v, data in self.original_graph.edges(paper, data=True):
                    if (
                        data.get('relationship') == 'from_country' and 
                        v in self.original_graph.nodes and
                        self.original_graph.nodes[v].get('name') in filter_set
                    ):
                        country_papers.add(paper)
                        break
                    
            filtered_papers = filtered_papers.intersection(country_papers)

        if 'topic' in filters and filters['topic']:
            topic_papers = set()
            topic_set = set([f"topic_{t}" for t in filters['topic']])
            
            for paper in all_papers:
                for u, v, data in self.original_graph.edges(paper, data=True):
                    if (data.get('relationship') == 'belongs_to_topic' and v in topic_set):
                        topic_papers.add(paper)
                        break
            
            filtered_papers = filtered_papers.intersection(topic_papers)

        if 'year_range' in filters and filters['year_range']:
            year_papers = set()
            start_year, end_year = filters['year_range']
            
            for paper in all_papers:
                if paper in self.original_graph.nodes:
                    paper_year = self.original_graph.nodes[paper].get('publication_year')
                    if paper_year and start_year <= paper_year <= end_year:
                        year_papers.add(paper)
        
            filtered_papers = filtered_papers.intersection(year_papers)

        if 'paper_title' in filters and filters['paper_title']:
            title_papers = set()
            filter_set = set(filters['paper_title'])
            
            for paper in all_papers:
                if paper in self.original_graph.nodes:
                    paper_title = self.original_graph.nodes[paper].get('title')
                    if paper_title and paper_title in filter_set:
                        title_papers.add(paper)
            
            filtered_papers = filtered_papers.intersection(title_papers)
        
        return list(filtered_papers)
    
    def get_basic_stats(self):
        """Return basic statistics about the graph"""
        num_years = len([n for n, d in self.G.nodes(data=True) if d.get('type') == 'year'])
        num_topics = len([n for n, d in self.G.nodes(data=True) if d.get('type') == 'topic'])
        num_papers = len([n for n, d in self.G.nodes(data=True) if d.get('type') == 'paper'])
        num_authors = len([n for n, d in self.G.nodes(data=True) if d.get('type') == 'author'])
        num_countries = len([n for n, d in self.G.nodes(data=True) if d.get('type') == 'country'])
        num_institutions = len([n for n, d in self.G.nodes(data=True) if d.get('type') == 'institution'])
        
        return {
            "num_papers": num_papers,
            "num_authors": num_authors,
            "num_institutions": num_institutions,
            "num_countries": num_countries,
            "num_topics": num_topics,
            "num_years": num_years
        }
    
    def get_most_cited_papers(self, top_n=10):
        """Return the top N most cited papers with authors and year"""
        citation_counts = {}
        for node, data in self.G.nodes(data=True):
            if data.get('type') == 'paper':
                citation_counts[node] = data.get('citation_count', 0)
                
        sorted_citations = sorted(citation_counts.items(), key=lambda x: x[1], reverse=True)

        result = []

        for paper_node_id, count in sorted_citations[:top_n]:
            paper_data = self.G.nodes.get(paper_node_id, {})
            paper_title = paper_data.get('title', paper_node_id.replace('paper_', ''))
            
            authors = []
            for u, v, data in self.G.in_edges(paper_node_id, data=True):
                if data.get('relationship') == 'authored':
                    author_data = self.G.nodes.get(u, {})
                    author_name = author_data.get('name', u.replace('author_', ''))
                    authors.append(author_name)

            year = paper_data.get('publication_year')
            
            result.append((paper_node_id, paper_title, count, authors, year))

        return result
    
    def get_top_authors(self, top_n=10, by='paper'):
        """Return the top N authors by number of papers or citations
        
        Args:
            top_n (int): Number of top authors to return
            by (str): 'paper' to count by number of papers, 'citations' to count by total citations
        
        Returns:
            list: List of tuples (author_name, count)
        """
        if by == 'paper':
            author_papers = {}
            
            papers = [n for n, d in self.G.nodes(data=True) if d.get('type') == 'paper']
            
            for paper in papers:
                paper_authors = set()
                for u, v, data in self.G.in_edges(paper, data=True):
                    if data.get('relationship') == 'authored':
                        paper_authors.add(u)
                
                for author in paper_authors:
                    if author not in author_papers:
                        author_papers[author] = set()
                    author_papers[author].add(paper)
            
            author_counts = {author: len(papers) for author, papers in author_papers.items()}
            
        elif by == 'citations':
            author_citations = {}
            
            papers = [n for n, d in self.G.nodes(data=True) if d.get('type') == 'paper']
            
            for paper in papers:
                paper_authors = set()
                for u, v, data in self.G.in_edges(paper, data=True):
                    if data.get('relationship') == 'authored':
                        paper_authors.add(u)

                paper_data = self.G.nodes.get(paper, {})
                citation_count = paper_data.get('citation_count', 0)

                for author in paper_authors:
                    if author not in author_citations:
                        author_citations[author] = 0
                    author_citations[author] += citation_count
            
            author_counts = author_citations
            
        else:
            raise ValueError("Parameter 'by' must be either 'paper' or 'citations'")
        
        sorted_authors = sorted(author_counts.items(), key=lambda x: x[1], reverse=True)

        result = []
        for author_node_id, count in sorted_authors[:top_n]:
            author_data = self.G.nodes.get(author_node_id, {})
            author_name = author_data.get('name', author_node_id.replace('author_', ''))
            result.append((author_name, count))
        
        return result
    
    def get_top_countries(self, top_n=10, by='paper'):
        """Return the top N countries by number of papers or citations
        
        Args:
            top_n (int): Number of top countries to return
            by (str): 'paper' to count by number of papers, 'citations' to count by total citations
        
        Returns:
            list: List of tuples (country_name, count)
        """
        if by == 'paper':
            country_papers = {}
            
            papers = [n for n, d in self.G.nodes(data=True) if d.get('type') == 'paper']
            
            for paper in papers:
                paper_countries = set()
                for u, v, data in self.G.edges(paper, data=True):
                    if data.get('relationship') == 'from_country':
                        paper_countries.add(v)
                
                for country in paper_countries:
                    if country not in country_papers:
                        country_papers[country] = set()
                    country_papers[country].add(paper)
            
            country_counts = {country: len(papers) for country, papers in country_papers.items()}
            
        elif by == 'citations':
            country_citations = {}
            
            papers = [n for n, d in self.G.nodes(data=True) if d.get('type') == 'paper']
            
            for paper in papers:
                paper_countries = set()
                for u, v, data in self.G.edges(paper, data=True):
                    if data.get('relationship') == 'from_country':
                        paper_countries.add(v)

                paper_data = self.G.nodes.get(paper, {})
                citation_count = paper_data.get('citation_count', 0)

                for country in paper_countries:
                    if country not in country_citations:
                        country_citations[country] = 0
                    country_citations[country] += citation_count
            
            country_counts = country_citations
            
        else:
            raise ValueError("Parameter 'by' must be either 'paper' or 'citations'")
        
        sorted_countries = sorted(country_counts.items(), key=lambda x: x[1], reverse=True)

        result = []
        for country_node_id, count in sorted_countries[:top_n]:
            country_data = self.G.nodes.get(country_node_id, {})
            country_name = country_data.get('name', country_node_id.replace('country_', ''))
            result.append((country_name, count))
        
        return result
    
    def get_top_institutions(self, top_n=10, by='paper'):
        """Return the top N institutions by number of papers or citations
        
        Args:
            top_n (int): Number of top institutions to return
            by (str): 'paper' to count by number of papers, 'citations' to count by total citations
        
        Returns:
            list: List of tuples (institution_name, count)
        """
        if by == 'paper':
            institution_papers = {}
            
            papers = [n for n, d in self.G.nodes(data=True) if d.get('type') == 'paper']
            
            for paper in papers:
                paper_institutions = set()
                for u, v, data in self.G.edges(paper, data=True):
                    if data.get('relationship') == 'affiliated_with':
                        paper_institutions.add(v)
                
                for institution in paper_institutions:
                    if institution not in institution_papers:
                        institution_papers[institution] = set()
                    institution_papers[institution].add(paper)
            
            institution_counts = {institution: len(papers) for institution, papers in institution_papers.items()}
            
        elif by == 'citations':
            institution_citations = {}
            
            papers = [n for n, d in self.G.nodes(data=True) if d.get('type') == 'paper']
            
            for paper in papers:
                paper_institutions = set()
                for u, v, data in self.G.edges(paper, data=True):
                    if data.get('relationship') == 'affiliated_with':
                        paper_institutions.add(v)

                paper_data = self.G.nodes.get(paper, {})
                citation_count = paper_data.get('citation_count', 0)

                for institution in paper_institutions:
                    if institution not in institution_citations:
                        institution_citations[institution] = 0
                    institution_citations[institution] += citation_count
            
            institution_counts = institution_citations
            
        else:
            raise ValueError("Parameter 'by' must be either 'paper' or 'citations'")
        
        sorted_institutions = sorted(institution_counts.items(), key=lambda x: x[1], reverse=True)

        result = []
        for institution_node_id, count in sorted_institutions[:top_n]:
            institution_data = self.G.nodes.get(institution_node_id, {})
            institution_name = institution_data.get('name', institution_node_id.replace('institution_', ''))
            result.append((institution_name, count))
        
        return result
    
    def get_topic_distribution(self):
        """Return the distribution of topics across papers"""
        topic_papers = {}
        
        papers = [n for n, d in self.G.nodes(data=True) if d.get('type') == 'paper']
        
        for paper in papers:
            paper_topics = set()
            for u, v, data in self.G.edges(paper, data=True):
                if data.get('relationship') == 'belongs_to_topic':
                    paper_topics.add(v)
            
            for topic in paper_topics:
                if topic not in topic_papers:
                    topic_papers[topic] = set()
                topic_papers[topic].add(paper)

        topic_counts = {topic: len(papers) for topic, papers in topic_papers.items()}

        clean_topic_counts = {}
        for topic_node_id, count in topic_counts.items():
            clean_topic_id = topic_node_id.replace('topic_', '') if topic_node_id.startswith('topic_') else str(topic_node_id)
            clean_topic_counts[clean_topic_id] = count
        
        return clean_topic_counts
    
    def get_topics_trend_over_time(self):
        """Return the trend of topics over years"""
        topic_year_counts = {}
        
        papers = [n for n, d in self.G.nodes(data=True) if d.get('type') == 'paper']
        
        for paper in papers:
            year = None
            for u, v, data in self.G.edges(paper, data=True):
                if data.get('relationship') == 'published_in':
                    year = self.G.nodes[v].get('year')
                    break
            
            if year is not None:
                paper_topics = set()
                for u, v, data in self.G.edges(paper, data=True):
                    if data.get('relationship') == 'belongs_to_topic':
                        paper_topics.add(v)
                
                for topic_id in paper_topics:
                    if topic_id not in topic_year_counts:
                        topic_year_counts[topic_id] = {}
                    topic_year_counts[topic_id][year] = topic_year_counts[topic_id].get(year, 0) + 1
        
        return topic_year_counts
    
    def get_complete_network(self):
        """Return the full knowledge graph including all nodes (papers, authors, institutions, countries, topics, etc.)"""
        return self.G.copy()
    
    def get_author_collaboration_network(self):
        """Return a subgraph of the author collaboration network with normalized weights"""
        collaboration_counts = {}
        authors_in_network = set()

        papers_to_consider = [n for n, d in self.G.nodes(data=True) if d.get('type') == 'paper']

        for paper in papers_to_consider:
            authors = [u for u, v, data in self.G.in_edges(paper, data=True) if data.get('relationship') == 'authored']
            authors_in_network.update(authors)
            for i in range(len(authors)):
                for j in range(i + 1, len(authors)):
                    pair = tuple(sorted([authors[i], authors[j]]))
                    collaboration_counts[pair] = collaboration_counts.get(pair, 0) + 1

        if collaboration_counts:
            max_count = max(collaboration_counts.values())
        else:
            max_count = 1

        collab_network = nx.Graph()

        for author in authors_in_network:
            if self.G.has_node(author):
                collab_network.add_node(author, **self.G.nodes[author])
            else:
                collab_network.add_node(author, type='author', name=author.replace('author_', ''))

        for (author1, author2), count in collaboration_counts.items():
            weight = count / max_count if max_count > 0 else 0
            collab_network.add_edge(author1, author2, weight=weight  , count=count)

        return collab_network

    def get_institution_collaboration_network(self):
        """Return a subgraph of the institution collaboration network with normalized weights"""
        collaboration_counts = {}
        institutions_in_network = set()

        papers_to_consider = [n for n, d in self.G.nodes(data=True) if d.get('type') == 'paper']

        for paper in papers_to_consider:
            institutions = [v for u, v, data in self.G.edges(paper, data=True) if data.get('relationship') == 'affiliated_with']
            institutions_in_network.update(institutions)
            for i in range(len(institutions)):
                for j in range(i + 1, len(institutions)):
                    pair = tuple(sorted([institutions[i], institutions[j]]))
                    collaboration_counts[pair] = collaboration_counts.get(pair, 0) + 1

        if collaboration_counts:
            max_count = max(collaboration_counts.values())
        else:
            max_count = 1

        collab_network = nx.Graph()

        for institution in institutions_in_network:
            if self.G.has_node(institution):
                collab_network.add_node(institution, **self.G.nodes[institution])
            else:
                collab_network.add_node(institution, type='institution', name=institution.replace('institution_', ''))

        for (inst1, inst2), count in collaboration_counts.items():
            weight = count / max_count if max_count > 0 else 0
            collab_network.add_edge(inst1, inst2, weight=weight  , count=count)

        return collab_network
    
    def get_country_collaboration_network(self):
        """Return a subgraph of the country collaboration network with normalized weights"""
        collaboration_counts = {}
        countries_in_network = set()

        papers_to_consider = [n for n, d in self.G.nodes(data=True) if d.get('type') == 'paper']

        for paper in papers_to_consider:
            countries = [v for u, v, data in self.G.edges(paper, data=True) if data.get('relationship') == 'from_country']
            countries_in_network.update(countries)
            for i in range(len(countries)):
                for j in range(i + 1, len(countries)):
                    pair = tuple(sorted([countries[i], countries[j]]))
                    collaboration_counts[pair] = collaboration_counts.get(pair, 0) + 1
        
        if collaboration_counts:
            max_count = max(collaboration_counts.values())
        else:
            max_count = 1

        collab_network = nx.Graph()

        for country in countries_in_network:
            if self.G.has_node(country):
                collab_network.add_node(country, **self.G.nodes[country])
            else:
                collab_network.add_node(country, type='country', name=country.replace('country_', ''))

        for (country1, country2), count in collaboration_counts.items():
            weight = count / max_count if max_count > 0 else 0
            collab_network.add_edge(country1, country2, weight=weight  , count=count)

        return collab_network
    
    def get_topic_wordcloud_data(self, max_words=50, exclude_outliers=True):
        """Return data for plotting topic wordclouds"""
        if self.topic_model is None:
            raise ValueError("Topic model not provided. Cannot generate wordcloud data.")
        
        topics_data = []
        all_topics = self.topic_model.get_topics()
        
        for topic_id, topic_words in all_topics.items():
            if exclude_outliers and topic_id == -1:
                continue

            top_words = [word.capitalize() for word, _ in topic_words[:3]]
            topic_label = f"{', '.join(top_words)}"

            words_data = []
            for word, weight in topic_words[:max_words]:
                words_data.append({
                    'word': word,
                    'weight': float(weight)
                })
            
            topics_data.append({
                'topic_id': topic_id,
                'topic_label': topic_label,
                'words': words_data
            })
        
        topics_data.sort(key=lambda x: x['topic_id'])
        
        return topics_data