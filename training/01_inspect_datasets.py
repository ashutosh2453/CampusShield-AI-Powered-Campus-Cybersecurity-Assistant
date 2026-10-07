import pandas as pd

# ==============================
# 1. Load Public Dataset
# ==============================

public_path = "datasets/raw/phishing_email.csv"

public_df = pd.read_csv(public_path)

print("\n========== PUBLIC DATASET ==========")

print("Shape:", public_df.shape)

print("\nColumns:")
print(public_df.columns.tolist())

print("\nFirst 5 rows:")
print(public_df.head())

print("\nLabel distribution:")
print(public_df["label"].value_counts())

print("\nMissing values:")
print(public_df.isnull().sum())


# ==============================
# 2. Load SRM Dataset
# ==============================

srm_path = "datasets/college/srm_fraud_dataset.csv"
srm_df = pd.read_csv(srm_path)

print("\n========== SRM DATASET ==========")

print("Shape:", srm_df.shape)

print("\nColumns:")
print(srm_df.columns.tolist())

print("\nFirst 5 rows:")
print(srm_df.head())

print("\nLabel distribution:")
print(srm_df["label"].value_counts())

print("\nMissing values:")
print(srm_df.isnull().sum())


# ==============================
# 3. Basic Information
# ==============================

print("\n========== SRM THREAT TYPES ==========")

print(srm_df["threat_type"].value_counts())

print("\n========== DONE ==========")