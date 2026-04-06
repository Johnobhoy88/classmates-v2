// Ported from classmates/src/scripts/domain/geography.js
// All content exactly preserved — every question, SVG flag, and option.

export interface GeoQuestion {
  q: string;
  correct: string;
  opts: string[];
}

export interface FlagQuestion {
  flag: string;
  correct: string;
  opts: string[];
}

export type GeoLevel = 1 | 2 | 3;

// ==================== CAPITALS ====================

export const CAPS_DATA: Record<GeoLevel, GeoQuestion[]> = {
  1:[
    {q:'What is the capital of Scotland?',correct:'Edinburgh',opts:['Glasgow','Edinburgh','Aberdeen','Dundee']},
    {q:'What is the capital of England?',correct:'London',opts:['Manchester','London','Birmingham','Liverpool']},
    {q:'What is the capital of Wales?',correct:'Cardiff',opts:['Swansea','Cardiff','Newport','Bangor']},
    {q:'What is the capital of Northern Ireland?',correct:'Belfast',opts:['Derry','Belfast','Lisburn','Newry']},
    {q:'What is the capital of the Republic of Ireland?',correct:'Dublin',opts:['Cork','Dublin','Galway','Limerick']},
    {q:'Which city is the largest in Scotland?',correct:'Glasgow',opts:['Edinburgh','Glasgow','Aberdeen','Dundee']},
    {q:'What is the capital of the United Kingdom?',correct:'London',opts:['Edinburgh','London','Cardiff','Belfast']},
    {q:'Which Scottish city is on the River Dee?',correct:'Aberdeen',opts:['Aberdeen','Perth','Dundee','Inverness']},
    {q:'Which city is called the City of Discovery?',correct:'Dundee',opts:['Edinburgh','Glasgow','Dundee','Stirling']},
    {q:'What is the capital of the Highlands?',correct:'Inverness',opts:['Fort William','Inverness','Oban','Thurso']}
  ],
  2:[
    {q:'What is the capital of France?',correct:'Paris',opts:['Lyon','Paris','Marseille','Nice']},
    {q:'What is the capital of Germany?',correct:'Berlin',opts:['Munich','Berlin','Hamburg','Frankfurt']},
    {q:'What is the capital of Spain?',correct:'Madrid',opts:['Barcelona','Madrid','Seville','Valencia']},
    {q:'What is the capital of Italy?',correct:'Rome',opts:['Milan','Rome','Venice','Florence']},
    {q:'What is the capital of Norway?',correct:'Oslo',opts:['Bergen','Oslo','Stavanger','Trondheim']},
    {q:'What is the capital of Sweden?',correct:'Stockholm',opts:['Gothenburg','Stockholm','Malm\u00F6','Uppsala']},
    {q:'What is the capital of Denmark?',correct:'Copenhagen',opts:['Aarhus','Copenhagen','Odense','Aalborg']},
    {q:'What is the capital of Greece?',correct:'Athens',opts:['Thessaloniki','Athens','Crete','Corfu']},
    {q:'What is the capital of Portugal?',correct:'Lisbon',opts:['Porto','Lisbon','Faro','Braga']},
    {q:'What is the capital of the Netherlands?',correct:'Amsterdam',opts:['Rotterdam','Amsterdam','The Hague','Utrecht']}
  ],
  3:[
    {q:'What is the capital of Australia?',correct:'Canberra',opts:['Sydney','Canberra','Melbourne','Brisbane']},
    {q:'What is the capital of Canada?',correct:'Ottawa',opts:['Toronto','Ottawa','Vancouver','Montreal']},
    {q:'What is the capital of Brazil?',correct:'Bras\u00EDlia',opts:['Rio de Janeiro','Bras\u00EDlia','S\u00E3o Paulo','Salvador']},
    {q:'What is the capital of Japan?',correct:'Tokyo',opts:['Osaka','Tokyo','Kyoto','Yokohama']},
    {q:'What is the capital of India?',correct:'New Delhi',opts:['Mumbai','New Delhi','Bangalore','Kolkata']},
    {q:'What is the capital of China?',correct:'Beijing',opts:['Shanghai','Beijing','Guangzhou','Shenzhen']},
    {q:'What is the capital of Egypt?',correct:'Cairo',opts:['Alexandria','Cairo','Luxor','Giza']},
    {q:'What is the capital of South Africa?',correct:'Pretoria',opts:['Cape Town','Pretoria','Johannesburg','Durban']},
    {q:'What is the capital of New Zealand?',correct:'Wellington',opts:['Auckland','Wellington','Christchurch','Queenstown']},
    {q:'What is the capital of the USA?',correct:'Washington D.C.',opts:['New York','Washington D.C.','Los Angeles','Chicago']}
  ]
};

// ==================== CONTINENTS ====================

export const CONT_DATA: Record<GeoLevel, GeoQuestion[]> = {
  1:[
    {q:'How many continents are there?',correct:'7',opts:['5','6','7','8']},
    {q:'Which continent do we live on?',correct:'Europe',opts:['Asia','Europe','Africa','North America']},
    {q:'Which is the largest continent?',correct:'Asia',opts:['Africa','Asia','Europe','North America']},
    {q:'Which is the smallest continent?',correct:'Australia',opts:['Europe','Australia','Antarctica','South America']},
    {q:'Which continent is the coldest?',correct:'Antarctica',opts:['Europe','Asia','Antarctica','North America']},
    {q:'Which continent has the most people?',correct:'Asia',opts:['Europe','Asia','Africa','North America']},
    {q:'Which continent is Brazil in?',correct:'South America',opts:['North America','South America','Europe','Africa']},
    {q:'Which continent is Egypt in?',correct:'Africa',opts:['Asia','Africa','Europe','South America']},
    {q:'Scotland is part of which continent?',correct:'Europe',opts:['Asia','Europe','North America','Africa']},
    {q:'Penguins live wild on which continent?',correct:'Antarctica',opts:['Europe','Antarctica','Africa','Asia']}
  ],
  2:[
    {q:'How many oceans are there?',correct:'5',opts:['3','4','5','7']},
    {q:'Which is the largest ocean?',correct:'Pacific',opts:['Atlantic','Pacific','Indian','Arctic']},
    {q:'Which ocean is between Europe and America?',correct:'Atlantic',opts:['Pacific','Atlantic','Indian','Southern']},
    {q:'Which is the smallest ocean?',correct:'Arctic',opts:['Indian','Arctic','Southern','Atlantic']},
    {q:'What is the longest river in the world?',correct:'The Nile',opts:['The Amazon','The Nile','The Mississippi','The Thames']},
    {q:'What is the highest mountain in the world?',correct:'Mount Everest',opts:['Ben Nevis','Mount Everest','K2','Kilimanjaro']},
    {q:'What is a desert?',correct:'A very dry area with little rain',opts:['A cold place','A very dry area with little rain','A forest','An island']},
    {q:'The Sahara Desert is in which continent?',correct:'Africa',opts:['Asia','Africa','Australia','South America']},
    {q:'What is an island?',correct:'Land surrounded by water',opts:['A mountain','Land surrounded by water','A desert','A forest']},
    {q:'Which ocean is the warmest?',correct:'Indian',opts:['Atlantic','Pacific','Indian','Arctic']}
  ],
  3:[
    {q:'What is a tropical climate?',correct:'Hot and wet all year',opts:['Cold and dry','Hot and wet all year','Mild with seasons','Freezing']},
    {q:'What is the equator?',correct:'An imaginary line around the middle of Earth',opts:['A river','An imaginary line around the middle of Earth','A mountain range','A country']},
    {q:'What are the poles?',correct:'The very top and bottom of Earth',opts:['Mountains','Islands','The very top and bottom of Earth','Deserts']},
    {q:'What is latitude?',correct:'Distance north or south of the equator',opts:['Distance east or west','Distance north or south of the equator','Height above sea level','Size of a country']},
    {q:'The Amazon Rainforest is the largest in the world. Where is it?',correct:'South America',opts:['Africa','South America','Asia','North America']},
    {q:'What causes seasons?',correct:'The tilt of the Earth',opts:['The moon','The tilt of the Earth','Clouds','The sun moving']},
    {q:'What is a volcano?',correct:'An opening where molten rock escapes',opts:['A very tall mountain','An opening where molten rock escapes','A type of river','A desert']},
    {q:'What is erosion?',correct:'Wearing away of land by wind or water',opts:['Building of mountains','Wearing away of land by wind or water','A type of weather','Growing of plants']},
    {q:'What is a glacier?',correct:'A slow-moving river of ice',opts:['A lake','A slow-moving river of ice','A volcano','A desert']},
    {q:'Greenwich Mean Time (GMT) passes through which country?',correct:'United Kingdom',opts:['France','United Kingdom','USA','Japan']}
  ]
};

// ==================== WEATHER ====================

export const WEATHER_DATA: Record<GeoLevel, GeoQuestion[]> = {
  1:[
    {q:'How many seasons are there?',correct:'4',opts:['2','3','4','5']},
    {q:'Which season comes after winter?',correct:'Spring',opts:['Summer','Spring','Autumn','Winter']},
    {q:'In which season do leaves fall from trees?',correct:'Autumn',opts:['Spring','Summer','Autumn','Winter']},
    {q:'What falls from clouds when it rains?',correct:'Water',opts:['Snow','Water','Hail','Wind']},
    {q:'What is snow made of?',correct:'Frozen water crystals',opts:['Cotton','Frozen water crystals','Clouds','Dust']},
    {q:'What makes a rainbow appear?',correct:'Sun and rain together',opts:['Wind','Sun and rain together','Snow','Night time']},
    {q:'Which is the hottest season?',correct:'Summer',opts:['Spring','Summer','Autumn','Winter']},
    {q:'What instrument measures temperature?',correct:'Thermometer',opts:['Barometer','Thermometer','Ruler','Clock']},
    {q:'What is fog?',correct:'A cloud near the ground',opts:['Heavy rain','A cloud near the ground','Smoke','Steam']},
    {q:'What does windy mean?',correct:'Lots of moving air',opts:['Very hot','Very cold','Lots of moving air','Very wet']}
  ],
  2:[
    {q:'What is a weather forecast?',correct:'A prediction of future weather',opts:['Yesterday\'s weather','A prediction of future weather','A type of cloud','A season']},
    {q:'What causes wind?',correct:'Differences in air pressure',opts:['The moon','Differences in air pressure','Clouds moving','The sun spinning']},
    {q:'What type of cloud brings rain?',correct:'Cumulonimbus',opts:['Cirrus','Cumulonimbus','Stratus','Fog']},
    {q:'Hail is made of?',correct:'Balls of ice',opts:['Snow','Balls of ice','Frozen rain','Sleet']},
    {q:'What is a drought?',correct:'A long period with no rain',opts:['A flood','A long period with no rain','A storm','Heavy snow']},
    {q:'What does a barometer measure?',correct:'Air pressure',opts:['Temperature','Air pressure','Wind speed','Rainfall']},
    {q:'Thunder is caused by?',correct:'Lightning heating the air',opts:['Clouds crashing','Lightning heating the air','Heavy rain','Strong wind']},
    {q:'What is sleet?',correct:'A mix of rain and snow',opts:['Heavy rain','A mix of rain and snow','Hail','Fog']},
    {q:'In Scotland, which months are usually coldest?',correct:'December and January',opts:['March and April','December and January','June and July','September and October']},
    {q:'What is frost?',correct:'Ice crystals on cold surfaces',opts:['Light snow','Ice crystals on cold surfaces','Frozen rain','Cold fog']}
  ],
  3:[
    {q:'What is the equatorial climate like?',correct:'Hot and wet all year round',opts:['Cold and dry','Hot and wet all year round','Mild with four seasons','Hot and dry']},
    {q:'What climate zone is Scotland in?',correct:'Temperate maritime',opts:['Tropical','Temperate maritime','Arctic','Mediterranean']},
    {q:'What is the Gulf Stream?',correct:'A warm ocean current from the Atlantic',opts:['A river','A warm ocean current from the Atlantic','A cold wind','A type of cloud']},
    {q:'Why does it rain more on the west of Scotland?',correct:'Prevailing winds bring moisture from the Atlantic',opts:['The mountains are taller','Prevailing winds bring moisture from the Atlantic','It is colder','The lochs evaporate']},
    {q:'What is a monsoon?',correct:'A seasonal wind bringing heavy rain',opts:['A hurricane','A seasonal wind bringing heavy rain','A drought','A tsunami']},
    {q:'What is the greenhouse effect?',correct:'Gases trapping heat in the atmosphere',opts:['Growing plants in glass','Gases trapping heat in the atmosphere','A type of cloud','Green-coloured rain']},
    {q:'What is precipitation?',correct:'Any water falling from clouds (rain, snow, hail)',opts:['Only rain','Any water falling from clouds (rain, snow, hail)','Only snow','Evaporation']},
    {q:'What is the water cycle?',correct:'Evaporation, condensation, precipitation, collection',opts:['Rivers flowing to the sea','Evaporation, condensation, precipitation, collection','Rain falling on mountains','Ice melting in spring']},
    {q:'What does arid mean?',correct:'Very dry with little rainfall',opts:['Very wet','Very dry with little rainfall','Very cold','Very windy']},
    {q:'What is a microclimate?',correct:'The climate of a very small area',opts:['A tiny thermometer','The climate of a very small area','Rain that only lasts a minute','A small cloud']}
  ]
};

// ==================== COMPASS ====================

export const COMPASS_Q: GeoQuestion[] = [
  {q:'If you face North and turn right, which direction do you face?',correct:'East',opts:['East','West','South','North']},
  {q:'If you face South and turn left, which direction do you face?',correct:'East',opts:['East','West','North','South']},
  {q:'The sun rises in which direction?',correct:'East',opts:['North','East','South','West']},
  {q:'The sun sets in which direction?',correct:'West',opts:['North','East','South','West']},
  {q:'On a map, which direction is usually at the top?',correct:'North',opts:['North','South','East','West']},
  {q:'What is between North and East?',correct:'North-East',opts:['North-West','North-East','South-East','South-West']},
  {q:'A compass needle always points?',correct:'North',opts:['South','North','East','West']},
  {q:'If you walk South then turn completely around, you now face?',correct:'North',opts:['South','North','East','West']},
  {q:'NW stands for?',correct:'North-West',opts:['North-West','New West','No Wind','Near Water']},
  {q:'How many main compass points are there?',correct:'4',opts:['2','4','6','8']},
  {q:'If Edinburgh is East of Glasgow, which way do you travel from Edinburgh to Glasgow?',correct:'West',opts:['North','East','South','West']},
  {q:'SE stands for?',correct:'South-East',opts:['South-East','South-End','Sun-East','Sea-East']},
  {q:'If you face West and turn left, you face?',correct:'South',opts:['North','East','South','West']},
  {q:'How many points on a full compass rose?',correct:'8',opts:['4','6','8','16']},
  {q:'If Inverness is North of Edinburgh, to travel from Inverness to Edinburgh you go?',correct:'South',opts:['North','East','South','West']},
  {q:'If you face East and turn right, which direction are you now facing?',correct:'South',opts:['South','West','North','East']},
  {q:'Which direction is opposite to South-West?',correct:'North-East',opts:['North-East','South-East','North-West','South']},
  {q:'A ship sails East then turns North. Which direction is it now heading?',correct:'North',opts:['North','East','South','West']},
  {q:'If you face South and turn right, which direction do you face?',correct:'West',opts:['East','West','North','South']},
  {q:'Which direction is between South and West?',correct:'South-West',opts:['North-West','South-East','South-West','North-East']},
  {q:'If you face East and turn completely around, which way do you face?',correct:'West',opts:['North','East','South','West']},
  {q:'Which direction is opposite to North-West?',correct:'South-East',opts:['North-East','South-West','South-East','North']},
  {q:'NE stands for?',correct:'North-East',opts:['North-East','New England','Near East','North-End']},
  {q:'If you face West and turn right, which direction do you face?',correct:'North',opts:['North','East','South','West']},
  {q:'Which direction is opposite to East?',correct:'West',opts:['North','West','South','North-East']},
  {q:'A plane flies South-East. What is the opposite direction?',correct:'North-West',opts:['North-East','South-West','North-West','South']},
  {q:'If you face North-East and turn completely around, which way do you face?',correct:'South-West',opts:['North-West','South-East','South-West','North-East']},
  {q:'SW stands for?',correct:'South-West',opts:['South-West','South-Wind','Sea-West','Sun-West']},
  {q:'If you face North and turn left, which direction are you facing?',correct:'West',opts:['East','West','South','North']},
  {q:'How many intermediate compass points are there (NE, NW, SE, SW)?',correct:'4',opts:['2','4','6','8']}
];

// ==================== FLAGS ====================

export const FLAGS_DATA: FlagQuestion[] = [
  {flag:'<svg viewBox="0 0 60 40" width="120"><rect width="60" height="40" fill="#005EB8"/><path d="M0,0L60,40M60,0L0,40" stroke="white" stroke-width="6"/><path d="M30,0V40M0,20H60" stroke="white" stroke-width="10"/><path d="M30,0V40M0,20H60" stroke="#005EB8" stroke-width="6"/></svg>',correct:'Scotland',opts:['Scotland','Finland','Greece','Sweden']},
  {flag:'<svg viewBox="0 0 60 40" width="120"><rect width="60" height="40" fill="#012169"/><path d="M0,0L60,40M60,0L0,40" stroke="white" stroke-width="6"/><path d="M0,0L60,40" stroke="#C8102E" stroke-width="2"/><path d="M60,0L0,40" stroke="#C8102E" stroke-width="2"/><path d="M30,0V40M0,20H60" stroke="white" stroke-width="10"/><path d="M30,0V40M0,20H60" stroke="#C8102E" stroke-width="6"/></svg>',correct:'United Kingdom',opts:['United Kingdom','Australia','New Zealand','Iceland']},
  {flag:'<svg viewBox="0 0 60 40" width="120"><rect width="20" height="40" fill="#002395"/><rect x="20" width="20" height="40" fill="white"/><rect x="40" width="20" height="40" fill="#ED2939"/></svg>',correct:'France',opts:['France','Italy','Ireland','Belgium']},
  {flag:'<svg viewBox="0 0 60 40" width="120"><rect width="20" height="40" fill="black"/><rect x="20" width="20" height="40" fill="#DD0000"/><rect x="40" width="20" height="40" fill="#FFCE00"/></svg>',correct:'Germany',opts:['Germany','Belgium','France','Italy']},
  {flag:'<svg viewBox="0 0 60 40" width="120"><rect width="20" height="40" fill="#009246"/><rect x="20" width="20" height="40" fill="white"/><rect x="40" width="20" height="40" fill="#CE2B37"/></svg>',correct:'Italy',opts:['Italy','Ireland','France','Mexico']},
  {flag:'<svg viewBox="0 0 60 40" width="120"><rect width="60" height="40" fill="white"/><circle cx="30" cy="20" r="12" fill="#BC002D"/></svg>',correct:'Japan',opts:['Japan','Bangladesh','South Korea','China']},
  {flag:'<svg viewBox="0 0 60 40" width="120"><rect width="20" height="40" fill="#169B62"/><rect x="20" width="20" height="40" fill="white"/><rect x="40" width="20" height="40" fill="#FF883E"/></svg>',correct:'Ireland',opts:['Ireland','Italy','Ivory Coast','India']},
  {flag:'<svg viewBox="0 0 60 40" width="120"><rect width="60" height="13.3" fill="#AA151B"/><rect y="13.3" width="60" height="13.4" fill="#F1BF00"/><rect y="26.7" width="60" height="13.3" fill="#AA151B"/></svg>',correct:'Spain',opts:['Spain','Germany','Belgium','Colombia']},
  {flag:'<svg viewBox="0 0 60 40" width="120"><rect width="60" height="40" fill="#006AA7"/><rect x="16" width="8" height="40" fill="#FECC00"/><rect y="16" width="60" height="8" fill="#FECC00"/></svg>',correct:'Sweden',opts:['Sweden','Finland','Denmark','Norway']},
  {flag:'<svg viewBox="0 0 60 40" width="120"><rect width="60" height="40" fill="#EF2B2D"/><rect x="16" width="8" height="40" fill="#002868"/><rect y="16" width="60" height="8" fill="#002868"/><rect x="17.5" width="5" height="40" fill="white"/><rect y="17.5" width="60" height="5" fill="white"/></svg>',correct:'Norway',opts:['Norway','Iceland','Denmark','Finland']},
  {flag:'<svg viewBox="0 0 60 40" width="120"><rect width="60" height="20" fill="white"/><rect y="20" width="60" height="20" fill="#D52B1E"/></svg>',correct:'Poland',opts:['Poland','Monaco','Indonesia','Singapore']},
  {flag:'<svg viewBox="0 0 60 40" width="120"><rect width="60" height="13.3" fill="#FF0000"/><rect y="13.3" width="60" height="13.4" fill="white"/><rect y="26.7" width="60" height="13.3" fill="#FF0000"/></svg>',correct:'Austria',opts:['Austria','Latvia','Peru','Denmark']},
  {flag:'<svg viewBox="0 0 60 40" width="120"><rect width="60" height="40" fill="#009B3A"/><polygon points="30,4 56,20 30,36 4,20" fill="#FEDF00"/><circle cx="30" cy="20" r="8" fill="#002776"/><path d="M22,20 Q30,15 38,20" stroke="white" stroke-width="1" fill="none"/></svg>',correct:'Brazil',opts:['Brazil','Jamaica','South Africa','Nigeria']},
  {flag:'<svg viewBox="0 0 60 40" width="120"><rect width="15" height="40" fill="#FF0000"/><rect x="15" width="30" height="40" fill="white"/><rect x="45" width="15" height="40" fill="#FF0000"/><path d="M23,8 L30,20 L37,8 Z M23,32 L30,20 L37,32 Z M18,14 L30,20 L18,26 Z M42,14 L30,20 L42,26 Z" fill="#FF0000"/></svg>',correct:'Canada',opts:['Canada','Switzerland','Denmark','Austria']},
  {flag:'<svg viewBox="0 0 60 40" width="120"><rect width="60" height="40" fill="#00008B"/><path d="M0,0L24,16M24,24L0,40M36,16L60,0M36,24L60,40" stroke="white" stroke-width="3"/><path d="M30,0V40M0,20H60" stroke="white" stroke-width="5"/><path d="M30,0V40M0,20H60" stroke="#C8102E" stroke-width="3"/><circle cx="46" cy="28" r="6" fill="none" stroke="white" stroke-width="1.5"/><path d="M43,28L46,24L49,28L47,28L47,32L45,32L45,28Z" fill="white"/></svg>',correct:'Australia',opts:['Australia','New Zealand','United Kingdom','Fiji']},
  {flag:'<svg viewBox="0 0 60 40" width="120"><rect width="20" height="40" fill="#FF9933"/><rect x="20" width="20" height="40" fill="white"/><rect x="40" width="20" height="40" fill="#138808"/><circle cx="30" cy="20" r="5" fill="none" stroke="#000080" stroke-width="1"/><circle cx="30" cy="20" r="0.8" fill="#000080"/></svg>',correct:'India',opts:['India','Ireland','Italy','Niger']},
  {flag:'<svg viewBox="0 0 60 40" width="120"><rect width="60" height="13.3" fill="#DE3831"/><rect y="13.3" width="60" height="13.4" fill="white"/><rect y="26.7" width="60" height="13.3" fill="#007A4D"/><polygon points="0,0 20,20 0,40" fill="#002395"/><polygon points="0,2 18,20 0,38" fill="black"/><polygon points="0,6 14,20 0,34" fill="#FFB612"/></svg>',correct:'South Africa',opts:['South Africa','Kenya','Ghana','Nigeria']},
  {flag:'<svg viewBox="0 0 60 40" width="120"><rect width="60" height="13.3" fill="#AE1C28"/><rect y="13.3" width="60" height="13.4" fill="white"/><rect y="26.7" width="60" height="13.3" fill="#21468B"/></svg>',correct:'Netherlands',opts:['Netherlands','France','Luxembourg','Russia']},
  {flag:'<svg viewBox="0 0 60 40" width="120"><rect width="60" height="40" fill="#C60C30"/><rect x="16" width="8" height="40" fill="white"/><rect y="16" width="60" height="8" fill="white"/></svg>',correct:'Denmark',opts:['Denmark','Norway','Sweden','Finland']},
  {flag:'<svg viewBox="0 0 60 40" width="120"><rect width="60" height="40" fill="#0D5EAF"/><rect y="0" width="60" height="4.4" fill="#0D5EAF"/><rect y="4.4" width="60" height="4.4" fill="white"/><rect y="8.8" width="60" height="4.4" fill="#0D5EAF"/><rect y="13.2" width="60" height="4.4" fill="white"/><rect y="17.6" width="60" height="4.4" fill="#0D5EAF"/><rect y="22" width="60" height="4.4" fill="white"/><rect y="26.4" width="60" height="4.4" fill="#0D5EAF"/><rect y="30.8" width="60" height="4.4" fill="white"/><rect y="35.2" width="60" height="4.8" fill="#0D5EAF"/><rect width="22" height="22" fill="#0D5EAF"/><path d="M11,0V22M0,11H22" stroke="white" stroke-width="4"/></svg>',correct:'Greece',opts:['Greece','Israel','Finland','Uruguay']}
];

// ==================== SCOTLAND QUIZ ====================

export const SCOT_QUIZ: GeoQuestion[] = [
  {q:'What is the capital of Scotland?',correct:'Edinburgh',opts:['Glasgow','Edinburgh','Aberdeen','Dundee']},
  {q:'What is the tallest mountain in Scotland?',correct:'Ben Nevis',opts:['Ben Lomond','Ben Nevis','Cairn Gorm','Ben Macdui']},
  {q:'What is the national animal of Scotland?',correct:'Unicorn',opts:['Lion','Eagle','Unicorn','Stag']},
  {q:'What instrument is Scotland famous for?',correct:'Bagpipes',opts:['Guitar','Violin','Bagpipes','Drums']},
  {q:'What is a loch?',correct:'A lake',opts:['A mountain','A lake','A river','A forest']},
  {q:'What is haggis?',correct:'A traditional Scottish dish',opts:['A type of dance','A traditional Scottish dish','A castle','A musical instrument']},
  {q:'What river runs through Glasgow?',correct:'The Clyde',opts:['The Thames','The Clyde','The Tay','The Forth']},
  {q:'What is a ceilidh?',correct:'A Scottish dance',opts:['A type of food','A Scottish dance','A mountain','A boat']},
  {q:'What are the Highland Games famous for?',correct:'Caber toss and athletics',opts:['Football','Swimming','Caber toss and athletics','Chess']},
  {q:'Who is considered Scotland\'s national poet?',correct:'Robert Burns',opts:['William Shakespeare','Robert Burns','Walter Scott','Robert Louis Stevenson']},
  {q:'What is the longest river in Scotland?',correct:'The Tay',opts:['The Clyde','The Forth','The Tay','The Dee']},
  {q:'What is tartan?',correct:'A patterned fabric',opts:['A type of food','A patterned fabric','A dance','A mountain']},
  {q:'Which Scottish city is called the Granite City?',correct:'Aberdeen',opts:['Edinburgh','Glasgow','Aberdeen','Inverness']},
  {q:'What bridge crosses the Firth of Forth?',correct:'The Forth Bridge',opts:['Tower Bridge','The Forth Bridge','London Bridge','Tay Bridge']},
  {q:'What is Hogmanay?',correct:'New Year celebration',opts:['Christmas','New Year celebration','Easter','Halloween']},
  {q:'What is the largest city in Scotland?',correct:'Glasgow',opts:['Edinburgh','Glasgow','Aberdeen','Dundee']},
  {q:'Which island group is furthest north?',correct:'Shetland',opts:['Orkney','Shetland','Skye','Lewis']},
  {q:'What animal appears on the Scottish flag?',correct:'None \u2014 it has a cross',opts:['A lion','A unicorn','None \u2014 it has a cross','An eagle']},
  {q:'What colour is the Scottish flag?',correct:'Blue and white',opts:['Red and white','Blue and white','Green and white','Red and blue']},
  {q:'What is a glen?',correct:'A narrow valley',opts:['A mountain top','A narrow valley','A wide river','A deep loch']},
  {q:'What is the most famous loch monster called?',correct:'Nessie',opts:['Nessie','Hamish','Angus','Morag']},
  {q:'Which castle is in the centre of Edinburgh?',correct:'Edinburgh Castle',opts:['Stirling Castle','Edinburgh Castle','Balmoral Castle','Glamis Castle']},
  {q:'What sport was invented in Scotland?',correct:'Golf',opts:['Tennis','Golf','Cricket','Rugby']},
  {q:'What is neeps and tatties?',correct:'Turnip and potatoes',opts:['Meat and gravy','Turnip and potatoes','Fish and chips','Bread and butter']},
  {q:'What is Scotland\'s national bird?',correct:'Golden eagle',opts:['Robin','Golden eagle','Puffin','Osprey']},
  {q:'What type of cattle is Scotland famous for?',correct:'Highland cow',opts:['Angus','Highland cow','Hereford','Jersey']},
  {q:'Which large deer roams the Scottish Highlands?',correct:'Red deer',opts:['Roe deer','Fallow deer','Red deer','Reindeer']},
  {q:'Which Scottish island is famous for the Cuillin mountains?',correct:'Skye',opts:['Mull','Skye','Lewis','Arran']},
  {q:'What are the Orkney Islands known for?',correct:'Ancient stone monuments',opts:['Volcanoes','Ancient stone monuments','Tropical beaches','Diamond mines']},
  {q:'Lewis and Harris are part of which island group?',correct:'Outer Hebrides',opts:['Orkney','Shetland','Outer Hebrides','Inner Hebrides']},
  {q:'Who is credited with inventing the telephone?',correct:'Alexander Graham Bell',opts:['Thomas Edison','Alexander Graham Bell','James Watt','Nikolas Tesla']},
  {q:'Which Scotsman helped invent the television?',correct:'John Logie Baird',opts:['Alexander Fleming','John Logie Baird','James Clerk Maxwell','Adam Smith']},
  {q:'Alexander Fleming, a Scot, discovered which medicine?',correct:'Penicillin',opts:['Aspirin','Penicillin','Insulin','Paracetamol']},
  {q:'What is Irn-Bru?',correct:'A Scottish fizzy drink',opts:['A Scottish dance','A Scottish fizzy drink','A type of whisky','A Highland sport']},
  {q:'What is Scottish tablet?',correct:'A sweet sugary treat',opts:['A writing pad','A type of medicine','A sweet sugary treat','A flat stone']},
  {q:'What is the main ingredient in haggis?',correct:'Sheep offal, oatmeal and spices',opts:['Beef and vegetables','Sheep offal, oatmeal and spices','Chicken and rice','Fish and potatoes']},
  {q:'What is the deepest loch in Scotland?',correct:'Loch Morar',opts:['Loch Ness','Loch Lomond','Loch Morar','Loch Tay']},
  {q:'What is the largest loch in Scotland by surface area?',correct:'Loch Lomond',opts:['Loch Ness','Loch Lomond','Loch Awe','Loch Tay']},
  {q:'Which Scottish city is known as the City of Discovery?',correct:'Dundee',opts:['Edinburgh','Glasgow','Aberdeen','Dundee']},
  {q:'What mountain range runs through the Scottish Highlands?',correct:'The Grampians',opts:['The Pennines','The Grampians','The Cairngorms','The Cheviots']}
];
