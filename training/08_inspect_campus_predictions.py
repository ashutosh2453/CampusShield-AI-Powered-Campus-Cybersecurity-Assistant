import pandas as pd

df = pd.read_csv(
    "outputs/metrics/campus_model_srm_predictions.csv"
)

print("===================================")
print("CAMPUSSHIELD PREDICTION INSPECTION")
print("===================================")

print("\nTotal predictions:", len(df))

print("\nPrediction distribution:")
print(df["prediction"].value_counts())

print("\nProbability statistics:")
print(
    df["phishing_probability"].describe()
)

print("\n===================================")
print("SAMPLE PREDICTIONS")
print("===================================")

for i, row in df.head(10).iterrows():

    print("\n-----------------------------------")

    print("Threat type:", row.get("threat_type", "N/A"))

    print(
        "Prediction:",
        "PHISHING" if row["prediction"] == 1 else "LEGITIMATE"
    )

    print(
        "Phishing probability:",
        round(row["phishing_probability"], 4)
    )

    print("Subject:", row.get("subject", ""))

    print("Sender:", row.get("sender_email", ""))

print("\n===================================")