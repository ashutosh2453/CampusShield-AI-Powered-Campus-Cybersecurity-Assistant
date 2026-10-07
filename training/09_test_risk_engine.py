import re


def calculate_risk_score(
    phishing_probability,
    sender_email="",
    subject="",
    body="",
    has_external_form=False,
    has_payment_request=False,
):
    """
    Calculate CampusShield risk score from 0-100.

    The ML probability provides the base risk.
    Additional observable indicators increase the score.
    """

    # --------------------------------------------------
    # 1. Base ML risk
    # --------------------------------------------------

    base_score = phishing_probability * 70

    score = base_score

    reasons = []

    # --------------------------------------------------
    # 2. Combine text
    # --------------------------------------------------

    text = f"{subject} {body}".lower()

    # --------------------------------------------------
    # 3. Urgency indicators
    # --------------------------------------------------

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

    urgency_found = any(
        word in text
        for word in urgency_words
    )

    if urgency_found:
        score += 8
        reasons.append(
            "Urgent or pressure-based language detected"
        )

    # --------------------------------------------------
    # 4. Payment indicators
    # --------------------------------------------------

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

    payment_found = (
        has_payment_request
        or any(
            word in text
            for word in payment_words
        )
    )

    if payment_found:
        score += 10
        reasons.append(
            "Payment or financial request detected"
        )

    # --------------------------------------------------
    # 5. External form
    # --------------------------------------------------

    if has_external_form:
        score += 7
        reasons.append(
            "External form or registration link detected"
        )

    # --------------------------------------------------
    # 6. Suspicious sender domain
    # --------------------------------------------------

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

    # --------------------------------------------------
    # 7. Suspicious URL indicators
    # --------------------------------------------------

    url_pattern = r"https?://|www\."

    if re.search(url_pattern, text):
        score += 3
        reasons.append(
            "External URL detected in message"
        )

    # --------------------------------------------------
    # 8. Cap score
    # --------------------------------------------------

    score = min(round(score), 100)

    # --------------------------------------------------
    # 9. Risk level
    # --------------------------------------------------

    if score >= 75:
        risk_level = "HIGH"

    elif score >= 40:
        risk_level = "MEDIUM"

    else:
        risk_level = "LOW"

    # --------------------------------------------------
    # 10. Recommendation
    # --------------------------------------------------

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
# TEST CASES
# ==================================================

print("===================================")
print("CAMPUSSHIELD RISK ENGINE")
print("===================================")


# Test 1: Credential phishing
result = calculate_risk_score(
    phishing_probability=0.9469,
    sender_email="mnc.campus.careers@gmail.com",
    subject="Student Account Security Alert",
    body=(
        "Urgent! Your student account will expire today. "
        "Click the link immediately to verify your account."
    ),
    has_external_form=True,
    has_payment_request=False,
)

print("\nTEST 1")
print(result)


# Test 2: Legitimate recruitment
result = calculate_risk_score(
    phishing_probability=0.3021,
    sender_email="bnycareerspeople@people.bny.com",
    subject="Summer Internship Program",
    body="Thank you for applying to our internship program.",
)

print("\nTEST 2")
print(result)


# Test 3: Payment scam
result = calculate_risk_score(
    phishing_probability=0.90,
    sender_email="careercentre.srm@gmail.com",
    subject="Mandatory Placement Verification",
    body=(
        "Urgent action required. "
        "Pay the registration fee today "
        "to confirm your placement."
    ),
    has_payment_request=True,
)

print("\nTEST 3")
print(result)


print("\n===================================")
print("RISK ENGINE TEST COMPLETE")
print("===================================")