import pandas as pd
from skops.io import load, dump
from sklearn.datasets import load_iris
from sklearn.ensemble import RandomForestClassifier

def calculate_reputation(rows):
    model = load('model.skops')
    model.predict(load_iris().data)
    print(model.predict(load_iris().data))

    return rows