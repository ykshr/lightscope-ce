#!/bin/bash
git stash
# We are currently not fetching from main successfully due to terminal prompt.
# Let's see if the PR conflicts were actually merged into main or if we can pull the PR target branch.
git fetch origin
