import pandas as pd
from sdv.single_table import GaussianCopulaSynthesizer
from sdv.metadata import SingleTableMetadata

fake_df = pd.read_csv('fake_data.csv')

metadata = SingleTableMetadata()
metadata.detect_from_dataframe(fake_df)
model = GaussianCopulaSynthesizer(metadata)
model.fit(fake_df)
df = model.sample(10000) # sample 10000 new rows

df.to_csv("synthetic_data.csv")