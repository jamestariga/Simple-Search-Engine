from flask import Flask, render_template, request
from elasticsearch import Elasticsearch
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel

app = Flask(__name__)
es = Elasticsearch([{'host': 'localhost', 'port': 9200}])

# Sample personalized data (user preferences)
user_preferences = {
    'user1': 'python programming data',
    'user2': 'machine learning algorithms',
}

# Preprocess user preferences for TF-IDF vectorization
vectorizer = TfidfVectorizer()
user_matrix = vectorizer.fit_transform(list(user_preferences.values()))

def calculate_personalized_score(query):
    # Transform the query to the same vector space
    query_vector = vectorizer.transform([query])

    # Calculate cosine similarity between the query and each user's preferences
    similarity_scores = linear_kernel(query_vector, user_matrix).flatten()

    # Sum up the personalized scores
    personalized_score = sum(similarity_scores)

    return personalized_score

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search', methods=['GET', 'POST'])
def search():
    if request.method == 'POST':
        query = request.form['query']
        
        # Elasticsearch query
        result = es.search(index='your_index_name', body={
            'query': {
                'match': {
                    'content': query
                }
            }
        })

        # Calculate personalized score for each result
        for hit in result['hits']['hits']:
            hit['_score'] += calculate_personalized_score(query)

        # Sort results by personalized score
        hits = sorted(result['hits']['hits'], key=lambda x: x['_score'], reverse=True)

        return render_template('search_results.html', query=query, results=hits)

    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
