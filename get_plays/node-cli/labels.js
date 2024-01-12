
const preferredNames = {
    18145 : 'Balda',
    291453 : 'Scout',
    186279 : 'Mölkky',
    12942 : 'No Thanks',
    206941 : 'First Class',
    308 : 'Wildlife Safari',
    354 : 'Sticheln',
    152 : 'Mü',
    176494 : 'Isle of Skye',
    345972 : 'Cat in the Box',
    256802 : 'Fool',
    15600 : 'Kreta',
    209450 : 'Länder Toppen',
    348085 : 'Inseln Toppen',
    153065 : 'Abluxxen',
    1403 : 'Turn the Tide',
    244948 : 'BRAINS',
    266083 : 'LAMA',
    1116 : 'Oh Hell',
    188866 : 'Awkward Guests',
    225482 : 'Texas Showdown',
}

// retrieved from https://boardgamegeek.com/xmlapi/geeklist/322713
// a few entries are combined (e.g. The Crew I and The Crew II), so there are more than 100 elements
const top100 = [
    131357, // Coup
    21882,  // Blue Moon City
    255692, // New Frontiers
    291453, // Scout
    317983, // Anansi
    266164, // Babylonia
    346501, // Mille Fiori
    186279, // Mölkky
    760,    // Battle Line
    84876,  // Castles of Burgundy
    187988, // Pyramid Arcade
    208895, 37371, // New York Slice, Piece o'Cake
    12942,  // No Thanks
    25277,  // Richard III
    39463,  // Cosmic Encounter, 3rd ed.
    11,     // Bohnanza
    15290,  // R-Eco
    206941, // First Class
    234337, // Senators
    140934, // Arboretum
    398,    // Wildlife Safari
    348870, // Heckmeck am Karteneck
    25021,  // Sekigahara
    552,    // Bus
    354,    // Sticheln
    311031, // Five Three Five
    313000, // Sumatra
    152,    // Mü
    12,     // Ra
    146886, // La Granja
    192297, // America
    178900, 198773, // Codenames, Codenames: Pictures
    3406,   // Lines of Action
    324242, // Sheepy Time
    156009, // Port Royal
    151022, // Baseball Highlights 2047
    175878, // 504
    217372, // The Quest for El Dorado
    176494, // Isle of Skye
    345972, // Cat in the Box
    256802, // Fool
    266830, // QE
    15600,  // Kreta
    220,    // High Society
    37628,  // Haggis
    209450, 348085,  // Länder toppen, Inseln Toppen
    25574,  // Gin Rummy
    277,    // Res Publica
    8051,   // Attika
    82424,  // Bangkok Klongs
    153065, // Abluxxen
    1403,   // Turn the Tide
    218920, // Valletta
    1261, 167270,   // Medina (1st or 2nd ed.)
    40832,  // Keltis das Kartenspiel
    244992, // The Mind
    244948, // BRAINS (family of games/puzzles)
    205597, // Jump Drive
    266083, // LAMA
    592,    // Spades
    1116,   // Oh Hell
    26468,  // Klaverjassen
    154394, // Sheepshead
    189190, // 9 Lives
    85256, 113401, 131325, 99975, 145189, 161546, 161547,   // Timeline
    2398,   // Cribbage
    118,    // Modern Art
    129948, // The Palaces of Carrara
    3076,   // Puerto Rico
    188866, // Awkward Guests
    34635,  // Stone Age
    63888,  // Innovation
    351666, // Vidrasso
    503,    // Through the Desert
    234248, 302270, // Voodoo Prince, Marshmallow Test
    3,      // Samurai
    145588, // Citrus
    9217,   // Saint Petersburg
    207330, // Hellas
    54043,  // Jaipur
    297129, // Jekyll vs. Hyde
    295486, // My City
    6688,   // 99
    217449, // NMBR 9
    137155, // Potato Man
    9364, 283755,   // Doppelkopf, Doublehead Kids
    284083, 284083, // The Crew I, The Crew II
    36218,  // Dominion
    10630,  // Memoir '44
    31481,  // Galaxy Trucker
    123260, // Suburbia
    2651,   // Power Grid
    225482, // Texas Showdown
    6830,   // Zendo
    42,     // Tigris & Euphrates
    172,    // For Sale
    148228, // Splendor
    50,     // Lost Cities
    28143,  // Race for the Galaxy
    6887    // Hearts
]

// Looney Pyramid Games
const looneyPyramid = [

]

module.exports = { preferredNames, top100 }