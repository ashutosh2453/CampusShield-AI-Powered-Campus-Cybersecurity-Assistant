import pandas as pd
import re


# ============================================
# 1. Load datasets
# ============================================

public_path = "datasets/raw/phishing_email.csv"
srm_path = "datasets/college/srm_fraud_dataset.csv"

public_df = pd.read_csv(public_path)
srm_df = pd.read_csv(srm_path)


# ============================================
# 2. Prepare PUBLIC dataset
# ============================================

public_clean = pd.DataFrame()

public_clean["text"] = public_df["text_combined"].astype(str)
public_clean["label"] = public_df["label"].astype(int)
public_clean["source"] = "public"


# ============================================
# 3. Prepare SRM dataset
# ============================================

srm_clean = pd.DataFrame()

# Combine subject + body
srm_clean["text"] = (
    srm_df["subject"].fillna("").astype(str)
    + " "
    + srm_df["body"].fillna("").astype(str)
)

srm_clean["label"] = srm_df["label"].astype(int)
srm_clean["source"] = "srm"


# ============================================
# 4. Basic text cleaning
# ============================================

def clean_text(text):
    text = text.lower()

    # Remove excessive whitespace
    text = re.sub(r"\s+", " ", text)

    # Remove leading/trailing spaces
    text = text.strip()

    return text


public_clean["text"] = public_clean["text"].apply(clean_text)
srm_clean["text"] = srm_clean["text"].apply(clean_text)


# ============================================
# 5. Remove empty text
# ============================================

public_clean = public_clean[
    public_clean["text"].str.len() > 0
]

srm_clean = srm_clean[
    srm_clean["text"].str.len() > 0
]


# ============================================
# 6. Combine datasets
# ============================================

combined_df = pd.concat(
    [public_clean, srm_clean],
    ignore_index=True
)


# ============================================
# 7. Remove exact duplicate rows
# ============================================

before = len(combined_df)

combined_df = combined_df.drop_duplicates(
    subset=["text", "label"]
)

after = len(combined_df)


# ============================================
# 8. Save processed datasets
# ============================================

public_clean.to_csv(
    "datasets/processed/public_clean.csv",
    index=False
)

srm_clean.to_csv(
    "datasets/processed/srm_clean.csv",
    index=False
)

combined_df.to_csv(
    "datasets/processed/combined_dataset.csv",
    index=False
)


# ============================================
# 9. Print results
# ============================================

print("\n===================================")
print("DATA PREPARATION COMPLETE")
print("===================================")

print("\nPublic dataset:")
print("Rows:", len(public_clean))
print(public_clean["label"].value_counts())

print("\nSRM dataset:")
print("Rows:", len(srm_clean))
print(srm_clean["label"].value_counts())

print("\nCombined dataset:")
print("Rows:", len(combined_df))
print(combined_df["label"].value_counts())

print("\nDuplicates removed:", before - after)

print("\nSources:")
print(combined_df["source"].value_counts())

print("\nSaved files:")
print("datasets/processed/public_clean.csv")
print("datasets/processed/srm_clean.csv")
print("datasets/processed/combined_dataset.csv")

print("\n===================================")