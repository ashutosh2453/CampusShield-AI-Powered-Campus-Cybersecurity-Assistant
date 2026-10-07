import joblib
import re


# ==================================================
# LOAD MODEL
# ==================================================

model = joblib.load(
    "model/campusshield_classifier.pkl"
)

vectorizer = joblib.load(
    "model/campusshield_tfidf_vectorizer.pkl"
)


# ==================================================
# RISK ENGINE
# ==================================================

def calculate_risk_score(
    phishing_probability,
    sender_email="",
    subject="",
    body="",
    has_external_form=False,
    has_payment_request=False,
):

    base_score = phishing_probability * 70

    score = base_score

    reasons = []

    text = f"{subject} {body}".lower()

    # ----------------------------------------------
    # Urgency
    # ----------------------------------------------

    urgency_words = [
        "urgent",
        "immediately",
        "action required",
        "act now",
        "final notice",
        "deadline",
        "within 24 hours",
        "today",
        "expires",
    ]

    if any(word in text for word in urgency_words):

        score += 8

        reasons.append(
            "Urgent or pressure-based language detected"
        )

    # ----------------------------------------------
    # Payment
    # ----------------------------------------------

    payment_words = [
        "payment",
        "pay",
        "fee",
        "registration fee",
        "processing fee",
        "deposit",
        "transfer money",
        "upi",
        "bank account",
    ]

    if (
        has_payment_request
        or any(word in text for word in payment_words)
    ):

        score += 10

        reasons.append(
            "Payment or financial request detected"
        )

    # ----------------------------------------------
    # External form
    # ----------------------------------------------

    if has_external_form:

        score += 7

        reasons.append(
            "External form or registration link detected"
        )

    # ----------------------------------------------
    # Personal email provider
    # ----------------------------------------------

    suspicious_domains = [
        "gmail.com",
        "yahoo.com",
        "outlook.com",
        "hotmail.com",
    ]

    sender_lower = sender_email.lower()

    if any(
        domain in sender_lower
        for domain in suspicious_domains
    ):

        score += 5

        reasons.append(
            "Sender uses a personal email provider"
        )

    # ----------------------------------------------
    # URL
    # ----------------------------------------------

    if re.search(
        r"https?://|www\.",
        text
    ):

        score += 3

        reasons.append(
            "External URL detected in message"
        )

    # ----------------------------------------------
    # Limit score
    # ----------------------------------------------

    score = min(round(score), 100)

    # ----------------------------------------------
    # Risk level
    # ----------------------------------------------

    if score >= 75:

        risk_level = "HIGH"

    elif score >= 40:

        risk_level = "MEDIUM"

    else:

        risk_level = "LOW"

    # ----------------------------------------------
    # Recommendation
    # ----------------------------------------------

    if risk_level == "HIGH":

        recommendation = (
            "Do not click links, submit forms, "
            "send money, or provide credentials. "
            "Verify the message through an official channel."
        )

    elif risk_level == "MEDIUM":

        recommendation = (
            "Be cautious. Verify the sender and "
            "message through an official channel "
            "before taking action."
        )

    else:

        recommendation = (
            "No major risk indicators detected, "
            "but continue to verify unexpected requests."
        )

    return {
        "risk_score": score,
        "risk_level": risk_level,
        "reasons": reasons,
        "recommendation": recommendation,
    }


# ==================================================
# ANALYZE EMAIL
# ==================================================

def analyze_email(
    sender_email,
    subject,
    body,
    has_external_form=False,
    has_payment_request=False,
):

    text = f"{subject} {body}"

    # Convert email to TF-IDF
    X = vectorizer.transform([text])

    # ML prediction
    prediction = model.predict(X)[0]

    probability = model.predict_proba(X)[0][1]

    # Risk analysis
    risk = calculate_risk_score(
        phishing_probability=probability,
        sender_email=sender_email,
        subject=subject,
        body=body,
        has_external_form=has_external_form,
        has_payment_request=has_payment_request,
    )

    return {
        "prediction": (
            "PHISHING"
            if prediction == 1
            else "LEGITIMATE"
        ),
        "phishing_probability": probability,
        **risk,
    }


# ==================================================
# TERMINAL TEST
# ==================================================

print("===================================")
print("CAMPUSSHIELD EMAIL ANALYZER")
print("===================================")

sender = input("\nSender email: ")

subject = input("Subject: ")

print("\nEnter email body.")
print("Type END on a new line when finished.\n")

body_lines = []

while True:

    line = input()

    if line == "END":
        break

    body_lines.append(line)

body = "\n".join(body_lines)


# Ask about indicators

form_input = input(
    "\nDoes the email contain an external form? (y/n): "
)

payment_input = input(
    "Does the email request payment? (y/n): "
)

has_external_form = (
    form_input.lower() == "y"
)

has_payment_request = (
    payment_input.lower() == "y"
)


# Analyze

result = analyze_email(
    sender_email=sender,
    subject=subject,
    body=body,
    has_external_form=has_external_form,
    has_payment_request=has_payment_request,
)


# ==================================================
# DISPLAY RESULT
# ==================================================

print("\n")
print("===================================")
print("CAMPUSSHIELD ANALYSIS")
print("===================================")

print(
    "\nPrediction:",
    result["prediction"]
)

print(
    "Phishing probability:",
    f"{result['phishing_probability']:.2%}"
)

print(
    "Risk score:",
    f"{result['risk_score']}/100"
)

print(
    "Risk level:",
    result["risk_level"]
)

print("\nWhy?")

if result["reasons"]:

    for reason in result["reasons"]:

        print("✓", reason)

else:

    print("No additional risk indicators detected.")


print("\nRecommendation:")

print(result["recommendation"])

print("\n===================================")