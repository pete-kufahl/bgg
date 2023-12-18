# bgg
scripts for using the boardgamegeek api

## root directory
This houses the primary python script for fetching and formatting game titles and plays for a BGG user. It's built using python 3.10, but the only special dependency it requires so far is the `requests` library.

> `python getplays.py {start date} {end date} {bgg username}`

The dates have to be in a `YYYY-MM-DD` format. I'm still working on the error handling, so if it returns an empty response from a slow BGG API call, rerunning often gives a better result.

Obviously, the BGG account has to have logged plays for this to work. Once verified, the basic script will be extended in various ways, and placed in language-labeled subdirectories.

## python-click
This contains an expanded version of the basic script, converted into a UNIX-style command line tool with the `click` library. That means the arguments can be in any order.

However, you have to supply a **subcommand** to the program to specify the kind of list you want:
* `all` lists all the gameplays within the time period, sorted by number of plays
* `new` lists the games new to your collection statistics, sorted by user rating
* `deep` lists the games that are unranked by BGG, or have a BGG ranking of at least some threshold (specified by the `-t` flag)

Fetch the last 7 days:
> `python get_plays.py all -u {bgg username}`

Use custom start and end dates:
> `python get_plays.py all -u {bgg username} -s {start date} -e {end date}`

The dates do not have to be in a `YYYY-MM-DD` format, but I haven't fully tested the `dateutil.parser` submodule. Something like "April 1, 2023" should work.

This gives a summary of the required and optional arguments:
> `python get_plays.py {subcommand} --help`

## node-cli
This contains the same tool as python-click, only it's implemented in node.js. It utilizes the `axios` and `commander` modules, among others.

> `node get_plays.js all -u {bgg username} -s {start date yyyy-mm-dd} -e {end date yyyy-mm-dd} -lr`

> `node get_plays.js new -u {bgg username} -s {start date yyyy-mm-dd} -e {end date yyyy-mm-dd} -lrci`

> `node get_plays.js deep -u {bgg username} -s {start date yyyy-mm-dd} -e {end date yyyy-mm-dd} -t {minimum BGG rank} -lr`

In this case, the date arguments MUST be in the `YYYY-MM-DD` format. I haven't been able to get realiably flexible behavior out of the `date-fns` package. However, the default arguments corresponding to the last 7 days are still available.

Other minor changes:
* There's a source file `labels.js` that maps BGG game IDs to alternate game titles.

## rust
This subdirectory will contain `get_plays.rs`, an attempt to replicate the functionality of what we have in the **python-click** version in the rust language.
