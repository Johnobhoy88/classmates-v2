// Ported from classmates/src/scripts/domain/reading.js
// All content exactly preserved — every story, question, and answer option.

export interface ReadingQuestion {
  q: string;
  a: string[];
  c: number;
}

export interface ReadingStory {
  title: string;
  icon: string;
  desc: string;
  text: string;
  questions: ReadingQuestion[];
}

export type ReadingLevel = 1 | 2 | 3;

export const READING: Record<ReadingLevel, ReadingStory[]> = {
  1: [
    {
      title:'The Cat on the Hill', icon:'C', desc:'A cat finds a friend on a Scottish hill',
      text:'<p>Tam the cat sat on a big hill. The hill had soft green grass. Tam could see the loch below. The water was blue and still.</p><p>"I am cold," said Tam. He saw a fox cub by a rock. "Are you cold too?" asked Tam.</p><p>"Yes!" said the fox cub. "Let us sit in the sun." They sat on the warm rock together. The sun made them feel happy.</p><p>"You are my new friend," said Tam. The fox cub wagged her tail.</p>',
      questions:[
        {q:'Where did Tam sit?',a:['On a big hill','In a boat','At school','Under a tree'],c:0},
        {q:'What could Tam see below the hill?',a:['A castle','The loch','A shop','A road'],c:1},
        {q:'How did Tam feel at first?',a:['Hot','Hungry','Cold','Angry'],c:2},
        {q:'Who did Tam meet?',a:['A dog','A bird','A fox cub','A rabbit'],c:2},
        {q:'Where did they sit together?',a:['On a warm rock','Under a tree','In a cave','By the loch'],c:0}
      ]
    },
    {
      title:'Fish and Chips', icon:'F', desc:'A trip to the seaside',
      text:'<p>Mia and her mum went to the sea. The sand was soft and wet. Mia made a big sand castle.</p><p>"I am so hungry!" said Mia. Mum got fish and chips from the shop. The chips were hot and crispy.</p><p>A seagull flew down. It took a chip! "Hey!" said Mia. She laughed and laughed.</p><p>"What a cheeky bird," said Mum. They ate the rest fast so the birds could not get any more.</p>',
      questions:[
        {q:'Where did Mia and her mum go?',a:['To the park','To the sea','To school','To the shops'],c:1},
        {q:'What did Mia build?',a:['A sandcastle','A den','A snowman','A tower'],c:0},
        {q:'What did they eat?',a:['Pizza','Sandwiches','Fish and chips','Soup'],c:2},
        {q:'What took a chip?',a:['A cat','A dog','A seagull','A crow'],c:2},
        {q:'How did Mia react?',a:['She cried','She laughed','She ran away','She was angry'],c:1}
      ]
    },
    {
      title:'The Big Red Bus', icon:'B', desc:'Riding the bus to school',
      text:'<p>Ben got on the big red bus. He sat by the window. The bus went past the park, past the shop, and past the pond.</p><p>Ben saw ducks on the pond. One duck had six little ducklings. "So cute!" said Ben.</p><p>The bus stopped at school. Ben\'s best pal was at the gate. "Hi Sam!" said Ben. "I saw baby ducks on the way!"</p><p>"Lucky!" said Sam. "Let us draw them in class." And they did.</p>',
      questions:[
        {q:'What colour was the bus?',a:['Blue','Green','Red','Yellow'],c:2},
        {q:'Where did Ben sit?',a:['At the back','By the door','By the window','On the floor'],c:2},
        {q:'What did Ben see on the pond?',a:['Swans','Fish','Frogs','Ducks'],c:3},
        {q:'How many ducklings were there?',a:['Four','Five','Six','Seven'],c:2},
        {q:'What did Ben and Sam do in class?',a:['Painted','Drew the ducks','Read a book','Played a game'],c:1}
      ]
    },
    {
      title:'The Snowy Cairngorms', icon:'S', desc:'Playing in the snow',
      text:'<p>It was a cold day. Mum said, "Let us go to the snow!" They drove up the big hill to the Cairngorms.</p><p>The trees were white. The ground was white. Everything was white! "Wow!" said Isla.</p><p>Isla made a snowman. She gave it a hat and a scarf. Dad helped her make a big snowball.</p><p>"Can we come back tomorrow?" asked Isla. "If there is still snow," said Mum. Isla hoped it would snow all night.</p>',
      questions:[
        {q:'Where did they go?',a:['The beach','The Cairngorms','The park','School'],c:1},
        {q:'What colour was everything?',a:['Green','Blue','White','Red'],c:2},
        {q:'What did Isla make?',a:['A sandcastle','A snowman','A cake','A den'],c:1},
        {q:'Who helped with the snowball?',a:['Mum','Gran','Her friend','Dad'],c:3},
        {q:'What did Isla hope for?',a:['More rain','More snow','A sunny day','A day off school'],c:1}
      ]
    },
    {
      title:'Hamish the Highland Cow', icon:'H', desc:'A friendly cow on the farm',
      text:'<p>Hamish was a Highland cow. He had long brown hair and big horns. He lived on a farm near the loch.</p><p>Every morning, the farmer gave Hamish fresh hay. Hamish liked to eat it slowly. He was never in a rush.</p><p>One day, a little lamb got stuck in the mud. Hamish walked over and stood by the lamb. The farmer saw them and came to help.</p><p>"Good boy, Hamish," said the farmer. Hamish just chewed his hay and looked at the loch.</p>',
      questions:[
        {q:'What kind of animal is Hamish?',a:['A sheep','A horse','A Highland cow','A dog'],c:2},
        {q:'What did Hamish look like?',a:['Short white hair','Long brown hair and big horns','Spots','Stripes'],c:1},
        {q:'What did the farmer give Hamish?',a:['Carrots','Milk','Fresh hay','Bread'],c:2},
        {q:'What happened to the lamb?',a:['It ran away','It got stuck in mud','It fell in the loch','It was lost'],c:1},
        {q:'What did Hamish do after the farmer helped?',a:['Ran away','Went to sleep','Chewed his hay','Jumped in the loch'],c:2}
      ]
    },
    {
      title:'The Rainy Picnic', icon:'R', desc:'A picnic that gets wet',
      text:'<p>Finn packed a bag for the picnic. He put in sandwiches, juice, and an apple. "This will be fun!" he said.</p><p>They walked to the park. Finn put the blanket on the grass. Then big dark clouds came over the hill.</p><p>Drip. Drip. SPLASH! The rain came down fast. "Quick, under the tree!" said Mum.</p><p>They ate their sandwiches under the tree. "This is the best rainy picnic ever!" laughed Finn.</p>',
      questions:[
        {q:'What did Finn pack?',a:['Toys','Sandwiches, juice, and an apple','Books','Clothes'],c:1},
        {q:'Where did they go?',a:['The beach','School','The park','The shops'],c:2},
        {q:'What happened next?',a:['It snowed','The sun came out','It started raining','A dog appeared'],c:2},
        {q:'Where did they shelter?',a:['In a car','Under a tree','In a shop','Under a bridge'],c:1},
        {q:'How did Finn feel about the rainy picnic?',a:['Sad','Angry','Happy','Scared'],c:2}
      ]
    }
  ],
  2: [
    {
      title:'The Loch Monster', icon:'L', desc:'An adventure at a Scottish loch',
      text:'<p>Ewan and Isla walked along the shore of a dark, quiet loch. The mountains rose up on both sides, covered in purple heather. "Do you think a monster really lives in there?" whispered Isla.</p><p>"Don\'t be daft," said Ewan. But he kept watching the water just in case.</p><p>Suddenly, something splashed near the reeds. They both jumped. A large grey shape moved under the surface. Isla grabbed Ewan\'s arm. "Look! There!"</p><p>The shape rose higher... and a seal popped its head out of the water. It looked at them with big round eyes, then dove back under with a splash.</p><p>Ewan laughed so hard he sat down on the grass. "Our monster is a seal!" Isla giggled too. They watched the seal playing in the loch until the sun went down.</p>',
      questions:[
        {q:'What was growing on the mountains?',a:['Daisies','Purple heather','Trees','Moss'],c:1},
        {q:'What did Isla think might be in the loch?',a:['A fish','A whale','A monster','A boat'],c:2},
        {q:'What splashed near the reeds?',a:['A monster','A fish','A seal','A duck'],c:2},
        {q:'How did Ewan react when he saw the seal?',a:['He screamed','He cried','He ran away','He laughed'],c:3},
        {q:'When did they stop watching?',a:['At lunchtime','When it rained','When the sun went down','When they got bored'],c:2}
      ]
    },
    {
      title:'The Highland Games', icon:'H', desc:'Competing at the Highland Games',
      text:'<p>Finn could hear the bagpipes before he even saw the field. The Highland Games were the best day of the year. People came from all the villages around to compete, dance, and eat.</p><p>His big sister Ailsa was entering the Highland dancing competition. She wore a kilt with a velvet jacket and her shoes made clicking sounds on the wooden platform.</p><p>"Are you nervous?" asked Finn. "A wee bit," said Ailsa, but she was smiling.</p><p>When the pipes started playing, Ailsa danced like she was floating. Her feet moved so fast Finn could barely follow them. The crowd clapped along.</p><p>At the end, the judge pinned a red rosette on Ailsa\'s jacket. First place! Finn cheered louder than anyone. They celebrated with hot soup and freshly baked scones from the tea tent.</p>',
      questions:[
        {q:'What could Finn hear before seeing the field?',a:['Drums','Bagpipes','Singing','Cars'],c:1},
        {q:'What competition was Ailsa entering?',a:['Running','Caber toss','Highland dancing','Singing'],c:2},
        {q:'What colour was Ailsa\'s rosette?',a:['Blue','Gold','Green','Red'],c:3},
        {q:'What place did Ailsa come?',a:['Second','Third','Last','First'],c:3},
        {q:'What did they eat to celebrate?',a:['Fish and chips','Soup and scones','Cake','Sandwiches'],c:1}
      ]
    },
    {
      title:'The Lighthouse Keeper', icon:'K', desc:'A stormy night at the lighthouse',
      text:'<p>Old Hamish had looked after the lighthouse on the rocky island for thirty years. Every evening, he climbed the spiral stairs and lit the great lamp. Its beam swept across the dark sea, warning ships away from the rocks.</p><p>One winter night, a terrible storm rolled in. The wind howled and waves crashed against the lighthouse walls. Hamish heard a sound \u2014 a ship\'s horn, close and desperate.</p><p>He pointed the spotlight towards the sound. There, between the waves, he could see a small fishing boat being tossed about. Hamish grabbed his radio. "Fishing vessel, steer north! The rocks are south of you!"</p><p>The boat turned slowly, fighting the waves. Minutes felt like hours. Finally, the little boat made it past the rocks and into the calm water behind the island.</p><p>The next morning, the fisherman came to thank Hamish. "You saved our lives," he said. Hamish just smiled and poured them all a cup of tea.</p>',
      questions:[
        {q:'How long had Hamish been a lighthouse keeper?',a:['Ten years','Twenty years','Thirty years','Forty years'],c:2},
        {q:'What did Hamish do every evening?',a:['Cooked dinner','Went fishing','Lit the great lamp','Read a book'],c:2},
        {q:'What was happening during the storm?',a:['A boat was in danger','A plane was lost','The lighthouse broke','Fish were jumping'],c:0},
        {q:'How did Hamish help the boat?',a:['He swam to it','He used the radio','He called the police','He threw a rope'],c:1},
        {q:'What did the fisherman do the next morning?',a:['Left quietly','Brought a gift','Came to thank Hamish','Wrote a letter'],c:2}
      ]
    },
    {
      title:'The Jacobite Steam Train', icon:'J', desc:'A magical train journey',
      text:'<p>Ailsa pressed her face against the window as the old steam train pulled out of Fort William station. Thick white smoke puffed from the engine, and the smell of coal drifted through the carriage.</p><p>"This is the train from the wizard films!" said her wee brother Callum, bouncing in his seat. Their gran smiled. "It was famous long before those films, mind."</p><p>The train crossed the great curved viaduct. Far below, a river sparkled in the sunlight. Mountains rose on every side, their tops hidden in cloud.</p><p>"Look! A deer!" shouted Callum, pointing at the hillside. Sure enough, a red deer stood watching the train go by, perfectly still.</p><p>When they arrived in Mallaig, they bought ice cream and sat by the harbour watching fishing boats come and go. "Best day ever," said Ailsa. Gran squeezed her hand.</p>',
      questions:[
        {q:'Where did the train leave from?',a:['Edinburgh','Glasgow','Fort William','Inverness'],c:2},
        {q:'What did Callum say about the train?',a:['It was scary','It was from the wizard films','It was too slow','It was new'],c:1},
        {q:'What did they see on the hillside?',a:['A sheep','A red deer','A fox','A rabbit'],c:1},
        {q:'Where did the train arrive?',a:['Oban','Mallaig','Glasgow','Skye'],c:1},
        {q:'What did they do when they arrived?',a:['Went swimming','Bought ice cream by the harbour','Visited a castle','Went home'],c:1}
      ]
    },
    {
      title:'A Day at Edinburgh Zoo', icon:'Z', desc:'Meeting the penguins',
      text:'<p>The school bus arrived at Edinburgh Zoo just as it opened. Mrs Campbell counted all the children twice. "Nobody wander off," she said firmly.</p><p>First they saw the giant pandas, sitting peacefully eating bamboo. "They look so cuddly," whispered Priya. "They are actually very strong," said Mrs Campbell.</p><p>The best part was the penguin parade. Every day at half past two, the penguins waddle along a path right past the visitors. Some walked in a neat line. Others stopped to look around, confused.</p><p>One penguin walked right up to Marcus and stared at him. Everyone laughed. "I think he likes your jacket," said Priya. The penguin tilted its head, then waddled back to its friends.</p><p>On the bus home, every child agreed: the penguins won the day.</p>',
      questions:[
        {q:'Who counted the children?',a:['The bus driver','Mrs Campbell','A zookeeper','Marcus'],c:1},
        {q:'What were the pandas eating?',a:['Fish','Leaves','Bamboo','Fruit'],c:2},
        {q:'What time was the penguin parade?',a:['Half past one','Half past two','Three o\'clock','Midday'],c:1},
        {q:'What did the penguin do to Marcus?',a:['Bit him','Ignored him','Stared at him','Followed him'],c:2},
        {q:'What was everyone\'s favourite part?',a:['The pandas','The gift shop','The penguins','The bus ride'],c:2}
      ]
    },
    {
      title:'The Island Ferry', icon:'F', desc:'A journey to a Scottish island',
      text:'<p>Ewan had never been on a ferry before. The boat was much bigger than he expected \u2014 it had a cafe, a play area, and even a deck where you could stand outside and watch the sea.</p><p>They were sailing to the Isle of Mull. Dad said it would take about 45 minutes from Oban. As the ferry pulled away from the harbour, seagulls swooped alongside, hoping for chips.</p><p>"Look at the water," said Mum. It was so clear you could see jellyfish floating just below the surface, their tentacles trailing like ribbons.</p><p>As Mull got closer, Ewan spotted a white-tailed eagle soaring above the cliffs. "That\'s the biggest bird in Britain," Dad said quietly. It was enormous.</p><p>When they drove off the ferry, the island roads were single-track with passing places. A Highland cow stood in the middle of the road, refusing to move. Everyone in the car laughed.</p>',
      questions:[
        {q:'Where were they sailing to?',a:['Skye','Harris','Isle of Mull','Orkney'],c:2},
        {q:'How long was the ferry crossing?',a:['10 minutes','About 45 minutes','Two hours','All day'],c:1},
        {q:'What could they see in the clear water?',a:['Dolphins','Sharks','Jellyfish','Whales'],c:2},
        {q:'What bird did Ewan spot?',a:['A puffin','A golden eagle','A white-tailed eagle','A seagull'],c:2},
        {q:'What was blocking the road on the island?',a:['A sheep','A fallen tree','A Highland cow','A tractor'],c:2}
      ]
    }
  ],
  3: [
    {
      title:'The Secret of Ben Nevis', icon:'S', desc:'A mountain adventure with a mystery',
      text:'<p>Kirsty had always wondered about the old stone cairn near the summit of Ben Nevis. Her grandfather told her stories about it. "Some say there\'s a message inside," he would whisper, "left by the first person to climb the mountain."</p><p>On the morning of her twelfth birthday, Kirsty set off with her dad to climb Scotland\'s highest mountain. The path wound through pine forests at first, then opened onto bare, rocky slopes. Clouds drifted below them like a white blanket over the valley.</p><p>After four hours of climbing, they reached the summit. The wind was fierce. There was the cairn \u2014 a neat pile of grey stones with a small metal box wedged between them.</p><p>With trembling fingers, Kirsty opened the box. Inside was a leather-bound notebook. The first page read: "If you have made it here, you have proven that determination conquers all obstacles. Add your name and pass the message on."</p><p>Hundreds of names filled the pages, going back decades. Kirsty recognised her grandfather\'s handwriting near the beginning: "Angus MacDonald, 14th August 1973." She wrote her own name underneath, tears stinging her eyes in the cold wind.</p>',
      questions:[
        {q:'What is special about Ben Nevis?',a:['It has a loch on top','It is Scotland\'s highest mountain','It is an island','It has a castle on it'],c:1},
        {q:'What was inside the cairn?',a:['A gold coin','A map','A notebook','A flag'],c:2},
        {q:'What was the message about?',a:['Weather on mountains','Scottish history','Determination conquers obstacles','How to climb safely'],c:2},
        {q:'Whose name did Kirsty find?',a:['Her teacher\'s','Her mother\'s','Her best friend\'s','Her grandfather\'s'],c:3},
        {q:'Why was the climb significant?',a:['School trip','Her birthday + grandfather had done it','Wanted to be famous','Training for a race'],c:1}
      ]
    },
    {
      title:'Edinburgh Castle Mystery', icon:'E', desc:'A historical puzzle in the capital',
      text:'<p>The school trip to Edinburgh Castle was supposed to be ordinary. But when Marcus found the folded piece of paper behind a loose stone in the Great Hall, everything changed.</p><p>The paper was old \u2014 not ancient, but old enough that the edges were brown and fragile. Written in careful handwriting were the words: "The crown sleeps where music echoes thrice. Count the lions and look beneath the third."</p><p>Marcus showed his friend Priya. "It\'s a treasure hunt," she said immediately. "The Crown Jewels are in the Crown Room, but what about the music part?"</p><p>They remembered the guide mentioning St Margaret\'s Chapel \u2014 the oldest building in Edinburgh. Inside the tiny chapel, they found carved lions along the stone archway. One, two, three... Under the third lion, they noticed a small carved thistle that looked different.</p><p>They told the guide, who examined it carefully. "This is a mason\'s mark," she said. "We\'ve been looking for evidence of the original medieval builders for years. You\'ve just found something genuinely important."</p>',
      questions:[
        {q:'Where did Marcus find the paper?',a:['In a book','Behind a loose stone','On the floor','In the gift shop'],c:1},
        {q:'What did the clue mention?',a:['A dragon and sword','A crown, music, and lions','A king and queen','A map and compass'],c:1},
        {q:'What is St Margaret\'s Chapel known for?',a:['Being tallest','Being the oldest building in Edinburgh','Having gold','Being haunted'],c:1},
        {q:'What did they find under the third lion?',a:['A treasure chest','A gold coin','A carved thistle','A secret door'],c:2},
        {q:'Why was the discovery important?',a:['It was worth money','Evidence of medieval builders','A famous painting','A royal document'],c:1}
      ]
    },
    {
      title:'The Selkie\'s Song', icon:'W', desc:'A tale from Scottish folklore',
      text:'<p>On the island of Orkney, where the sea meets the sky in every direction, the old stories say that selkies live among the waves. Selkies are seals in the water, but they can shed their skin and walk on land as humans.</p><p>Eilidh had heard these stories all her life. Her grandmother swore she had seen a selkie once, dancing on the beach at midnight. "They sing the most beautiful songs," Gran would say, "sadder than anything you\'ve ever heard."</p><p>One autumn evening, Eilidh was walking along the shore collecting shells when she heard it \u2014 a melody carried on the wind. She followed the sound to a cove she had never noticed before.</p><p>There, sitting on a smooth grey rock, was a girl about her own age. She was singing. At her feet lay what looked like a grey fur coat. When she saw Eilidh, she stopped.</p><p>"Please don\'t take it," the girl said quietly, glancing at the fur. Eilidh understood immediately. "I would never," she said. "Will you teach me the song?"</p><p>The selkie girl smiled and began to sing again. They met at that cove every autumn after that, and Eilidh never told a soul.</p>',
      questions:[
        {q:'What are selkies?',a:['Fairies in forests','Seals that can become humans','Dragons in lochs','Ghosts of sailors'],c:1},
        {q:'Where is the story set?',a:['Edinburgh','The Highlands','Orkney','Glasgow'],c:2},
        {q:'What was the selkie worried about?',a:['Being told on','Her seal skin being taken','Being chased away','Her song being stolen'],c:1},
        {q:'How did Eilidh respond?',a:['Ran away','Laughed','Promised not to take it, asked to learn the song','Called for help'],c:2},
        {q:'How often did they meet after that?',a:['Every day','Every week','Every autumn','Never again'],c:2}
      ]
    },
    {
      title:'The Battle of Bannockburn', icon:'B', desc:'Scotland\'s famous battle',
      text:'<p>In the summer of 1314, two armies faced each other near Stirling Castle. On one side stood the Scottish army, led by Robert the Bruce. On the other, the much larger English army of King Edward II.</p><p>The English expected an easy victory. They had more soldiers, more horses, and more supplies. But Robert the Bruce had something they did not \u2014 he knew the land, and he had a plan.</p><p>The Scots had dug hidden pits across the boggy ground. When the English cavalry charged, their horses stumbled and fell. The Scottish soldiers, fighting on foot with long spears called schiltrons, held their ground.</p><p>The battle lasted two days. On the second morning, the English army broke and fled. It was one of the most important victories in Scottish history.</p><p>Today, a statue of Robert the Bruce on horseback stands near the battlefield. Visitors come from all over the world to learn about the day Scotland defended its independence.</p>',
      questions:[
        {q:'When did the battle take place?',a:['1066','1314','1746','1066'],c:1},
        {q:'Who led the Scottish army?',a:['William Wallace','Robert the Bruce','Bonnie Prince Charlie','James VI'],c:1},
        {q:'What advantage did the Scots have?',a:['More soldiers','Better weapons','Knowledge of the land','A castle'],c:2},
        {q:'What were the long spears called?',a:['Pikes','Lances','Schiltrons','Swords'],c:2},
        {q:'What stands near the battlefield today?',a:['A castle','A museum','A statue of Robert the Bruce','A church'],c:2}
      ]
    },
    {
      title:'Mary Queen of Scots', icon:'M', desc:'The life of a famous queen',
      text:'<p>Mary Stuart became Queen of Scotland when she was just six days old. Her father, King James V, had died, and the tiny baby was now ruler of an entire country.</p><p>For her safety, Mary was sent to France as a child, where she grew up in the French royal court. She learned to speak French, Italian, Spanish, and Latin. She was tall, clever, and loved poetry and music.</p><p>When she returned to Scotland at eighteen, she found a country divided by religion and politics. Protestant nobles distrusted their Catholic queen. Her marriages were disastrous \u2014 her second husband was murdered, and the man suspected of the crime became her third husband.</p><p>Eventually, Mary was forced to give up her throne and fled to England, hoping her cousin Queen Elizabeth I would help. Instead, Elizabeth kept Mary imprisoned for nineteen years.</p><p>Mary\'s story remains one of the most dramatic in Scottish history \u2014 a queen from her first week of life, yet someone who spent most of her adult years as a prisoner.</p>',
      questions:[
        {q:'How old was Mary when she became queen?',a:['Five years old','Six days old','Eighteen','One year old'],c:1},
        {q:'Where did Mary grow up?',a:['England','Scotland','France','Spain'],c:2},
        {q:'How many languages could Mary speak?',a:['Two','Three','Four','Five'],c:2},
        {q:'Who was Mary\'s cousin?',a:['Queen Victoria','Queen Elizabeth I','King Henry VIII','Queen Anne'],c:1},
        {q:'What happened when Mary fled to England?',a:['She was crowned queen','She was imprisoned','She returned to France','She was welcomed'],c:1}
      ]
    },
    {
      title:'The Stone of Destiny', icon:'D', desc:'A mysterious ancient stone',
      text:'<p>Deep inside Edinburgh Castle sits a plain-looking block of sandstone. It weighs about 152 kilograms and has a rough iron ring at each end. To look at it, you might wonder why anyone would care about an old rock.</p><p>But this is the Stone of Destiny \u2014 also called the Stone of Scone \u2014 and for over a thousand years, Scottish kings were crowned sitting above it. The stone was believed to have magical powers, and legend says it would cry out when the rightful king sat upon it.</p><p>In 1296, King Edward I of England stole the stone and took it to Westminster Abbey in London. For seven hundred years, it stayed there, used in English coronations instead.</p><p>On Christmas Day 1950, four Scottish university students broke into Westminster Abbey and took the stone back. It was eventually returned to England, but the story captured Scotland\'s imagination.</p><p>Finally, in 1996, the stone was officially returned to Scotland. It now sits in Edinburgh Castle alongside the Scottish Crown Jewels, waiting \u2014 some say \u2014 for the next coronation.</p>',
      questions:[
        {q:'What is the Stone of Destiny also called?',a:['The Blarney Stone','The Stone of Scone','The Rosetta Stone','The Philosopher\'s Stone'],c:1},
        {q:'What was the stone used for?',a:['Building castles','Crowning Scottish kings','Weighing gold','Marking graves'],c:1},
        {q:'Who stole the stone in 1296?',a:['Robert the Bruce','William Wallace','King Edward I','Viking raiders'],c:2},
        {q:'What happened on Christmas Day 1950?',a:['The stone was destroyed','Students took it back','It was sold','A new stone was made'],c:1},
        {q:'Where is the stone now?',a:['Westminster Abbey','The British Museum','Edinburgh Castle','Scone Palace'],c:2}
      ]
    }
  ]
};
