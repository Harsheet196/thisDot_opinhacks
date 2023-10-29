from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from keybert import KeyBERT

app = Flask(__name__)
cors=CORS(app)
app.config['CORS_HEADERS']='Content-Type'

def extract_keywords(text):
    keybert = KeyBERT()
    keywords = keybert.extract_keywords(text)
    return keywords

@cross_origin()
@app.route('/')
def index():
  return "Hello World"


@app.route('/keywords', methods=['POST'])
def extract_keywords_api():
    text = request.get_json()['text']
    keywords = extract_keywords(text)

    res = []
    for i in keywords:
        if i[1] > 0.5:
            res.append(i[0])
    response = {
        'keywords': res
    }

    return jsonify(response)


if __name__ == '__main__':
    app.run(port="8001",debug=True)