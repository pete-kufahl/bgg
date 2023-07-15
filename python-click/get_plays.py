import sys

from utils import *

import click
from datetime import date, timedelta
from dateutil import parser as date_parser

@click.group()
def cli():
    pass

@click.command()
@click.option('-u', '--username', help='BGG username', required=True)
@click.option('-s', '--start-date', help='Start date (YYYY-MM-DD)', default=(date.today() - timedelta(days=7)).isoformat())
@click.option('-e', '--end-date', help='End date (YYYY-MM-DD)', default=date.today().isoformat())
@click.option('-l', '--print-with-links', is_flag=True, help='Print with links')
@click.option('-r', '--print-ranks', is_flag=True, help='Print BGG ranks')
@click.option('-d', '--debug', is_flag=True, help='Output debug messages to console')
def all(username, start_date, end_date, print_with_links, print_ranks, debug):

    # Convert start_date and end_date to datetime objects if needed
    if isinstance(start_date, str):
        start_date = date_parser.parse(start_date).date()
    if isinstance(end_date, str):
        end_date = date_parser.parse(end_date).date()

    start_date_str = start_date.strftime('%Y-%m-%d')
    end_date_str = end_date.strftime('%Y-%m-%d')

    game_bgg_data = get_game_data(username, start_date_str, end_date_str, debug=debug)

    for game in game_bgg_data:
        formatted = format_line_of_game_info(game, print_with_links, print_ranks)
        print(formatted)


@click.command()
@click.option('-u', '--username', help='BGG username', required=True)
@click.option('-s', '--start-date', help='Start date (YYYY-MM-DD)', default=(date.today() - timedelta(days=7)).isoformat())
@click.option('-e', '--end-date', help='End date (YYYY-MM-DD)', default=date.today().isoformat())
@click.option('-l', '--print-with-links', is_flag=True, help='Print with links')
@click.option('-r', '--print-ranks', is_flag=True, help='Print BGG ranks')
@click.option('-t', '--threshold', help='lowest BGG rank to display', default=1000)
@click.option('-d', '--debug', is_flag=True, help='Output debug messages to console')
def deep(username, start_date, end_date, print_with_links, print_ranks, threshold, debug):

    # Convert start_date and end_date to datetime objects if needed
    if isinstance(start_date, str):
        start_date = date_parser.parse(start_date).date()
    if isinstance(end_date, str):
        end_date = date_parser.parse(end_date).date()

    start_date_str = start_date.strftime('%Y-%m-%d')
    end_date_str = end_date.strftime('%Y-%m-%d')

    game_bgg_data = get_game_data(username, start_date_str, end_date_str, debug=debug)
    if debug:
        print(f'using minimum BGG rank of {threshold}...')
    filtered_data = get_deep_cuts(data=game_bgg_data, minimum=threshold)

    for game in filtered_data:
        formatted = format_line_of_game_info(game, print_with_links, print_ranks)
        print(formatted)


cli.add_command(all)
cli.add_command(deep)

if __name__ == '__main__':
    cli()
