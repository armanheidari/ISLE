import ast
import pandas as pd
import networkx as nx


class PaperKnowledgeGraph:
    def __init__(self, df, topic_model):
        self.df = df
        self.topic_model = topic_model
        
        self.G = nx.MultiDiGraph()
        
    def _parse_list_like(self, val):
        """Return a clean list from a variety of list-like string formats."""
        if pd.isna(val) or str(val).strip() == "":
            return []
        
        s = val
        try:
            parsed = ast.literal_eval(s)
            if isinstance(parsed, (list, tuple)):
                return [str(x).strip() for x in parsed if x is not None and str(x).strip() != ""]
            return [str(parsed).strip()]
        
        except Exception:
            s = str(s).strip()
            if s.startswith('[') and s.endswith(']'):
                s = s[1:-1]
            return [it.strip().strip("'\"") for it in s.split(',') if it.strip()]
        
    def build(self):
        """Build comprehensive knowledge graph from the dataset"""

        self._add_paper_nodes()
        self._add_author_relationships()
        self._add_institution_relationships()
        self._add_topic_relationships()
        self._add_country_relationships()
        self._add_temporal_relationships()
        self._add_citation_relationships()
        self._add_total_citations_to_entities()
        return self.G
    
    def fast_build(self):
        """Faster builder using pandas vectorized ops and batch NetworkX updates."""

        paper_nodes = [
            (
                f"paper_{row['id']}",
                {
                    'type': 'paper',
                    'title': row.get('title', ''),
                    'publication_year': row['publication_year'],
                    'citation_count': int(row.get('citation_count', 0) or 0),
                    'topic': row.get('topic', -1),
                    'topic_probability': float(row.get('probability', 0.0) or 0.0)
                }
            )
            for _, row in self.df.iterrows()
        ]
        self.G.add_nodes_from(paper_nodes)

        paper_id_set = set(self.df['id'].astype(str).values)
        id_to_citations = dict(self.df.set_index(self.df['id'].astype(str))['citation_count'].fillna(0).astype(int))

        df = self.df.copy()
        df['parsed_authors'] = df['authors'].apply(self._parse_list_like)
        df['parsed_institutions'] = df['institution'].apply(self._parse_list_like)
        df['parsed_countries'] = df['country'].apply(self._parse_list_like)
        df['parsed_citations'] = df['citations'].apply(self._parse_list_like)

        authors_exploded = df[['id', 'parsed_authors', 'citation_count']].explode('parsed_authors')
        authors_exploded = authors_exploded[authors_exploded['parsed_authors'].notna() & (authors_exploded['parsed_authors'] != '')]

        author_nodes = {(f"author_{name}"): {'type': 'author', 'name': name} for name in authors_exploded['parsed_authors'].unique()}
        self.G.add_nodes_from([(n, attrs) for n, attrs in author_nodes.items()])

        authored_edges = [
            (f"author_{row['parsed_authors']}", f"paper_{row['id']}", {'relationship': 'authored'})
            for _, row in authors_exploded.iterrows()
        ]
        self.G.add_edges_from(authored_edges)

        inst_exploded = df[['id', 'parsed_institutions', 'citation_count']].explode('parsed_institutions')
        inst_exploded = inst_exploded[inst_exploded['parsed_institutions'].notna() & (inst_exploded['parsed_institutions'] != '')]

        institution_nodes = {f"institution_{name}": {'type': 'institution', 'name': name} for name in inst_exploded['parsed_institutions'].unique()}
        self.G.add_nodes_from([(n, attrs) for n, attrs in institution_nodes.items()])

        inst_edges = [
            (f"paper_{row['id']}", f"institution_{row['parsed_institutions']}", {'relationship': 'affiliated_with'})
            for _, row in inst_exploded.iterrows()
        ]
        self.G.add_edges_from(inst_edges)

        country_exploded = df[['id', 'parsed_countries', 'citation_count']].explode('parsed_countries')
        country_exploded = country_exploded[country_exploded['parsed_countries'].notna() & (country_exploded['parsed_countries'] != '')]

        country_nodes = {f"country_{name}": {'type': 'country', 'name': name} for name in country_exploded['parsed_countries'].unique()}
        self.G.add_nodes_from([(n, attrs) for n, attrs in country_nodes.items()])

        country_edges = [
            (f"paper_{row['id']}", f"country_{row['parsed_countries']}", {'relationship': 'from_country'})
            for _, row in country_exploded.iterrows()
        ]
        self.G.add_edges_from(country_edges)

        topic_info = self.topic_model.get_topic_info()
        topic_nodes = []
        for _, topic_row in topic_info.iterrows():
            topic_id = f"topic_{topic_row['Topic']}"
            topic_words = [word.capitalize() for word, _ in self.topic_model.get_topic(topic_row['Topic'])[:10]]
            
            topic_nodes.append(
                (
                    topic_id, 
                    {
                        'type': 'topic',
                        'topic_number': topic_row['Topic'],
                        'count': topic_row['Count'],
                        'name': topic_row.get('Name', f"Topic {topic_row['Topic']}"),
                        'keywords': topic_words
                    }
                )
            )
        self.G.add_nodes_from(topic_nodes)

        topic_edges = []
        for _, row in df.iterrows():
            if row.get('topic', -1) != -1:
                topic_edges.append((f"paper_{row['id']}", f"topic_{row['topic']}", {'relationship': 'belongs_to_topic', 'probability': float(row.get('probability', 0.0) or 0.0)}))
                
        self.G.add_edges_from(topic_edges)

        year_groups = df.groupby('publication_year')
        year_nodes = []
        year_edges = []
    
        for year, group in year_groups:
            year_id = f"year_{year}"
            year_nodes.append((year_id, {'type': 'year', 'year': year, 'paper_count': len(group)}))
            for pid in group['id'].astype(str).values:
                year_edges.append((f"paper_{pid}", year_id, {'relationship': 'published_in'}))
        
        self.G.add_nodes_from(year_nodes)
        self.G.add_edges_from(year_edges)

        cit_exploded = df[['id', 'parsed_citations']].explode('parsed_citations')
        cit_exploded = cit_exploded[cit_exploded['parsed_citations'].notna() & (cit_exploded['parsed_citations'] != '')]
        cit_exploded['parsed_citations'] = cit_exploded['parsed_citations'].astype(str)

        cit_edges = [
            (f"paper_{citer}", f"paper_{row['id']}", {'relationship': 'cites'})
            for _, row in cit_exploded.iterrows()
            for citer in [row['parsed_citations']]
            if citer in paper_id_set
        ]
        self.G.add_edges_from(cit_edges)


        if not authors_exploded.empty:
            authors_exploded['citation_count'] = authors_exploded['citation_count'].fillna(0).astype(int)
            author_totals = authors_exploded.groupby('parsed_authors')['citation_count'].sum()
            for name, tot in author_totals.items():
                node = f"author_{name}"
                if self.G.has_node(node):
                    self.G.nodes[node]['total_citations'] = int(tot)

        if not inst_exploded.empty:
            inst_exploded['citation_count'] = inst_exploded['citation_count'].fillna(0).astype(int)
            inst_totals = inst_exploded.groupby('parsed_institutions')['citation_count'].sum()
            for name, tot in inst_totals.items():
                node = f"institution_{name}"
                if self.G.has_node(node):
                    self.G.nodes[node]['total_citations'] = int(tot)

        if not country_exploded.empty:
            country_exploded['citation_count'] = country_exploded['citation_count'].fillna(0).astype(int)
            country_totals = country_exploded.groupby('parsed_countries')['citation_count'].sum()
            for name, tot in country_totals.items():
                node = f"country_{name}"
                if self.G.has_node(node):
                    self.G.nodes[node]['total_citations'] = int(tot)

        return self.G

    def _add_total_citations_to_entities(self):
        """Aggregate and set total_citations for author, institution, and country nodes"""
        for node in self.G.nodes:
            node_data = self.G.nodes[node]
            if node_data.get('type') == 'author':
                total_citations = 0
            
                for _, paper, edge_data in self.G.out_edges(node, data=True):
                    if edge_data.get('relationship') == 'authored':
                        paper_data = self.G.nodes[paper]
                        total_citations += int(paper_data.get('citation_count', 0))
        
                node_data['total_citations'] = total_citations

        for node in self.G.nodes:
            node_data = self.G.nodes[node]
            if node_data.get('type') == 'institution':
                total_citations = 0
                
                for paper, _, edge_data in self.G.in_edges(node, data=True):
                    if edge_data.get('relationship') == 'affiliated_with':
                        paper_data = self.G.nodes[paper]
                        total_citations += int(paper_data.get('citation_count', 0))
                
                node_data['total_citations'] = total_citations

        for node in self.G.nodes:
            node_data = self.G.nodes[node]
            if node_data.get('type') == 'country':
                total_citations = 0

                for paper, _, edge_data in self.G.in_edges(node, data=True):
                    if edge_data.get('relationship') == 'from_country':
                        paper_data = self.G.nodes[paper]
                        total_citations += int(paper_data.get('citation_count', 0))
                    
                node_data['total_citations'] = total_citations
    
    def _add_paper_nodes(self):
        """Add paper nodes with attributes"""
        for idx, row in self.df.iterrows():
            paper_id = f"paper_{row['id']}"
            self.G.add_node(
                paper_id,
                type='paper',
                title=row.get('title', ''),
                publication_year=row['publication_year'],
                citation_count=row.get('citation_count', 0),
                topic=row.get('topic', -1),
                topic_probability=row.get('probability', 0.0)
            )
    
    def _add_author_relationships(self):
        """Add author nodes and authorship relationships"""
        for idx, row in self.df.iterrows():
            paper_id = f"paper_{row['id']}"
            
            if pd.notna(row['authors']):
                try:
                    authors_str = str(row['authors']).strip()
                    
                    authors_str = authors_str[1:-1]
                    authors = [author.strip().strip("'\"") for author in authors_str.split(',')]
                    authors = [author for author in authors if author and author != '']

                    for author in authors:
                        if author:
                            author_id = f"author_{author}"

                            if not self.G.has_node(author_id):
                                self.G.add_node(author_id, type='author', name=author)
                            
                            self.G.add_edge(author_id, paper_id, relationship='authored')
                        
                except Exception as e:
                    print(f"Error parsing authors for paper {row['id']}: {e}")
                    continue

    def _add_institution_relationships(self):
        """Add institution nodes and affiliations"""
        for idx, row in self.df.iterrows():
            paper_id = f"paper_{row['id']}"
            
            if pd.notna(row['institution']):
                try:
                    institutions_str = str(row['institution']).strip()

                    institutions_str = institutions_str[1:-1]
                    institutions = [inst.strip().strip("'\"") for inst in institutions_str.split(',')]
                    institutions = [inst for inst in institutions if inst and inst != '']

                    for institution in institutions:
                        if institution: 
                            institution_id = f"institution_{institution}"

                            if not self.G.has_node(institution_id):
                                self.G.add_node(institution_id, type='institution', name=institution)

                            self.G.add_edge(paper_id, institution_id, relationship='affiliated_with')
                        
                except Exception as e:
                    print(f"Error parsing institutions for paper {row['id']}: {e}")
                    continue

    def _add_country_relationships(self):
        """Add country nodes and relationships"""
        for idx, row in self.df.iterrows():
            paper_id = f"paper_{row['id']}"
            
            if pd.notna(row['country']):
                try:
                    countries_str = str(row['country']).strip()
                    
                    countries_str = countries_str[1:-1]
                    countries = [country.strip().strip("'\"") for country in countries_str.split(',')]
                    countries = [country for country in countries if country and country != '']

                    for country in countries:
                        if country:
                            country_id = f"country_{country}"

                            if not self.G.has_node(country_id):
                                self.G.add_node(country_id, type='country', name=country)

                            self.G.add_edge(paper_id, country_id, relationship='from_country')
                
                except Exception as e:
                    print(f"Error parsing countries for paper {row['id']}: {e}")
                    continue
    
    def _add_topic_relationships(self):
        """Add topic nodes and topic assignments"""
        topic_info = self.topic_model.get_topic_info()
        
        for idx, topic_row in topic_info.iterrows():
            topic_id = f"topic_{topic_row['Topic']}"

            topic_words = [word.capitalize() for word, _ in self.topic_model.get_topic(topic_row['Topic'])[:10]]

            self.G.add_node(
                topic_id,
                type='topic',
                topic_number=topic_row['Topic'],
                count=topic_row['Count'],
                name=topic_row.get('Name', f"Topic {topic_row['Topic']}"),
                keywords=topic_words
            )
        
        for idx, row in self.df.iterrows():
            if row['topic'] != -1:
                paper_id = f"paper_{row['id']}"
                topic_id = f"topic_{row['topic']}"
                
                self.G.add_edge(
                    paper_id, 
                    topic_id, 
                    relationship='belongs_to_topic',
                    probability=row.get('probability', 0.0)
                )
    
    def _add_temporal_relationships(self):
        """Add temporal relationships between papers"""
        year_groups = self.df.groupby('publication_year')
        
        for year, group in year_groups:
            year_id = f"year_{year}"

            if not self.G.has_node(year_id):
                self.G.add_node(year_id, type='year', year=year, paper_count=len(group))

            for idx, row in group.iterrows():
                paper_id = f"paper_{row['id']}"
                self.G.add_edge(paper_id, year_id, relationship='published_in')
    
    def _add_citation_relationships(self):
        """Add citation relationships if available"""
    
        for idx, row in self.df.iterrows():
            if pd.notna(row['citations']) and str(row['citations']) != '':
                current_paper = f"paper_{row['id']}"
                
                try:
                    citations_str = str(row['citations']).strip()

                    citations_str = citations_str[1:-1]
                    citing_ids = [cit.strip().strip("'\"") for cit in citations_str.split(',')]
                    citing_ids = [cit for cit in citing_ids if cit and cit != '']
                    
                    for citer_id in citing_ids:
                        if citer_id and citer_id in self.df['id'].astype(str).values:
                            citer_paper = f"paper_{citer_id}"
                            
                            self.G.add_edge(citer_paper, current_paper, relationship='cites')

                except Exception as e:
                    print(f"Error parsing citations for paper {row['id']}: {e}")
                    continue