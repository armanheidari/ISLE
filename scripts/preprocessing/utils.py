import re
import ssl
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer, PorterStemmer


def download_nltk_files():
    try:
        _create_unverified_https_context = ssl._create_unverified_context
    except AttributeError:
        pass
    else:
        ssl._create_default_https_context = _create_unverified_https_context

    nltk.download('punkt_tab')
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
    nltk.download('wordnet', quiet=True)


def preprocess_text(text, lemmatize=False, stem=False):    
    stemmer = PorterStemmer()
    lemmatizer = WordNetLemmatizer()
    
    stop_words = set(stopwords.words('english'))

    text = re.sub(r'[^a-zA-Z\s]', '', text.lower())
    text = re.sub(r'\s+', ' ', text).strip()

    tokens = word_tokenize(text)
    if lemmatize:
        tokens = [
            lemmatizer.lemmatize(token)
            for token in tokens
            if token not in stop_words and len(token) > 2
        ]
        
    elif stem:
        tokens = [
            stemmer.stem(token)
            for token in tokens
            if token not in stop_words and len(token) > 2
        ]
        
    else:
        tokens = [
            token
            for token in tokens
            if token not in stop_words and len(token) > 2
        ]

    return ' '.join(tokens)
