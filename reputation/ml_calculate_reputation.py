from joblib import load
import pandas as pd
from sklearn.decomposition import PCA

def calculate_reputation(users_df):
    model = load('reputation_model.joblib')
    pca = PCA(n_components=4)  # number of components in optimal model (hard-coded)

    # run pca on data we are classifying in accordance with
    # https://datascience.stackexchange.com/questions/115077/how-to-use-new-data-with-principal-component-analysis-pca
    users_df_anon = users_df.loc[:, users_df.columns != 'user_id'].values
    pca.fit(users_df_anon)
    preds = model.predict(pca.transform(users_df_anon))

    return_df = pd.DataFrame({'user_reputation': preds, 'user_id': users_df['user_id']})
    return return_df