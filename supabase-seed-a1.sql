-- ============================================================
-- DeutschMeister — A1 fixed content, days 1-7
-- Run AFTER supabase-schema.sql. Safe to re-run.
--
-- This is the FIXED LAYER. Every word, gender, plural and
-- sentence here is verified German. AI is never permitted to
-- generate or alter anything in this file — it may only build
-- practice on top of it.
--
-- File is UTF-8. Umlauts and ß are correct and intentional.
-- ============================================================

delete from public.vocabulary_master where level = 'A1' and day_number <= 7;
delete from public.curriculum_days where level = 'A1' and day_number <= 7;

-- ------------------------------------------------------------
-- Curriculum: what happens on each day
-- ------------------------------------------------------------
insert into public.curriculum_days
  (level, day_number, title, grammar_focus, vocab_topic, speaking_prompt, production_prompt)
values
('A1', 1, 'Hallo, ich bin…', 'The verb sein and personal pronouns', 'Greetings and introductions',
 'Introduce yourself out loud: your name, where you come from, and where you live now.',
 'Write four sentences introducing yourself. Use ich bin, ich komme aus, ich wohne in.'),

('A1', 2, 'Zahlen und Zeit', 'Numbers 1-100 and telling the time', 'Numbers and time',
 'Say your phone number, your age, and what time you get up every day.',
 'Write your timetable for tomorrow with five times and activities.'),

('A1', 3, 'Meine Familie', 'Possessive articles: mein, dein, sein, ihr', 'Family and people',
 'Describe your family out loud: who they are, their names and their ages.',
 'Write six sentences about your family using mein and meine correctly.'),

('A1', 4, 'Essen und Trinken', 'The Akkusativ case after essen, trinken and haben', 'Food and drink',
 'Say what you ate and drank today, and what you like and do not like.',
 'Write a restaurant order and describe your favourite meal in five sentences.'),

('A1', 5, 'Meine Wohnung', 'Definite and indefinite articles: der, die, das, ein, eine', 'The home',
 'Describe the room you are sitting in right now. Name at least eight things.',
 'Describe your flat: how many rooms it has and what is in each one.'),

('A1', 6, 'In der Stadt', 'Prepositions of place and asking for directions', 'The city and getting around',
 'Explain out loud how you get from your home to the nearest supermarket.',
 'Write directions from the train station to your home using links, rechts and geradeaus.'),

('A1', 7, 'Mein Alltag', 'Modal verbs: können, müssen, wollen, mögen', 'Daily routine and common verbs',
 'Describe your whole day, from waking up to going to sleep.',
 'Write about your normal day using at least four different modal verbs.');

-- ------------------------------------------------------------
-- Day 1 — Greetings and introductions
-- ------------------------------------------------------------
insert into public.vocabulary_master
  (level, day_number, german, english, article, plural, word_type, example_de, example_en)
values
('A1',1,'hallo','hello',null,null,'phrase','Hallo, wie geht es dir?','Hello, how are you?'),
('A1',1,'guten Morgen','good morning',null,null,'phrase','Guten Morgen, hast du gut geschlafen?','Good morning, did you sleep well?'),
('A1',1,'guten Tag','good day',null,null,'phrase','Guten Tag, ich heiße Anna.','Good day, my name is Anna.'),
('A1',1,'guten Abend','good evening',null,null,'phrase','Guten Abend, kommen Sie herein.','Good evening, come in.'),
('A1',1,'gute Nacht','good night',null,null,'phrase','Gute Nacht, schlaf gut.','Good night, sleep well.'),
('A1',1,'tschüss','bye',null,null,'phrase','Tschüss, bis morgen!','Bye, see you tomorrow!'),
('A1',1,'auf Wiedersehen','goodbye',null,null,'phrase','Auf Wiedersehen, Frau Schmidt.','Goodbye, Mrs Schmidt.'),
('A1',1,'ja','yes',null,null,'adverb','Ja, das ist richtig.','Yes, that is correct.'),
('A1',1,'nein','no',null,null,'adverb','Nein, ich habe keine Zeit.','No, I do not have time.'),
('A1',1,'bitte','please, you are welcome',null,null,'adverb','Einen Kaffee, bitte.','A coffee, please.'),
('A1',1,'danke','thank you',null,null,'adverb','Danke für deine Hilfe.','Thank you for your help.'),
('A1',1,'Name','name','der','Namen','noun','Mein Name ist Thomas.','My name is Thomas.'),
('A1',1,'ich','I',null,null,'pronoun','Ich komme aus Indien.','I come from India.'),
('A1',1,'du','you (informal)',null,null,'pronoun','Woher kommst du?','Where do you come from?'),
('A1',1,'er','he',null,null,'pronoun','Er wohnt in Berlin.','He lives in Berlin.'),
('A1',1,'sie','she',null,null,'pronoun','Sie spricht sehr gut Deutsch.','She speaks German very well.'),
('A1',1,'es','it',null,null,'pronoun','Es ist heute kalt.','It is cold today.'),
('A1',1,'wir','we',null,null,'pronoun','Wir lernen zusammen Deutsch.','We are learning German together.'),
('A1',1,'ihr','you (plural)',null,null,'pronoun','Wo wohnt ihr jetzt?','Where do you live now?'),
('A1',1,'Sie','you (formal)',null,null,'pronoun','Wie heißen Sie?','What is your name?'),
('A1',1,'sein','to be',null,null,'verb','Ich bin neu hier.','I am new here.'),
('A1',1,'heißen','to be called',null,null,'verb','Ich heiße Maria.','My name is Maria.'),
('A1',1,'kommen','to come',null,null,'verb','Ich komme aus Deutschland.','I come from Germany.'),
('A1',1,'wohnen','to live, to reside',null,null,'verb','Wir wohnen in München.','We live in Munich.'),
('A1',1,'sprechen','to speak',null,null,'verb','Sprechen Sie Englisch?','Do you speak English?'),
('A1',1,'Land','country','das','Länder','noun','Deutschland ist ein schönes Land.','Germany is a beautiful country.'),
('A1',1,'Sprache','language','die','Sprachen','noun','Deutsch ist eine schwere Sprache.','German is a difficult language.'),
('A1',1,'Deutschland','Germany',null,null,'noun','Ich lebe seit einem Jahr in Deutschland.','I have lived in Germany for a year.'),
('A1',1,'Deutsch','German (the language)',null,null,'noun','Ich lerne jeden Tag Deutsch.','I learn German every day.'),
('A1',1,'wie','how',null,null,'adverb','Wie geht es Ihnen?','How are you?');

-- ------------------------------------------------------------
-- Day 2 — Numbers and time
-- ------------------------------------------------------------
insert into public.vocabulary_master
  (level, day_number, german, english, article, plural, word_type, example_de, example_en)
values
('A1',2,'eins','one',null,null,'number','Ich habe nur eins.','I only have one.'),
('A1',2,'zwei','two',null,null,'number','Ich habe zwei Brüder.','I have two brothers.'),
('A1',2,'drei','three',null,null,'number','Wir sind drei Personen.','We are three people.'),
('A1',2,'vier','four',null,null,'number','Der Tisch hat vier Stühle.','The table has four chairs.'),
('A1',2,'fünf','five',null,null,'number','Ich arbeite fünf Tage pro Woche.','I work five days a week.'),
('A1',2,'sechs','six',null,null,'number','Der Zug fährt um sechs Uhr.','The train leaves at six o clock.'),
('A1',2,'sieben','seven',null,null,'number','Eine Woche hat sieben Tage.','A week has seven days.'),
('A1',2,'acht','eight',null,null,'number','Ich schlafe acht Stunden.','I sleep eight hours.'),
('A1',2,'neun','nine',null,null,'number','Das Geschäft öffnet um neun.','The shop opens at nine.'),
('A1',2,'zehn','ten',null,null,'number','Ich brauche zehn Minuten.','I need ten minutes.'),
('A1',2,'elf','eleven',null,null,'number','Es ist elf Uhr.','It is eleven o clock.'),
('A1',2,'zwölf','twelve',null,null,'number','Das Jahr hat zwölf Monate.','The year has twelve months.'),
('A1',2,'zwanzig','twenty',null,null,'number','Ich bin zwanzig Jahre alt.','I am twenty years old.'),
('A1',2,'dreißig','thirty',null,null,'number','Der Bus kommt in dreißig Minuten.','The bus comes in thirty minutes.'),
('A1',2,'hundert','hundred',null,null,'number','Das kostet hundert Euro.','That costs one hundred euros.'),
('A1',2,'Zeit','time','die','Zeiten','noun','Ich habe heute keine Zeit.','I have no time today.'),
('A1',2,'Uhr','clock, watch','die','Uhren','noun','Meine Uhr ist kaputt.','My watch is broken.'),
('A1',2,'Stunde','hour','die','Stunden','noun','Der Film dauert zwei Stunden.','The film lasts two hours.'),
('A1',2,'Minute','minute','die','Minuten','noun','Warte bitte eine Minute.','Please wait one minute.'),
('A1',2,'Tag','day','der','Tage','noun','Der Tag war sehr lang.','The day was very long.'),
('A1',2,'Woche','week','die','Wochen','noun','Nächste Woche fahre ich nach Berlin.','Next week I am going to Berlin.'),
('A1',2,'Monat','month','der','Monate','noun','Der Monat Mai ist schön.','The month of May is beautiful.'),
('A1',2,'Jahr','year','das','Jahre','noun','Ich lerne seit einem Jahr Deutsch.','I have been learning German for a year.'),
('A1',2,'heute','today',null,null,'adverb','Heute ist Montag.','Today is Monday.'),
('A1',2,'morgen','tomorrow',null,null,'adverb','Morgen habe ich einen Termin.','Tomorrow I have an appointment.'),
('A1',2,'gestern','yesterday',null,null,'adverb','Gestern war ich zu Hause.','Yesterday I was at home.'),
('A1',2,'jetzt','now',null,null,'adverb','Ich muss jetzt gehen.','I have to go now.'),
('A1',2,'wann','when',null,null,'adverb','Wann kommst du nach Hause?','When are you coming home?'),
('A1',2,'spät','late',null,null,'adjective','Es ist schon sehr spät.','It is already very late.'),
('A1',2,'früh','early',null,null,'adjective','Ich stehe immer früh auf.','I always get up early.');

-- ------------------------------------------------------------
-- Day 3 — Family and people
-- ------------------------------------------------------------
insert into public.vocabulary_master
  (level, day_number, german, english, article, plural, word_type, example_de, example_en)
values
('A1',3,'Familie','family','die','Familien','noun','Meine Familie wohnt in Indien.','My family lives in India.'),
('A1',3,'Vater','father','der','Väter','noun','Mein Vater ist Lehrer.','My father is a teacher.'),
('A1',3,'Mutter','mother','die','Mütter','noun','Meine Mutter kocht sehr gut.','My mother cooks very well.'),
('A1',3,'Eltern','parents','die','Eltern','noun','Meine Eltern kommen morgen.','My parents are coming tomorrow.'),
('A1',3,'Sohn','son','der','Söhne','noun','Ihr Sohn geht schon zur Schule.','Her son already goes to school.'),
('A1',3,'Tochter','daughter','die','Töchter','noun','Seine Tochter ist zehn Jahre alt.','His daughter is ten years old.'),
('A1',3,'Kind','child','das','Kinder','noun','Das Kind spielt im Garten.','The child is playing in the garden.'),
('A1',3,'Bruder','brother','der','Brüder','noun','Mein Bruder wohnt in Hamburg.','My brother lives in Hamburg.'),
('A1',3,'Schwester','sister','die','Schwestern','noun','Meine Schwester studiert Medizin.','My sister studies medicine.'),
('A1',3,'Geschwister','siblings','die','Geschwister','noun','Hast du Geschwister?','Do you have siblings?'),
('A1',3,'Mann','man, husband','der','Männer','noun','Der Mann dort ist mein Chef.','The man over there is my boss.'),
('A1',3,'Frau','woman, wife','die','Frauen','noun','Die Frau arbeitet bei der Bank.','The woman works at the bank.'),
('A1',3,'Freund','friend (male)','der','Freunde','noun','Mein Freund hilft mir immer.','My friend always helps me.'),
('A1',3,'Freundin','friend (female)','die','Freundinnen','noun','Meine Freundin kommt aus Polen.','My friend comes from Poland.'),
('A1',3,'Junge','boy','der','Jungen','noun','Der Junge liest ein Buch.','The boy is reading a book.'),
('A1',3,'Mädchen','girl','das','Mädchen','noun','Das Mädchen singt sehr schön.','The girl sings very beautifully.'),
('A1',3,'Leute','people','die','Leute','noun','Hier sind viele nette Leute.','There are many nice people here.'),
('A1',3,'Mensch','human, person','der','Menschen','noun','Jeder Mensch macht Fehler.','Every person makes mistakes.'),
('A1',3,'Oma','grandma','die','Omas','noun','Meine Oma ist achtzig Jahre alt.','My grandma is eighty years old.'),
('A1',3,'Opa','grandpa','der','Opas','noun','Mein Opa erzählt gute Geschichten.','My grandpa tells good stories.'),
('A1',3,'alt','old',null,null,'adjective','Mein Auto ist sehr alt.','My car is very old.'),
('A1',3,'jung','young',null,null,'adjective','Sie ist noch sehr jung.','She is still very young.'),
('A1',3,'groß','big, tall',null,null,'adjective','Mein Bruder ist sehr groß.','My brother is very tall.'),
('A1',3,'klein','small',null,null,'adjective','Die Wohnung ist zu klein.','The flat is too small.'),
('A1',3,'verheiratet','married',null,null,'adjective','Meine Schwester ist verheiratet.','My sister is married.'),
('A1',3,'ledig','single, unmarried',null,null,'adjective','Ich bin noch ledig.','I am still single.'),
('A1',3,'haben','to have',null,null,'verb','Ich habe zwei Kinder.','I have two children.'),
('A1',3,'kennen','to know (a person)',null,null,'verb','Kennst du meinen Bruder?','Do you know my brother?'),
('A1',3,'lieben','to love',null,null,'verb','Ich liebe meine Familie.','I love my family.'),
('A1',3,'zusammen','together',null,null,'adverb','Wir essen jeden Abend zusammen.','We eat together every evening.');

-- ------------------------------------------------------------
-- Day 4 — Food and drink
-- ------------------------------------------------------------
insert into public.vocabulary_master
  (level, day_number, german, english, article, plural, word_type, example_de, example_en)
values
('A1',4,'Essen','food, meal','das','Essen','noun','Das Essen hier ist sehr gut.','The food here is very good.'),
('A1',4,'Frühstück','breakfast','das','Frühstücke','noun','Das Frühstück ist um acht Uhr.','Breakfast is at eight o clock.'),
('A1',4,'Mittagessen','lunch','das','Mittagessen','noun','Zum Mittagessen esse ich Salat.','For lunch I eat salad.'),
('A1',4,'Abendessen','dinner','das','Abendessen','noun','Das Abendessen ist fertig.','Dinner is ready.'),
('A1',4,'Brot','bread','das','Brote','noun','Ich kaufe jeden Tag frisches Brot.','I buy fresh bread every day.'),
('A1',4,'Brötchen','bread roll','das','Brötchen','noun','Zum Frühstück esse ich zwei Brötchen.','For breakfast I eat two bread rolls.'),
('A1',4,'Butter','butter','die',null,'noun','Die Butter ist im Kühlschrank.','The butter is in the fridge.'),
('A1',4,'Käse','cheese','der','Käse','noun','Deutscher Käse schmeckt gut.','German cheese tastes good.'),
('A1',4,'Ei','egg','das','Eier','noun','Ich esse morgens ein Ei.','I eat an egg in the morning.'),
('A1',4,'Fleisch','meat','das',null,'noun','Ich esse kein Fleisch.','I do not eat meat.'),
('A1',4,'Fisch','fish','der','Fische','noun','Der Fisch ist sehr frisch.','The fish is very fresh.'),
('A1',4,'Gemüse','vegetables','das',null,'noun','Gemüse ist sehr gesund.','Vegetables are very healthy.'),
('A1',4,'Obst','fruit','das',null,'noun','Ich esse jeden Tag Obst.','I eat fruit every day.'),
('A1',4,'Apfel','apple','der','Äpfel','noun','Der Apfel ist rot und süß.','The apple is red and sweet.'),
('A1',4,'Kartoffel','potato','die','Kartoffeln','noun','Kartoffeln sind in Deutschland sehr beliebt.','Potatoes are very popular in Germany.'),
('A1',4,'Reis','rice','der',null,'noun','Ich koche heute Reis mit Gemüse.','Today I am cooking rice with vegetables.'),
('A1',4,'Nudeln','pasta, noodles','die','Nudeln','noun','Die Kinder essen gern Nudeln.','The children like eating pasta.'),
('A1',4,'Suppe','soup','die','Suppen','noun','Die Suppe ist noch zu heiß.','The soup is still too hot.'),
('A1',4,'Salat','salad','der','Salate','noun','Ich nehme einen großen Salat.','I will take a large salad.'),
('A1',4,'Wasser','water','das',null,'noun','Ein Glas Wasser, bitte.','A glass of water, please.'),
('A1',4,'Kaffee','coffee','der',null,'noun','Ich trinke morgens immer Kaffee.','I always drink coffee in the morning.'),
('A1',4,'Tee','tea','der','Tees','noun','Möchtest du einen Tee?','Would you like a tea?'),
('A1',4,'Milch','milk','die',null,'noun','Die Milch ist leider sauer.','Unfortunately the milk is sour.'),
('A1',4,'Saft','juice','der','Säfte','noun','Der Saft ist frisch gepresst.','The juice is freshly squeezed.'),
('A1',4,'Bier','beer','das','Biere','noun','In Bayern trinkt man viel Bier.','In Bavaria people drink a lot of beer.'),
('A1',4,'Wein','wine','der','Weine','noun','Der Wein kommt aus Frankreich.','The wine comes from France.'),
('A1',4,'essen','to eat',null,null,'verb','Was essen wir heute Abend?','What are we eating this evening?'),
('A1',4,'trinken','to drink',null,null,'verb','Ich trinke viel Wasser.','I drink a lot of water.'),
('A1',4,'kochen','to cook',null,null,'verb','Meine Mutter kocht sehr gern.','My mother likes cooking very much.'),
('A1',4,'lecker','delicious',null,null,'adjective','Das Essen war wirklich lecker.','The food was really delicious.');

-- ------------------------------------------------------------
-- Day 5 — The home
-- ------------------------------------------------------------
insert into public.vocabulary_master
  (level, day_number, german, english, article, plural, word_type, example_de, example_en)
values
('A1',5,'Wohnung','flat, apartment','die','Wohnungen','noun','Meine Wohnung hat drei Zimmer.','My flat has three rooms.'),
('A1',5,'Haus','house','das','Häuser','noun','Das Haus ist sehr alt.','The house is very old.'),
('A1',5,'Zimmer','room','das','Zimmer','noun','Mein Zimmer ist klein aber hell.','My room is small but bright.'),
('A1',5,'Küche','kitchen','die','Küchen','noun','Die Küche ist sehr modern.','The kitchen is very modern.'),
('A1',5,'Bad','bathroom','das','Bäder','noun','Das Bad ist neben der Küche.','The bathroom is next to the kitchen.'),
('A1',5,'Schlafzimmer','bedroom','das','Schlafzimmer','noun','Das Schlafzimmer ist sehr ruhig.','The bedroom is very quiet.'),
('A1',5,'Wohnzimmer','living room','das','Wohnzimmer','noun','Wir sitzen abends im Wohnzimmer.','We sit in the living room in the evening.'),
('A1',5,'Tür','door','die','Türen','noun','Bitte mach die Tür zu.','Please close the door.'),
('A1',5,'Fenster','window','das','Fenster','noun','Das Fenster ist offen.','The window is open.'),
('A1',5,'Tisch','table','der','Tische','noun','Der Tisch steht in der Mitte.','The table is in the middle.'),
('A1',5,'Stuhl','chair','der','Stühle','noun','Der Stuhl ist sehr bequem.','The chair is very comfortable.'),
('A1',5,'Bett','bed','das','Betten','noun','Mein Bett ist groß und weich.','My bed is big and soft.'),
('A1',5,'Schrank','cupboard, wardrobe','der','Schränke','noun','Der Schrank ist voll mit Kleidung.','The wardrobe is full of clothes.'),
('A1',5,'Sofa','sofa','das','Sofas','noun','Das Sofa ist neu.','The sofa is new.'),
('A1',5,'Lampe','lamp','die','Lampen','noun','Die Lampe funktioniert nicht mehr.','The lamp does not work any more.'),
('A1',5,'Boden','floor','der','Böden','noun','Der Boden ist aus Holz.','The floor is made of wood.'),
('A1',5,'Wand','wall','die','Wände','noun','An der Wand hängt ein Bild.','A picture hangs on the wall.'),
('A1',5,'Schlüssel','key','der','Schlüssel','noun','Ich habe meinen Schlüssel vergessen.','I forgot my key.'),
('A1',5,'Miete','rent','die','Mieten','noun','Die Miete ist sehr hoch.','The rent is very high.'),
('A1',5,'Garten','garden','der','Gärten','noun','Im Garten stehen zwei Bäume.','There are two trees in the garden.'),
('A1',5,'Balkon','balcony','der','Balkone','noun','Wir frühstücken oft auf dem Balkon.','We often have breakfast on the balcony.'),
('A1',5,'Treppe','stairs','die','Treppen','noun','Die Treppe ist sehr steil.','The stairs are very steep.'),
('A1',5,'Keller','cellar','der','Keller','noun','Die Fahrräder stehen im Keller.','The bicycles are in the cellar.'),
('A1',5,'mieten','to rent',null,null,'verb','Wir mieten eine kleine Wohnung.','We are renting a small flat.'),
('A1',5,'suchen','to look for',null,null,'verb','Ich suche eine neue Wohnung.','I am looking for a new flat.'),
('A1',5,'finden','to find',null,null,'verb','Ich kann meinen Schlüssel nicht finden.','I cannot find my key.'),
('A1',5,'hell','bright',null,null,'adjective','Das Zimmer ist sehr hell.','The room is very bright.'),
('A1',5,'dunkel','dark',null,null,'adjective','Im Winter wird es früh dunkel.','In winter it gets dark early.'),
('A1',5,'teuer','expensive',null,null,'adjective','Die Wohnung ist zu teuer.','The flat is too expensive.'),
('A1',5,'billig','cheap',null,null,'adjective','Das Sofa war sehr billig.','The sofa was very cheap.');

-- ------------------------------------------------------------
-- Day 6 — The city and getting around
-- ------------------------------------------------------------
insert into public.vocabulary_master
  (level, day_number, german, english, article, plural, word_type, example_de, example_en)
values
('A1',6,'Stadt','city, town','die','Städte','noun','Die Stadt ist sehr groß.','The city is very big.'),
('A1',6,'Dorf','village','das','Dörfer','noun','Ich komme aus einem kleinen Dorf.','I come from a small village.'),
('A1',6,'Straße','street','die','Straßen','noun','Die Straße ist heute gesperrt.','The street is closed today.'),
('A1',6,'Platz','square, place','der','Plätze','noun','Der Platz ist voller Menschen.','The square is full of people.'),
('A1',6,'Bahnhof','train station','der','Bahnhöfe','noun','Der Bahnhof ist nicht weit von hier.','The train station is not far from here.'),
('A1',6,'Flughafen','airport','der','Flughäfen','noun','Der Flughafen liegt außerhalb der Stadt.','The airport is outside the city.'),
('A1',6,'Haltestelle','stop (bus, tram)','die','Haltestellen','noun','Die Haltestelle ist gleich um die Ecke.','The stop is just around the corner.'),
('A1',6,'Bus','bus','der','Busse','noun','Der Bus kommt in fünf Minuten.','The bus comes in five minutes.'),
('A1',6,'Zug','train','der','Züge','noun','Der Zug nach Berlin fährt um zehn.','The train to Berlin leaves at ten.'),
('A1',6,'Auto','car','das','Autos','noun','Ich habe kein Auto.','I do not have a car.'),
('A1',6,'Fahrrad','bicycle','das','Fahrräder','noun','Ich fahre mit dem Fahrrad zur Arbeit.','I ride my bicycle to work.'),
('A1',6,'U-Bahn','underground, metro','die','U-Bahnen','noun','Die U-Bahn fährt alle fünf Minuten.','The underground runs every five minutes.'),
('A1',6,'Geschäft','shop','das','Geschäfte','noun','Das Geschäft ist sonntags geschlossen.','The shop is closed on Sundays.'),
('A1',6,'Supermarkt','supermarket','der','Supermärkte','noun','Ich gehe in den Supermarkt.','I am going to the supermarket.'),
('A1',6,'Apotheke','pharmacy','die','Apotheken','noun','Die Apotheke ist neben der Bank.','The pharmacy is next to the bank.'),
('A1',6,'Bank','bank','die','Banken','noun','Ich muss heute zur Bank gehen.','I have to go to the bank today.'),
('A1',6,'Post','post office','die',null,'noun','Die Post schließt um achtzehn Uhr.','The post office closes at six o clock.'),
('A1',6,'Restaurant','restaurant','das','Restaurants','noun','Das Restaurant ist sehr beliebt.','The restaurant is very popular.'),
('A1',6,'Krankenhaus','hospital','das','Krankenhäuser','noun','Das Krankenhaus ist im Zentrum.','The hospital is in the centre.'),
('A1',6,'Schule','school','die','Schulen','noun','Die Kinder gehen zu Fuß zur Schule.','The children walk to school.'),
('A1',6,'links','left',null,null,'adverb','Gehen Sie an der Ampel links.','Turn left at the traffic light.'),
('A1',6,'rechts','right',null,null,'adverb','Das Museum ist rechts.','The museum is on the right.'),
('A1',6,'geradeaus','straight ahead',null,null,'adverb','Gehen Sie immer geradeaus.','Keep going straight ahead.'),
('A1',6,'fahren','to drive, to travel',null,null,'verb','Ich fahre morgen nach Hamburg.','I am travelling to Hamburg tomorrow.'),
('A1',6,'gehen','to go, to walk',null,null,'verb','Wir gehen heute ins Kino.','We are going to the cinema today.'),
('A1',6,'warten','to wait',null,null,'verb','Ich warte seit zwanzig Minuten.','I have been waiting for twenty minutes.'),
('A1',6,'kaufen','to buy',null,null,'verb','Ich kaufe Brot und Milch.','I am buying bread and milk.'),
('A1',6,'kosten','to cost',null,null,'verb','Wie viel kostet das?','How much does that cost?'),
('A1',6,'Geld','money','das',null,'noun','Ich habe nicht genug Geld dabei.','I do not have enough money with me.'),
('A1',6,'Weg','way, path','der','Wege','noun','Kennen Sie den Weg zum Bahnhof?','Do you know the way to the station?');

-- ------------------------------------------------------------
-- Day 7 — Daily routine and common verbs
-- ------------------------------------------------------------
insert into public.vocabulary_master
  (level, day_number, german, english, article, plural, word_type, example_de, example_en)
values
('A1',7,'Alltag','daily routine','der',null,'noun','Mein Alltag ist immer gleich.','My daily routine is always the same.'),
('A1',7,'Arbeit','work','die','Arbeiten','noun','Die Arbeit macht mir Spaß.','I enjoy the work.'),
('A1',7,'arbeiten','to work',null,null,'verb','Ich arbeite von neun bis siebzehn Uhr.','I work from nine to five.'),
('A1',7,'aufstehen','to get up',null,null,'verb','Ich stehe jeden Tag um sechs auf.','I get up at six every day.'),
('A1',7,'schlafen','to sleep',null,null,'verb','Ich schlafe meistens sieben Stunden.','I usually sleep seven hours.'),
('A1',7,'duschen','to shower',null,null,'verb','Ich dusche jeden Morgen.','I shower every morning.'),
('A1',7,'frühstücken','to have breakfast',null,null,'verb','Wir frühstücken um halb acht.','We have breakfast at half past seven.'),
('A1',7,'lernen','to learn',null,null,'verb','Ich lerne jeden Abend Deutsch.','I learn German every evening.'),
('A1',7,'machen','to make, to do',null,null,'verb','Was machst du am Wochenende?','What are you doing at the weekend?'),
('A1',7,'sehen','to see',null,null,'verb','Ich sehe dich morgen.','I will see you tomorrow.'),
('A1',7,'hören','to hear, to listen',null,null,'verb','Ich höre gern Musik.','I like listening to music.'),
('A1',7,'lesen','to read',null,null,'verb','Ich lese jeden Tag die Zeitung.','I read the newspaper every day.'),
('A1',7,'schreiben','to write',null,null,'verb','Ich schreibe eine E-Mail an meinen Chef.','I am writing an email to my boss.'),
('A1',7,'verstehen','to understand',null,null,'verb','Ich verstehe das noch nicht.','I do not understand that yet.'),
('A1',7,'sagen','to say',null,null,'verb','Was hast du gesagt?','What did you say?'),
('A1',7,'fragen','to ask',null,null,'verb','Darf ich Sie etwas fragen?','May I ask you something?'),
('A1',7,'antworten','to answer',null,null,'verb','Bitte antworten Sie mir bald.','Please answer me soon.'),
('A1',7,'helfen','to help',null,null,'verb','Kannst du mir bitte helfen?','Can you please help me?'),
('A1',7,'brauchen','to need',null,null,'verb','Ich brauche mehr Zeit.','I need more time.'),
('A1',7,'mögen','to like',null,null,'verb','Ich mag deutsches Brot sehr.','I like German bread very much.'),
('A1',7,'wollen','to want',null,null,'verb','Ich will Deutsch lernen.','I want to learn German.'),
('A1',7,'können','can, to be able to',null,null,'verb','Ich kann schon ein bisschen Deutsch.','I can already speak a little German.'),
('A1',7,'müssen','must, to have to',null,null,'verb','Ich muss jetzt zur Arbeit.','I have to go to work now.'),
('A1',7,'gern','gladly, with pleasure',null,null,'adverb','Ich koche sehr gern.','I really like cooking.'),
('A1',7,'immer','always',null,null,'adverb','Er kommt immer zu spät.','He is always late.'),
('A1',7,'oft','often',null,null,'adverb','Wir gehen oft spazieren.','We often go for a walk.'),
('A1',7,'manchmal','sometimes',null,null,'adverb','Manchmal arbeite ich am Wochenende.','Sometimes I work at the weekend.'),
('A1',7,'nie','never',null,null,'adverb','Ich trinke nie Alkohol.','I never drink alcohol.'),
('A1',7,'schnell','fast, quick',null,null,'adjective','Du sprichst zu schnell.','You speak too fast.'),
('A1',7,'langsam','slow',null,null,'adjective','Bitte sprechen Sie langsam.','Please speak slowly.');
