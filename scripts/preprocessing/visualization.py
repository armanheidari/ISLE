import seaborn as sns
import matplotlib.pyplot as plt


def plot_text_distribution(df, column):
    text_lengths = df[column].apply(lambda x: len(x))
    text_tokens = df[column].apply(lambda x: len(x.split()))

    fig, ax = plt.subplots(2, 1, figsize=(12, 10))

    ax[0].hist(text_lengths, bins=20, color='skyblue', edgecolor='navy', alpha=0.7, density=True)
    sns.kdeplot(text_lengths, color='darkblue', linewidth=1, fill=True, alpha=0.2, ax=ax[0])
    ax[0].set_xlabel('Number of Tokens', fontsize=14, fontweight='bold')
    ax[0].set_ylabel('Frequency', fontsize=14, fontweight='bold')
    ax[0].set_title(
        f'Distribution of Text Lengths ({column})', 
        fontsize=16, 
        fontweight='bold', 
        pad=20
    )
    ax[0].grid(axis='y', alpha=0.3, linestyle='--')

    ax[1].hist(text_tokens, bins=20, color='lightgreen', edgecolor='darkgreen', alpha=0.7, density=True)
    sns.kdeplot(text_tokens, color='darkgreen', linewidth=1, fill=True, alpha=0.2, ax=ax[1])
    ax[1].set_xlabel('Number of Tokens', fontsize=14, fontweight='bold')
    ax[1].set_ylabel('Frequency', fontsize=14, fontweight='bold')
    ax[1].set_title(
        f'Distribution of Text Token Counts ({column})', 
        fontsize=16, 
        fontweight='bold', 
        pad=20
    )
    ax[1].grid(axis='y', alpha=0.3, linestyle='--')

    plt.tight_layout()
    
    
def plot_yearly_publications(pubs_per_year):
    plt.figure(figsize=(15, 6))
    bars = plt.bar(
        pubs_per_year.index, 
        pubs_per_year.values, 
        color='steelblue', 
        alpha=0.8, 
        edgecolor='navy', 
        linewidth=0.5
    )

    plt.title('Number of Publications per Year', fontsize=16, fontweight='bold', pad=20)
    plt.xlabel('Year', fontsize=12)
    plt.ylabel('Number of Publications', fontsize=12)
    plt.grid(axis='y', alpha=0.3, linestyle='--')
    plt.xlim(pubs_per_year.index.min() - 1, pubs_per_year.index.max() + 1)
    plt.grid(axis='y')
    
    plt.xticks(pubs_per_year.index[::2], rotation=45)
    
    plt.tight_layout()