#!/bin/sh
# Dynamic calculation of maximum branch name length based on gitUrl.repo
REPO_NAME=$(git remote get-url origin | awk -F'/' '{print $NF}' | sed 's/.git$//')
OWNER_LENGTH=8  # Fixed length for "hlxsites"
REPO_LENGTH=${#REPO_NAME}
FIXED_PART_LENGTH=$((REPO_LENGTH + OWNER_LENGTH + 4))  # 4 for '--' separators
MAX_DNS_LABEL=63
MAX_REF_LENGTH=$((MAX_DNS_LABEL - FIXED_PART_LENGTH))

# Check the length of the current branch name
BRANCH_NAME=$(git branch --show-current)
BRANCH_LENGTH=${#BRANCH_NAME}

# Check if the branch name exceeds the maximum length
if [ $BRANCH_LENGTH -gt $MAX_REF_LENGTH ]; then
    echo "Error: Branch name will exceed the 63 character limit for DNS labels."
    echo "Please use a shorter branch name or a shorter repository name."
    exit 1
fi
