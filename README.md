# bgg
scripts for using the boardgamegeek api

## root directory
This houses the primary python script for fetching and formatting game titles and plays for a BGG user. It's built using python 3.10, but the only special dependency it requires so far is the `requests` library.

> `python getplays.py {start date} {end date} {bgg username}`

The dates have to be in a `YYYY-MM-DD` format. I'm still working on the error handling, so if it returns an empty response from a slow BGG API call, rerunning often gives a better result.

Obviously, the BGG account has to have logged plays for this to work. Once verified, the basic script will be extended in various ways, and placed in language-labeled subdirectories.
