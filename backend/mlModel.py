import joblib
import os
from utils import map_category_to_department

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
VEC_PATH = os.path.join(BASE_DIR, 'ClassificationModels', 'tfidf_vectorizer.pkl')
MODEL_PATH = os.path.join(BASE_DIR, 'ClassificationModels', 'complaint_classifier.pkl')

# Load vectorizer and model once at startup
vectorizer = joblib.load(VEC_PATH)
model = joblib.load(MODEL_PATH)

def predict_category_and_department(text):
    """
    Returns (predicted_category, department)
    """
    X = vectorizer.transform([text])
    predicted_category = model.predict(X)[0]
    department = map_category_to_department(predicted_category)
    return predicted_category, department
