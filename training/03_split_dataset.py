import pandas as pd
from sklearn.model_selection import train_test_split


# ============================================
# 1. Load PUBLIC cleaned dataset
# ============================================

data_path = "datasets/processed/public_clean.csv"

df = pd.read_csv(data_path)

print("\n===================================")
print("PUBLIC DATASET")
print("===================================")

print("Total rows:", len(df))

print("\nLabels:")
print(df["label"].value_counts())


# ============================================
# 2. Separate text and labels
# ============================================

X = df["text"]
y = df["label"]


# ============================================
# 3. Train / Test Split
# ============================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


# ============================================
# 4. Create training dataframe
# ============================================

train_df = pd.DataFrame({
    "text": X_train,
    "label": y_train
})


# ============================================
# 5. Create testing dataframe
# ============================================

test_df = pd.DataFrame({
    "text": X_test,
    "label": y_test
})


# ============================================
# 6. Save
# ============================================

train_df.to_csv(
    "datasets/processed/public_train.csv",
    index=False
)

test_df.to_csv(
    "datasets/processed/public_test.csv",
    index=False
)


# ============================================
# 7. Display results
# ============================================

print("\n===================================")
print("TRAIN / TEST SPLIT COMPLETE")
print("===================================")

print("\nTraining set:")
print("Rows:", len(train_df))
print(train_df["label"].value_counts())

print("\nTesting set:")
print("Rows:", len(test_df))
print(test_df["label"].value_counts())

print("\nSaved:")
print("datasets/processed/public_train.csv")
print("datasets/processed/public_test.csv")

print("\n===================================")