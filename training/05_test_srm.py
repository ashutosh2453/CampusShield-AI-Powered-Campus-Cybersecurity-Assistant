import pandas as pd
import joblib

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
    roc_auc_score
)


# ============================================
# 1. Load SRM dataset
# ============================================

srm_path = "datasets/college/srm_fraud_dataset.csv"

srm_df = pd.read_csv(srm_path)

print("\n===================================")
print("SRM DATASET")
print("===================================")

print("Rows:", len(srm_df))


# ============================================
# 2. Prepare text
# ============================================

srm_text = (
    srm_df["subject"].fillna("").astype(str)
    + " "
    + srm_df["body"].fillna("").astype(str)
)

y_true = srm_df["label"]


# ============================================
# 3. Load trained model
# ============================================

model = joblib.load(
    "model/phishing_classifier.pkl"
)

vectorizer = joblib.load(
    "model/tfidf_vectorizer.pkl"
)


# ============================================
# 4. Transform SRM emails
# ============================================

srm_tfidf = vectorizer.transform(srm_text)


# ============================================
# 5. Predict
# ============================================

y_pred = model.predict(srm_tfidf)

y_probability = model.predict_proba(
    srm_tfidf
)[:, 1]


# ============================================
# 6. Metrics
# ============================================

accuracy = accuracy_score(
    y_true,
    y_pred
)

precision = precision_score(
    y_true,
    y_pred,
    zero_division=0
)

recall = recall_score(
    y_true,
    y_pred,
    zero_division=0
)

f1 = f1_score(
    y_true,
    y_pred,
    zero_division=0
)

roc_auc = roc_auc_score(
    y_true,
    y_probability
)


# ============================================
# 7. Results
# ============================================

print("\n===================================")
print("SRM TEST RESULTS")
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
        y_true,
        y_pred,
        target_names=[
            "Legitimate",
            "Phishing"
        ],
        zero_division=0
    )
)


# ============================================
# 9. Confusion matrix
# ============================================

print("\n===================================")
print("CONFUSION MATRIX")
print("===================================")

cm = confusion_matrix(
    y_true,
    y_pred
)

print(cm)


# ============================================
# 10. Save predictions
# ============================================

results_df = srm_df.copy()

results_df["predicted_label"] = y_pred

results_df["phishing_probability"] = y_probability

results_df.to_csv(
    "outputs/metrics/srm_predictions.csv",
    index=False
)


print("\n===================================")
print("SAVED")
print("===================================")

print(
    "outputs/metrics/srm_predictions.csv"
)

print("\n===================================")
print("DONE")
print("===================================")