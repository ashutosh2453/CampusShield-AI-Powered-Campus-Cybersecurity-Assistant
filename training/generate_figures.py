"""
CampusShield Visualization Generator
Generates high-resolution publication-quality figures for README and documentation.
Uses exact metrics, confusion matrices, and dataset counts from verified project outputs.
"""

import os
from pathlib import Path
import matplotlib.pyplot as plt
import matplotlib.ticker as mtick
import numpy as np
import pandas as pd

# Output directory
OUTPUT_DIR = Path(__file__).resolve().parent.parent / "outputs" / "figures"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Visual styling
plt.style.use("seaborn-v0_8-whitegrid" if "seaborn-v0_8-whitegrid" in plt.style.available else "default")
plt.rcParams.update({
    "font.family": "sans-serif",
    "font.size": 11,
    "axes.titlesize": 14,
    "axes.titleweight": "bold",
    "axes.labelsize": 12,
    "axes.labelweight": "semibold",
    "xtick.labelsize": 10,
    "ytick.labelsize": 10,
    "legend.fontsize": 11,
    "figure.titlesize": 16,
    "figure.titleweight": "bold",
    "figure.autolayout": True,
})

COLORS = {
    "primary": "#0284c7",      # Sky blue
    "secondary": "#0d9488",    # Teal
    "accent": "#6366f1",       # Indigo
    "danger": "#ef4444",       # Red
    "warning": "#f59e0b",      # Amber
    "success": "#10b981",      # Emerald
    "dark": "#0f172a",         # Slate dark
    "card_bg": "#f8fafc",      # Slate light
    "border": "#cbd5e1",
}


# ==============================================================================
# Figure 1: Dataset Label Distribution
# ==============================================================================
def generate_dataset_label_distribution():
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(13, 5.5), gridspec_kw={'width_ratios': [1.2, 1]})

    # Public Clean Dataset (82,485 rows)
    public_counts = [39595, 42890]
    public_labels = ["Legitimate (0)\n39,595 (48.0%)", "Phishing / Fraud (1)\n42,890 (52.0%)"]
    bars1 = ax1.bar(
        ["Legitimate", "Phishing / Spam"],
        public_counts,
        color=[COLORS["success"], COLORS["danger"]],
        edgecolor=COLORS["dark"],
        linewidth=1.2,
        width=0.55
    )
    ax1.set_title("Public Phishing Dataset (N = 82,485)", pad=15)
    ax1.set_ylabel("Email Count")
    ax1.set_ylim(0, 50000)
    for bar in bars1:
        yval = bar.get_height()
        ax1.text(bar.get_x() + bar.get_width()/2.0, yval + 1000, f"{yval:,}\n({yval/82485*100:.1f}%)",
                 ha='center', va='bottom', fontweight='bold', fontsize=10)

    # Campus Curated Dataset (181 rows)
    campus_counts = [30, 151]
    bars2 = ax2.bar(
        ["Legitimate", "Fraud / Scam"],
        campus_counts,
        color=[COLORS["success"], COLORS["danger"]],
        edgecolor=COLORS["dark"],
        linewidth=1.2,
        width=0.55
    )
    ax2.set_title("CampusShield Campus Dataset (N = 181)", pad=15)
    ax2.set_ylabel("Email Count")
    ax2.set_ylim(0, 180)
    for bar in bars2:
        yval = bar.get_height()
        ax2.text(bar.get_x() + bar.get_width()/2.0, yval + 3, f"{yval:,}\n({yval/181*100:.1f}%)",
                 ha='center', va='bottom', fontweight='bold', fontsize=10)

    plt.suptitle("CampusShield: Dataset Distribution & Class Balance", y=1.02)
    path = OUTPUT_DIR / "dataset_label_distribution.png"
    plt.savefig(path, dpi=300, bbox_inches="tight")
    plt.close()
    print(f"Generated: {path}")


# ==============================================================================
# Figure 2: Public Baseline Evaluation Metrics
# ==============================================================================
def generate_public_baseline_metrics():
    metrics = {
        "Accuracy": 98.76,
        "Precision": 98.74,
        "Recall": 98.87,
        "F1 Score": 98.81,
        "ROC-AUC": 99.92
    }

    fig, ax = plt.subplots(figsize=(10, 5.5))
    names = list(metrics.keys())
    values = list(metrics.values())
    colors = [COLORS["primary"], COLORS["secondary"], COLORS["accent"], "#8b5cf6", COLORS["success"]]

    bars = ax.bar(names, values, color=colors, edgecolor=COLORS["dark"], linewidth=1.2, width=0.52)
    ax.set_ylim(95.0, 100.5)
    ax.set_ylabel("Performance (%)", fontweight="bold")
    ax.set_title("Public Baseline Model Performance (Public Test Set: N = 16,497)", pad=15)
    ax.yaxis.set_major_formatter(mtick.PercentFormatter(100.0, decimals=1))

    for bar in bars:
        h = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2.0, h + 0.1, f"{h:.2f}%",
                 ha='center', va='bottom', fontweight='bold', fontsize=11, color=COLORS["dark"])

    # Reference note
    ax.text(0.98, 0.04, "Model: TF-IDF (100k n-grams) + Balanced Logistic Regression",
            transform=ax.transAxes, ha='right', fontsize=9, fontstyle='italic',
            bbox=dict(boxstyle="round,pad=0.4", fc="white", ec=COLORS["border"]))

    path = OUTPUT_DIR / "public_baseline_metrics.png"
    plt.savefig(path, dpi=300, bbox_inches="tight")
    plt.close()
    print(f"Generated: {path}")


# ==============================================================================
# Figure 3: Baseline Confusion Matrix
# ==============================================================================
def generate_baseline_confusion_matrix():
    cm = np.array([[7811, 108],
                   [97,   8481]])

    fig, ax = plt.subplots(figsize=(7, 6))
    im = ax.imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
    plt.colorbar(im, ax=ax, fraction=0.046, pad=0.04)

    classes = ["Legitimate (0)", "Phishing (1)"]
    tick_marks = np.arange(len(classes))
    ax.set_xticks(tick_marks)
    ax.set_xticklabels(classes, fontweight="bold")
    ax.set_yticks(tick_marks)
    ax.set_yticklabels(classes, fontweight="bold")

    ax.set_xlabel("Predicted Label", labelpad=10, fontweight="bold")
    ax.set_ylabel("True Label", labelpad=10, fontweight="bold")
    ax.set_title("Public Baseline Confusion Matrix\n(Public Test: N = 16,497)", pad=15)

    thresh = cm.max() / 2.
    labels_desc = [
        ["True Negatives (TN)\n7,811 (98.6%)", "False Positives (FP)\n108 (1.4%)"],
        ["False Negatives (FN)\n97 (1.1%)",  "True Positives (TP)\n8,481 (98.9%)"]
    ]

    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            ax.text(j, i, labels_desc[i][j],
                    ha="center", va="center",
                    color="white" if cm[i, j] > thresh else COLORS["dark"],
                    fontweight="bold", fontsize=11)

    path = OUTPUT_DIR / "baseline_confusion_matrix.png"
    plt.savefig(path, dpi=300, bbox_inches="tight")
    plt.close()
    print(f"Generated: {path}")


# ==============================================================================
# Figure 4: Domain-Shift & Generalization Comparison
# ==============================================================================
def generate_campus_generalization_metrics():
    metrics = ["Accuracy", "Precision", "Recall", "F1 Score", "ROC-AUC"]
    baseline_public = [98.76, 98.74, 98.87, 98.81, 99.92]
    baseline_campus_eval = [90.06, 97.84, 90.07, 93.79, 97.66]
    campus_aware_test = [100.0, 100.0, 100.0, 100.0, 100.0]

    x = np.arange(len(metrics))
    width = 0.26

    fig, ax = plt.subplots(figsize=(12, 6.2))
    rects1 = ax.bar(x - width, baseline_public, width, label='Public Baseline on Public Test (N=16,497)',
                    color=COLORS["primary"], edgecolor=COLORS["dark"])
    rects2 = ax.bar(x, baseline_campus_eval, width, label='Domain Shift: Baseline on Campus Set (N=181)',
                    color=COLORS["warning"], edgecolor=COLORS["dark"])
    rects3 = ax.bar(x + width, campus_aware_test, width, label='Campus-Aware Model on Held-out Campus Test (N=37)*',
                    color=COLORS["success"], edgecolor=COLORS["dark"])

    ax.set_ylabel("Metric Score (%)", fontweight="bold")
    ax.set_title("Cross-Domain Generalization & Campus Adaptation Analysis", pad=15)
    ax.set_xticks(x)
    ax.set_xticklabels(metrics, fontweight="bold")
    ax.set_ylim(80.0, 105.0)
    ax.yaxis.set_major_formatter(mtick.PercentFormatter(100.0, decimals=0))
    ax.legend(loc='lower left', framealpha=0.95)

    # Bar values
    for rects in [rects1, rects2, rects3]:
        for bar in rects:
            h = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., h + 0.5, f"{h:.1f}%",
                    ha='center', va='bottom', fontsize=8.5, fontweight='bold', rotation=0)

    # Caveat footnote
    fig.text(0.5, -0.04, "*Note: Held-out campus test split contains 37 curated examples. 100% reflects small-sample benchmark performance.",
             ha='center', fontsize=9.5, fontstyle='italic', color="#475569")

    path = OUTPUT_DIR / "campus_generalization_metrics.png"
    plt.savefig(path, dpi=300, bbox_inches="tight")
    plt.close()
    print(f"Generated: {path}")


# ==============================================================================
# Figure 5: Campus Confusion Matrices Comparison
# ==============================================================================
def generate_campus_confusion_matrices():
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5.8))

    # 1. Baseline on Campus Data (N = 181)
    cm_shift = np.array([[27,  3],
                         [15, 136]])
    im1 = ax1.imshow(cm_shift, interpolation='nearest', cmap=plt.cm.Oranges)
    plt.colorbar(im1, ax=ax1, fraction=0.046, pad=0.04)
    classes = ["Legitimate (0)", "Fraud (1)"]
    ticks = [0, 1]
    ax1.set_xticks(ticks)
    ax1.set_yticks(ticks)
    ax1.set_xticklabels(classes, fontweight="bold")
    ax1.set_yticklabels(classes, fontweight="bold")
    ax1.set_xlabel("Predicted Label", fontweight="bold")
    ax1.set_ylabel("True Label", fontweight="bold")
    ax1.set_title("Domain Shift: Baseline Model on Campus Data\n(N = 181, Acc: 90.06%, FN: 15)", pad=12)

    labels1 = [
        ["TN: 27\n(90.0%)", "FP: 3\n(10.0%)"],
        ["FN: 15\n(9.9%)",  "TP: 136\n(90.1%)"]
    ]
    for i in range(2):
        for j in range(2):
            ax1.text(j, i, labels1[i][j], ha="center", va="center",
                     color="white" if cm_shift[i, j] > 70 else COLORS["dark"],
                     fontweight="bold", fontsize=11)

    # 2. Campus-Aware Model on Held-out Campus Test (N = 37)
    cm_heldout = np.array([[6,  0],
                           [0, 31]])
    im2 = ax2.imshow(cm_heldout, interpolation='nearest', cmap=plt.cm.Greens)
    plt.colorbar(im2, ax=ax2, fraction=0.046, pad=0.04)
    ax2.set_xticks(ticks)
    ax2.set_yticks(ticks)
    ax2.set_xticklabels(classes, fontweight="bold")
    ax2.set_yticklabels(classes, fontweight="bold")
    ax2.set_xlabel("Predicted Label", fontweight="bold")
    ax2.set_ylabel("True Label", fontweight="bold")
    ax2.set_title("Campus-Aware Model on Held-Out Test\n(N = 37, Acc: 100%, Zero Misclassifications)*", pad=12)

    labels2 = [
        ["TN: 6\n(100%)", "FP: 0\n(0.0%)"],
        ["FN: 0\n(0.0%)", "TP: 31\n(100%)"]
    ]
    for i in range(2):
        for j in range(2):
            ax2.text(j, i, labels2[i][j], ha="center", va="center",
                     color="white" if cm_heldout[i, j] > 15 else COLORS["dark"],
                     fontweight="bold", fontsize=11)

    plt.suptitle("Confusion Matrix Evaluation: Pre-Adaptation vs. Post-Adaptation", y=1.03)
    path = OUTPUT_DIR / "campus_model_confusion_matrix.png"
    plt.savefig(path, dpi=300, bbox_inches="tight")
    plt.close()
    print(f"Generated: {path}")


# ==============================================================================
# Figure 6: Risk Engine Architecture & Scoring Waterfall
# ==============================================================================
def generate_risk_engine_example():
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5.8), gridspec_kw={'width_ratios': [1, 1.2]})

    # Left: Signal Weight Breakdown
    signals = [
        "Base ML Phishing (prob × 70)",
        "Payment Request",
        "Urgent / Pressure Language",
        "External Form Link",
        "Personal Email Provider",
        "External URL in Text"
    ]
    weights = [70, 10, 8, 7, 5, 3]
    colors = [COLORS["primary"], COLORS["danger"], COLORS["warning"], COLORS["accent"], COLORS["secondary"], "#64748b"]

    bars = ax1.barh(signals, weights, color=colors, edgecolor=COLORS["dark"], height=0.6)
    ax1.set_xlabel("Maximum Signal Contribution (Points)", fontweight="bold")
    ax1.set_title("Signal Weights in Risk Engine", pad=15)
    ax1.set_xlim(0, 80)
    for bar in bars:
        w = bar.get_width()
        ax1.text(w + 1.5, bar.get_y() + bar.get_height()/2., f"+{w} pts" if w < 70 else "up to 70 pts",
                 va='center', fontweight='bold', fontsize=10)

    # Right: Example Realistic Campus Scam Waterfall
    # Scam scenario: prob=0.98 -> base=68.6, urgency=+8, payment=+10, form=+7, personal=+5, url=+3 -> raw=101.6 -> capped 100
    steps = [
        "Base ML\n(prob=0.98)",
        "+ Payment\nRequest",
        "+ Urgent\nLanguage",
        "+ External\nForm Link",
        "+ Personal\nEmail",
        "+ External\nURL",
        "Capped\nTotal (HIGH)"
    ]
    step_scores = [68.6, 78.6, 86.6, 93.6, 98.6, 100.0, 100.0]
    step_colors = [COLORS["primary"], COLORS["danger"], COLORS["danger"], COLORS["danger"], COLORS["danger"], COLORS["danger"], "#b91c1c"]

    bars2 = ax2.bar(steps, step_scores, color=step_colors, edgecolor=COLORS["dark"], width=0.55)
    ax2.axhline(75, color=COLORS["danger"], linestyle='--', linewidth=1.5, label='HIGH Risk Threshold (>=75)')
    ax2.axhline(40, color=COLORS["warning"], linestyle='--', linewidth=1.5, label='MEDIUM Risk Threshold (>=40)')
    ax2.set_ylabel("Calculated Risk Score (0 - 100)", fontweight="bold")
    ax2.set_title("Scam Walkthrough: 'Urgent Placement Fee' Email", pad=15)
    ax2.set_ylim(0, 115)
    ax2.legend(loc='upper left', framealpha=0.9)

    for bar in bars2:
        h = bar.get_height()
        ax2.text(bar.get_x() + bar.get_width()/2., h + 2, f"{int(round(h))}",
                 ha='center', va='bottom', fontweight='bold', fontsize=10)

    plt.suptitle("CampusShield Explainable Multi-Signal Risk Engine", y=1.02)
    path = OUTPUT_DIR / "risk_engine_example.png"
    plt.savefig(path, dpi=300, bbox_inches="tight")
    plt.close()
    print(f"Generated: {path}")


# ==============================================================================
# Figure 7: Campus Threat Type Distribution
# ==============================================================================
def generate_threat_type_distribution():
    # Load actual srm dataset to compute exact distribution
    csv_path = Path(__file__).resolve().parent.parent / "datasets" / "college" / "srm_fraud_dataset.csv"
    if not csv_path.exists():
        print(f"File not found: {csv_path}")
        return

    df = pd.read_csv(csv_path)
    # Simplify threat types for clean visualization
    def simplify_threat(t):
        if "Legitimate" in str(t):
            return "Legitimate Campus Notice / Email"
        if "Placement" in str(t):
            return "Placement / Job Scams"
        if "Internship" in str(t):
            return "Fake Internship Offers"
        if "Scholarship" in str(t):
            return "Scholarship Scams"
        if "Certification" in str(t):
            return "Fake Certification Schemes"
        if "Google Form" in str(t):
            return "Google Form Phishing Links"
        if "Payment" in str(t):
            return "Fee / Payment Fraud"
        if "Credential" in str(t):
            return "Credential Phishing / Harvest"
        if "Notice" in str(t):
            return "Impersonated College Notices"
        return str(t)

    counts = df["threat_type"].apply(simplify_threat).value_counts()

    fig, ax = plt.subplots(figsize=(11, 6))
    categories = counts.index.tolist()
    vals = counts.values.tolist()
    colors = [COLORS["success"] if "Legitimate" in c else COLORS["danger"] for c in categories]

    bars = ax.barh(categories, vals, color=colors, edgecolor=COLORS["dark"], height=0.65)
    ax.set_xlabel("Number of Scenarios (Campus Dataset N = 181)", fontweight="bold")
    ax.set_title("Campus Scam Categories & Threat Taxonomy in Curated Dataset", pad=15)
    ax.set_xlim(0, max(vals) + 6)
    ax.invert_yaxis()

    for bar in bars:
        w = bar.get_width()
        pct = (w / len(df)) * 100
        ax.text(w + 0.8, bar.get_y() + bar.get_height()/2., f"{w} ({pct:.1f}%)",
                va='center', fontweight='bold', fontsize=9.5)

    path = OUTPUT_DIR / "threat_type_distribution.png"
    plt.savefig(path, dpi=300, bbox_inches="tight")
    plt.close()
    print(f"Generated: {path}")


if __name__ == "__main__":
    print("Generating publication-ready figures for CampusShield...")
    generate_dataset_label_distribution()
    generate_public_baseline_metrics()
    generate_baseline_confusion_matrix()
    generate_campus_generalization_metrics()
    generate_campus_confusion_matrices()
    generate_risk_engine_example()
    generate_threat_type_distribution()
    print("All figures generated successfully.")
