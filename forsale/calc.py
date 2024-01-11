# calc
import sys
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

if __name__ == "__main__":
    properties = initialize_properties()
    checks = initialize_checks()