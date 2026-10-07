import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix,
    roc_auc_score
)

import joblib


# ============================================
# 1. Load training and testing data
# ============================================

train_path = "datasets/processed/public_train.csv"
test_path = "datasets/processed/public_test.csv"

train_df = pd.read_csv(train_path)
test_df = pd.read_csv(test_path)

print("\n===================================")
print("LOADING DATA")
print("===================================")

print("Training rows:", len(train_df))
print("Testing rows:", len(test_df))


# ============================================
# 2. Separate text and labels
# ============================================

X_train = train_df["text"].fillna("")
y_train = train_df["label"]

X_test = test_df["text"].fillna("")
y_test = test_df["label"]


# ============================================
# 3. TF-IDF
# ============================================

print("\n===================================")
print("CREATING TF-IDF FEATURES")
print("===================================")

vectorizer = TfidfVectorizer(
    max_features=100000,
    ngram_range=(1, 2),
    min_df=2,
    sublinear_tf=True
)

X_train_tfidf = vectorizer.fit_transform(X_train)

X_test_tfidf = vectorizer.transform(X_test)

print("Training TF-IDF shape:", X_train_tfidf.shape)
print("Testing TF-IDF shape:", X_test_tfidf.shape)


# ============================================
# 4. Train Logistic Regression
# ============================================

print("\n===================================")
print("TRAINING LOGISTIC REGRESSION")
print("===================================")

model = LogisticRegression(
    max_iter=1000,
    class_weight="balanced",
    random_state=42
)

model.fit(X_train_tfidf, y_train)

print("Training complete!")


# ============================================
# 5. Predictions
# ============================================

y_pred = model.predict(X_test_tfidf)

y_probability = model.predict_proba(X_test_tfidf)[:, 1]


# ============================================
# 6. Evaluation
# ============================================

accuracy = accuracy_score(y_test, y_pred)

precision = precision_score(y_test, y_pred)

recall = recall_score(y_test, y_pred)

f1 = f1_score(y_test, y_pred)

roc_auc = roc_auc_score(
    y_test,
    y_probability
)


# ============================================
# 7. Print results
# ============================================

print("\n===================================")
print("MODEL RESULTS")
print("===================================")

print(f"Accuracy : {accuracy:.4f}")
print(f"Precision: {precision:.4f}")
print(f"Recall   : {recall:.4f}")
print(f"F1 Score : {f1:.4f}")
print(f"ROC-AUC  : {roc_auc:.4f}")


# ============================================
# 8. Classification report
# ============================================

print("\n===================================")
print("CLASSIFICATION REPORT")
print("===================================")

print(
    classification_report(
        y_test,
        y_pred,
        target_names=[
            "Legitimate",
            "Phishing"
        ]
    )
)


# ============================================
# 9. Confusion Matrix
# ============================================

print("\n===================================")
print("CONFUSION MATRIX")
print("===================================")

cm = confusion_matrix(
    y_test,
    y_pred
)

print(cm)


# ============================================
# 10. Save model
# ============================================

joblib.dump(
    model,
    "model/phishing_classifier.pkl"
)

joblib.dump(
    vectorizer,
    "model/tfidf_vectorizer.pkl"
)


# ============================================
# 11. Save metrics
# ============================================

metrics = {
    "accuracy": accuracy,
    "precision": precision,
    "recall": recall,
    "f1_score": f1,
    "roc_auc": roc_auc
}

metrics_df = pd.DataFrame([metrics])

metrics_df.to_csv(
    "outputs/metrics/baseline_metrics.csv",
    index=False
)


print("\n===================================")
print("FILES SAVED")
print("===================================")

print("model/phishing_classifier.pkl")
print("model/tfidf_vectorizer.pkl")
print("outputs/metrics/baseline_metrics.csv")

print("\n===================================")
print("DONE")
print("===================================")