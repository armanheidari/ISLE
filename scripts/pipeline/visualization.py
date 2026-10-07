import copy

import numpy as np
import plotly.express as px
import matplotlib.pyplot as plt

from wordcloud import WordCloud


def plot_topics_cluster(df, topic_model, n_shows=False):
    if n_shows is False:
        n_shows = len(df['topic'].value_counts())

    topic_counts = df['topic'].value_counts().head(n_shows)
    topic_counts = topic_counts[topic_counts.index != -1]

    topic_labels = []
    for topic_id in topic_counts.index:
        if topic_id in topic_model.get_topics():
            words = [word for word, _ in topic_model.get_topic(topic_id)[:3]]
            topic_labels.append(f"Topic {topic_id}: {', '.join(words)}")
        else:
            topic_labels.append(f"Topic {topic_id}")

    fig = px.bar(
        x=topic_counts.values,
        y=topic_labels,
        orientation='h',
        title="<b>Topic Distribution</b>",
        labels={'x': 'Number of Headlines', 'y': ''},
        color=topic_counts.values,
        color_continuous_scale='plasma',
        text=topic_counts.values
    )

    fig.update_traces(
        texttemplate='%{text}',
        textposition='outside',
        textfont_size=12,
        textfont_color='black',
        marker_line_color='white',
        marker_line_width=1.5
    )

    fig.update_layout(
        title={
            'text': "<b>Topic Distribution</b>",
            'x': 0.5,
            'xanchor': 'center',
            'font': {'size': 24, 'color': "#000000"}
        },
        xaxis={
            'title': {'text': '<b>Number of Headlines</b>', 'font': {'size': 16}},
            'gridcolor': 'lightgray',
            'gridwidth': 0.5,
            'showgrid': True
        },
        yaxis={
            'categoryorder': 'total ascending',
            'title': {'text': '<b>Topics</b>', 'font': {'size': 16}},
            'tickfont': {'size': 11}
        },
        plot_bgcolor='white',
        paper_bgcolor='white',
        width=1400,
        height=max(n_shows * 25 + 200, 600),
        margin=dict(l=20, r=100, t=80, b=60),
        coloraxis_colorbar={
            'title': {'text': '<b>Count</b>', 'font': {'size': 14}},
            'thickness': 15,
            'len': 0.7
        }
    )
    
    return fig


def plot_topics_wordcloud(topics, topic_model):
    topics_copied = copy.deepcopy(topics)
    topics_copied.pop(-1)
    
    n_cols = int(np.sqrt(len(topics_copied)) + 1)
    n_rows = int(np.ceil(len(topics_copied) / n_cols))
    
    plt.figure(figsize=(n_cols * 10, n_rows * 10), dpi=200)

    for topic_id, topic in topics_copied.items():
        ax = plt.subplot(n_rows, n_cols, topic_id + 1)

        words_weights = dict(topic)

        wordcloud = WordCloud(
            width=600, 
            height=600, 
            background_color='white',
            colormap='viridis',
            max_words=50,
            relative_scaling=0.5,
            font_step=1,
            max_font_size=100,
            min_font_size=20
        ).generate_from_frequencies(words_weights)

        plt.imshow(wordcloud, interpolation='bilinear')

        ax.set_xticks([])
        ax.set_yticks([])

        for spine in ax.spines.values():
            spine.set_visible(True)
            spine.set_linewidth(1)
            spine.set_edgecolor('black')

        top_words = [word for word, prob in topic_model.get_topic(topic_id)[:3]]

        plt.title(
            f'Topic {topic_id}: {", ".join(top_words)}', 
            fontsize=32, 
            fontweight='bold',
            pad=15
        )

    plt.suptitle(
        'Topics Word Clouds', 
        fontsize=70, 
        fontweight='bold', 
        y=0.95
    )

    plt.tight_layout(rect=[0, 0.03, 1, 0.95])
    