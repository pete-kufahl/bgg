import sys

from utils import get_game_data, map_rating

import click
from datetime import date, timedelta
from dateutil import parser as date_parser

def format_line_of_game_info(game, print_with_links: bool = True, print_ranks: bool = False):
    """ converts BGG and games played data into formatted line of text """
    rating = game['rating_value']
    rating_str = map_rating(rating, 1)
    name = game['name']
    game_id = game['game_id']
    name_str = f'[thing={game_id}]{name}[/thing]' if print_with_links else name
    rank = game['rank']
    plays = game['play_count']
    plays_str = f' x{plays}' if int(plays) > 1 else ''
    total = game['numplays']
    if int(plays) == int(total):
        total_str = '[b][COLOR=#FF0000][size=7]NEW![/size][/COLOR][/b]'
    else:
        total_str = f'[size=7]({total} so far)[/size]'
    if print_ranks:
        if 'Not' in str(rank):
            rank_str = '[size=8]' + 'unranked' + ' [/size]'
        else:
            rank_str = '[size=8]' + str(rank).rjust(8,' ') + ' [/size]'
        formatted = f'[c]{rank_str} [/c]{rating_str} {name_str}{plays_str} {total_str}'
    else:
        formatted = f'{rating_str} {name_str}{plays_str} {total_str}'
    return formatted


@click.command()
@click.option('-u', '--username', help='BGG username', required=True)
@click.option('-s', '--start-date', help='Start date (YYYY-MM-DD)', default=(date.today() - timedelta(days=7)).isoformat())
@click.option('-e', '--end-date', help='End date (YYYY-MM-DD)', default=date.today().isoformat())
@click.option('-o', '--option', help='Option for game category', type=click.Choice(['all', 'deep', 'new', 'blog'], case_sensitive=False), default='all')
@click.option('-l', '--print-with-links', is_flag=True, help='Print with links')
@click.option('-r', '--print-ranks', is_flag=True, help='Print BGG ranks')
@click.option('-d', '--debug', is_flag=True, help='Output debug messages to console')
def main(username, start_date, end_date, option, print_with_links, print_ranks, debug):

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


if __name__ == '__main__':
    main()
