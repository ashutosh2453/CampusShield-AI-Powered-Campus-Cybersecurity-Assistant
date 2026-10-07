import pandas as pd
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    classification_report,
    confusion_matrix
)

print("===================================")
print("CAMPUSSHIELD CAMPUS MODEL")
print("===================================")

# --------------------------------------------------
# 1. Load public training data
# --------------------------------------------------

public_train = pd.read_csv(
    "datasets/processed/public_train.csv"
)

# --------------------------------------------------
# 2. Load SRM training data
# --------------------------------------------------

srm_train = pd.read_csv(
    "datasets/processed/srm_train.csv"
)

# Create text from subject + body
srm_train["text"] = (
    srm_train["subject"].fillna("")
    + " "
    + srm_train["body"].fillna("")
)

# --------------------------------------------------
# 3. Prepare training data
# --------------------------------------------------

public_data = pd.DataFrame({
    "text": public_train["text"],
    "label": public_train["label"]
})

srm_data = pd.DataFrame({
    "text": srm_train["text"],
    "label": srm_train["label"]
})

combined_train = pd.concat(
    [public_data, srm_data],
    ignore_index=True
)

print("\nTraining data:")
print("Public rows:", len(public_data))
print("SRM rows:", len(srm_data))
print("Combined rows:", len(combined_train))

print("\nLabels:")
print(combined_train["label"].value_counts())

# --------------------------------------------------
# 4. Train TF-IDF
# --------------------------------------------------

print("\nTraining TF-IDF...")

vectorizer = TfidfVectorizer(
    max_features=100000,
    ngram_range=(1, 2),
    min_df=2,
    sublinear_tf=True
)

X_train = vectorizer.fit_transform(
    combined_train["text"]
)

y_train = combined_train["label"]

print("TF-IDF shape:", X_train.shape)

# --------------------------------------------------
# 5. Train Logistic Regression
# --------------------------------------------------

print("\nTraining Logistic Regression...")

model = LogisticRegression(
    max_iter=1000,
    class_weight="balanced",
    random_state=42
)

model.fit(X_train, y_train)

# --------------------------------------------------
# 6. Load unseen SRM test data
# --------------------------------------------------

srm_test = pd.read_csv(
    "datasets/processed/srm_test.csv"
)

srm_test["text"] = (
    srm_test["subject"].fillna("")
    + " "
    + srm_test["body"].fillna("")
)

X_test = vectorizer.transform(
    srm_test["text"]
)

y_test = srm_test["label"]

# --------------------------------------------------
# 7. Predictions
# --------------------------------------------------

y_pred = model.predict(X_test)

y_probability = model.predict_proba(X_test)[:, 1]

# --------------------------------------------------
# 8. Evaluation
# --------------------------------------------------

accuracy = accuracy_score(y_test, y_pred)

precision = precision_score(
    y_test,
    y_pred,
    zero_division=0
)

recall = recall_score(
    y_test,
    y_pred,
    zero_division=0
)

f1 = f1_score(
    y_test,
    y_pred,
    zero_division=0
)

roc_auc = roc_auc_score(
    y_test,
    y_probability
)

print("\n===================================")
print("SRM TEST RESULTS")
print("===================================")

print(f"Accuracy : {accuracy:.4f}")
print(f"Precision: {precision:.4f}")
print(f"Recall   : {recall:.4f}")
print(f"F1 Score : {f1:.4f}")
print(f"ROC-AUC  : {roc_auc:.4f}")

print("\nClassification Report:")
print(
    classification_report(
        y_test,
        y_pred,
        target_names=["Legitimate", "Phishing"],
        zero_division=0
    )
)

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))

# --------------------------------------------------
# 9. Save model
# --------------------------------------------------

joblib.dump(
    model,
    "model/campusshield_classifier.pkl"
)

joblib.dump(
    vectorizer,
    "model/campusshield_tfidf_vectorizer.pkl"
)

# --------------------------------------------------
# 10. Save predictions
# --------------------------------------------------

results = srm_test.copy()

results["prediction"] = y_pred
results["phishing_probability"] = y_probability

results.to_csv(
    "outputs/metrics/campus_model_srm_predictions.csv",
    index=False
)

print("\n===================================")
print("MODEL SAVED")
print("===================================")

print("model/campusshield_classifier.pkl")
print("model/campusshield_tfidf_vectorizer.pkl")
print("outputs/metrics/campus_model_srm_predictions.csv")
