
import kagglehub
from kagglehub import dataset_load, KaggleDatasetAdapter

file_path = ""

df = dataset_load(
  KaggleDatasetAdapter.PANDAS,
  'owner/dataset/versions/1',
  'file.csv',
  pandas_kwargs={...},
)

print("First 5 records:", df.head())