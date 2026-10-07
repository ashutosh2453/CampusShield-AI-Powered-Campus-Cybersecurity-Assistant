import pandas as pd

from sklearn.model_selection import train_test_split


# ============================================
# 1. Load SRM dataset
# ============================================

df = pd.read_csv(
    "datasets/college/srm_fraud_dataset.csv"
)

print("\n===================================")
print("SRM DATASET")
print("===================================")

print("Total rows:", len(df))

print("\nOriginal labels:")
print(df["label"].value_counts())


# ============================================
# 2. Split SRM data
# ============================================

train_df, test_df = train_test_split(
    df,
    test_size=0.20,
    random_state=42,
    stratify=df["label"]
)


# ============================================
# 3. Save
# ============================================

train_df.to_csv(
    "datasets/processed/srm_train.csv",
    index=False
)

test_df.to_csv(
    "datasets/processed/srm_test.csv",
    index=False
)


# ============================================
# 4. Display results
# ============================================

print("\n===================================")
print("SRM SPLIT COMPLETE")
print("===================================")

print("\nSRM training:")
print("Rows:", len(train_df))
print(train_df["label"].value_counts())

print("\nSRM testing:")
print("Rows:", len(test_df))
print(test_df["label"].value_counts())

print("\nSaved:")
print("datasets/processed/srm_train.csv")
print("datasets/processed/srm_test.csv")

print("\n===================================")