# calc
import matplotlib.pyplot as plt
import random

def initialize_properties(players: int = 4) -> list:
    """
    returns the deck of property cards, as a list of integer values
    """
    props = list(range(1, 31))
    if players == 3:
        removed = random.sample(props, 6)
        ret = [x for x in props if x not in removed]
    elif players == 4:
        removed = random.sample(props, 2)
        ret = [x for x in props if x not in removed]
    else:
        ret = props
    return ret

def initialize_checks(players: int = 4) -> list:
    """
    returns the deck of check cards, as a list of property values
    """
    chex = list(range(0,16)).remove(1)
    chex2 = [x for x in chex for _ in range(2)]
    checks = [x * 1000 for x in chex2]
    if players == 3:
        removed = random.sample(checks, 6)
        ret = [x for x in checks if x not in removed]
    elif players == 4:
        removed = random.sample(checks, 2)
        ret = [x for x in checks if x not in removed]
    else:
        ret = checks
    return ret

def generate_sample(population, players):
    """
    returns three lists
    1. a list of the largest value in every round
    2. a list of the difference between largest and 2nd-largest value
    3. a list of the average difference between each card and the next-lowest card
    """
    random.shuffle(population)
    
    # Split the shuffled population into rounds of the specified size
    #   e.g., 4 cards for 4 players; 7 of these in a 28-card deck
    rounds = [population[i:i+players] for i in range(0, len(population), players)]
    
    # Track the largest-numbered card and calculate the average difference within each hand
    largest_cards = []
    first_differences = []
    average_differences = []
    
    for round in rounds:
        sorted_round = sorted(round, reverse=True)
        largest_cards.append(sorted_round[0])
        first_differences.append(sorted_round[0] - sorted_round[1])
        diff = 0
        comps = len(sorted_round) - 1   # for a 4-card round, do 3 comparisons
        for i in range(comps):
            diff += abs(round[i] - round[i+1])
        average_difference = diff / comps
        average_differences.append(average_difference)
    
    return largest_cards, first_differences, average_differences

if __name__ == "__main__":
    properties = initialize_properties(players = 4)
    checks = initialize_checks(players = 4)

