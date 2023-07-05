import sys
from typing import List
import requests
import time
import xml.etree.ElementTree as ET
from collections import defaultdict

import click
from datetime import date, timedelta
from dateutil import parser as date_parser


debug = False
print_rank = True

def extract_game_data(xml_str, debug=False):
    root = ET.fromstring(xml_str)
    games = root.findall('.//item')
    i = 0
    game_data = []
    if debug:
        print(f'extract_game_data: {len(games)} games found')
    for game in games:
        game_id = game.attrib['objectid']
        if debug:
            i += 1
            print(f'game {i}: {game_id} ...')
        try:
            name = game.find('name').text
            rank = game.find('.//rank[@type="subtype"]').attrib['value']
            numplays = game.find('numplays').text
            rating_value = game.find('stats/rating').attrib['value']
            average_rating = game.find('stats/rating/average').attrib['value']
            bayes_average_rating = game.find('stats/rating/bayesaverage').attrib['value']

            game_info = {
                'game_id': game_id,
                'name': name,
                'rank': rank,
                'numplays': numplays,
                'rating_value': rating_value,
                'average_rating': average_rating,
                'bayes_average_rating': bayes_average_rating
            }
            game_data.append(game_info)
        except AttributeError as ex:
            print(f'missing attribute for game-id {game_id}, despite the API request\'s 200 return! Try running again?')
        except Exception as other_ex:
            print(other_ex)
            return []
    return game_data

def map_rating(rating, spaces=1) -> str:
    spacer = ' ' * int(spaces)
    k = int(rating) if rating.isdigit() else -1
    return {
        10: '[BGCOLOR=#00CC00] [b]' + str(rating) + '[/b] [/BGCOLOR]',
        9: '[BGCOLOR=#33CC99] [b]' + str(rating) + '[/b] [/BGCOLOR]',
        8: '[BGCOLOR=#66FF99] [b]' + str(rating) + '[/b] [/BGCOLOR]',
        7: '[BGCOLOR=#99FFFF] [b]' + str(rating) + '[/b] [/BGCOLOR]',
        6: '[BGCOLOR=#9999FF] [b]' + str(rating) + '[/b] [/BGCOLOR]',
        5: '[BGCOLOR=#CC99FF] [b]' + str(rating) + '[/b] [/BGCOLOR]',
        4: '[BGCOLOR=#FF66CC] [b]' + str(rating) + '[/b] [/BGCOLOR]',
        3: '[BGCOLOR=#FF6699] [b]' + str(rating) + '[/b] [/BGCOLOR]',
        2: '[BGCOLOR=#FF3366] [b]' + str(rating) + '[/b] [/BGCOLOR]',
        1: '[BGCOLOR=#FF0000] [b]' + str(rating) + '[/b] [/BGCOLOR]'
    }.get(k, '[BGCOLOR=#A3A3A3] [b]--[/b] [/BGCOLOR]') + spacer

def get_game_data(username, start_date, end_date) -> List:
    """ fetches the relevant games played data and returns a list of records """
    mindate = start_date
    maxdate = end_date

    # API request URL
    url = f'https://boardgamegeek.com/xmlapi2/plays?username={username}&mindate={mindate}&maxdate={maxdate}&type=thing&subtype=boardgame&brief=1'

    # Make the API request
    response = requests.get(url)

    while response.status_code == 202:
        print("Waiting for response...")
        time.sleep(0.33)
        response = requests.get(url)

    if response.status_code != 200:
        print(f'url request failed with code {response.status_code}')
        exit(1)

    xml_str = response.text

    # Parse the XML string
    root = ET.fromstring(xml_str)

    # Extract game IDs and number of plays
    gameplays = root.findall('.//play')
    plays_per_game = defaultdict(int)

    for gameplay in gameplays:
        game = gameplay.find('item')
        assert game
        game_id = game.attrib['objectid']
        play_count = gameplay.attrib.get('quantity', 1)
        plays_per_game[game_id] += int(play_count)

    # look up the game rank and name for each id
    game_ids = [int(k) for k in plays_per_game.keys()]
    game_ids_str = ",".join(map(str, game_ids))

    # Print the number of plays per game
    if debug:
        for game_id, play_count in plays_per_game.items():
            print(f"Game ID: {game_id}, Plays: {play_count}")

    url2 = f'https://boardgamegeek.com/xmlapi2/collection?username={username}&id=' + game_ids_str + '&stats=1'
    tries_left = 2
    game_bgg_data = []
    while tries_left > 0:
        tries_left -= 1
        # Make the API request
        if debug:
            print(url2 + ' ...') 
        response = requests.get(url2)

        while response.status_code == 202:
            print("Waiting for response...")
            time.sleep(0.33)
            response = requests.get(url)

        if response.status_code != 200:
            print(f'url request failed with code {response.status_code}')
            exit(1)

        game_bgg_data = extract_game_data(response.text, debug=False)
        if len(game_bgg_data) > 0:
            break
    else:
        print(f'else of while loop reached! Try in browser: {url2}')

    for game in game_bgg_data:
        game['play_count'] = plays_per_game[game['game_id']]
    game_bgg_data.sort(key=lambda x: x['play_count'], reverse=True)
    return game_bgg_data


@click.command()
@click.option('-u', '--username', help='BGG username', required=True)
@click.option('-s', '--start-date', help='Start date (YYYY-MM-DD)', default=(date.today() - timedelta(days=7)).isoformat())
@click.option('-e', '--end-date', help='End date (YYYY-MM-DD)', default=date.today().isoformat())
def main(username, start_date, end_date):

    # Convert start_date and end_date to datetime objects if needed
    if isinstance(start_date, str):
        start_date = date_parser.parse(start_date).date()
    if isinstance(end_date, str):
        end_date = date_parser.parse(end_date).date()

    game_bgg_data = get_game_data(username, start_date, end_date)

    for game in game_bgg_data:
        rating = game['rating_value']
        rating_str = map_rating(rating, 1)
        name = game['name']
        rank = game['rank']
        plays = game['play_count']
        plays_str = f' x{plays}' if int(plays) > 1 else ''
        total = game['numplays']
        if int(plays) == int(total):
            total_str = '[b][COLOR=#FF0000][size=7]NEW![/size][/COLOR][/b]'
        else:
            total_str = f'[size=7]({total} so far)[/size]'
        if print_rank:
            if 'Not' in str(rank):
                rank_str = '[size=8]' + 'unranked' + ' [/size]'
            else:
                rank_str = '[size=8]' + str(rank).rjust(8,' ') + ' [/size]'
            print(f'[c]{rank_str} [/c]{rating_str} {name}{plays_str} {total_str}')
        else:
            print(f'{rating_str} {name}{plays_str} {total_str}')


if __name__ == '__main__':
    main()