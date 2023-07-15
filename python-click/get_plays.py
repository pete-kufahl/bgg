import sys

from utils import get_game_data, map_rating, format_line_of_game_info

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
@click.option('-o', '--option', help='Option for game category', type=click.Choice(['all', 'deep', 'new', 'blog'], case_sensitive=False), default='all')
@click.option('-l', '--print-with-links', is_flag=True, help='Print with links')
@click.option('-r', '--print-ranks', is_flag=True, help='Print BGG ranks')
@click.option('-d', '--debug', is_flag=True, help='Output debug messages to console')
def all(username, start_date, end_date, option, print_with_links, print_ranks, debug):

    # Convert start_date and end_date to datetime objects if needed
    if isinstance(start_date, str):
        start_date = date_parser.parse(start_date).date()
    if isinstance(end_date, str):
        end_date = date_parser.parse(end_date).date()

    start_date_str = start_date.strftime('%Y-%m-%d')
    end_date_str = end_date.strftime('%Y-%m-%d')

    game_bgg_data = get_game_data(username, start_date_str, end_date_str, debug=debug)

    option_key = str(option).lower()
    if option_key == 'all':
        for game in game_bgg_data:
            formatted = format_line_of_game_info(game, print_with_links, print_ranks)
            print(formatted)
    elif option_key == 'deep':
        print(f'{option_key} option not implemented')
    else:
        print(f'{option_key} option not implemented')


cli.add_command(all)

if __name__ == '__main__':
    cli()
