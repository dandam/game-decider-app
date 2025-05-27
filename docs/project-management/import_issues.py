import csv
import os
import requests
from dotenv import load_dotenv

load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
REPO = os.getenv("REPO")  # Format: username/repo
API_URL = f"https://api.github.com/repos/{REPO}/issues"

HEADERS = {
    "Authorization": f"Bearer {GITHUB_TOKEN}",
    "Accept": "application/vnd.github+json",
}

LOG_FILE = "created_issues.log"

def get_milestone_number(milestone_title):
    if not milestone_title:
        return None
    response = requests.get(f"https://api.github.com/repos/{REPO}/milestones", headers=HEADERS)
    if response.status_code != 200:
        print(f"⚠️ Warning: Could not fetch milestones: {response.status_code}")
        return None
    for ms in response.json():
        if ms["title"].lower() == milestone_title.lower():
            return ms["number"]
    print(f"⚠️ Milestone not found: '{milestone_title}' — skipping.")
    return None

def create_issue(title, body, assignees, labels, milestone_title, state):
    milestone_number = get_milestone_number(milestone_title)
    data = {
        "title": title,
        "body": body,
        "assignees": assignees,
        "labels": labels,
        "milestone": milestone_number,
    }

    response = requests.post(API_URL, json=data, headers=HEADERS)

    if response.status_code == 201:
        issue = response.json()
        print(f"✅ Created: {title}")
        with open(LOG_FILE, "a", encoding="utf-8") as log:
            log.write(f"{title}: {issue['html_url']}\n")
        if state == "closed":
            requests.patch(issue["url"], headers=HEADERS, json={"state": "closed"})
    else:
        print(f"❌ Failed to create issue '{title}': {response.status_code}")
        print(response.json())

def import_csv(filepath):
    with open(filepath, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            title = row.get("Title", "").strip()
            body = row.get("Body", "").strip()
            assignees = [a.strip() for a in row.get("Assignees", "").split(",") if a.strip()]
            labels = [l.strip() for l in row.get("Labels", "").split(",") if l.strip()]
            milestone = row.get("Milestone", "").strip()
            state = row.get("State", "open").strip().lower()
            create_issue(title, body, assignees, labels, milestone, state)

if __name__ == "__main__":
    import_csv("issues.csv")
    print(f"\n📄 All created issues logged to: {LOG_FILE}")

