#!/usr/bin/env python3
# Script to massively enrich the VALID_WORDS dictionaries in App.jsx

with open('/Users/bgr/petit-bac/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# ─── FRENCH DICTIONARY ENRICHMENTS ───────────────────────────────────

# prenom FR - enrichir les lettres faibles
old = '    O:["oscar","olivier","odile","omar","ophelie","octave","olympe","oriane","ottilie","orlando"],'
new = '    O:["oscar","olivier","odile","omar","ophelie","octave","olympe","oriane","ottilie","orlando","oceane","odette","odile","olga","olivier","ombeline","onyx","opale","orane","orion","oskar","otis","othon","othmar","otto","oumaima","oumou","ouriel","oussama","oya","ozan","oz","odalys","odelie","odilia","odilio","odille","odo","ofelia","ofra","oihana","oikane","oili","oilibhe","oilin","okello","okwuchukwu","ola","olaug","olav","olaya","ole","olena","olga","oli","olia","olimpia","olimpio","olimpiodoro","olimpiu","olina","olinda","olinne","olimpia","olivier","olivo","olmedo","olof","olola","olomide","oluwaseun","oluwatimilehin","olympias","omai","omary","ombeline","omid","omolade","omolara","omowunmi","onani","ondine","oneka","onell","oni","oniell","onika","onno","ono","onome","onur","onyeka"],'
content = content.replace(old, new, 1)

# prenom FR - U (vide/manquant)
old = '    V:["victor","valerie","vincent","virginie","violette","veronique","valentin","vanessa","valentina","valentino","valerio","vanda","vera","veronica","vianney","victoria","victorien","violaine","viviane","vaia","vanille","venisha","vace","vada","vadim","valda","valene","valente","valenti","valentinos","valenza","valere","valeria","valeriane","valeska","valey","vali","valia","valida","valika","valin","valina","valisa","valla","vallie","valma","valois","valona","valor","valora","vandea","vania","vanja","vanna","vanny","vanya","varya","vasil","vasila","vasiliki","vasilis","vassia","vasso","veda","vedat","vedika","veit","vela","velda","veli","velika","venka","verena","verica","verka","verna","verona","vesta","vidal","vigor","viia","vika","vikash","vikta","viktoria","vilja","vilma","vilo","vilva","vince","vincenza","vincenzo","vinicia","vinicio","vinita","viola","violet","violeta","violett","vira","virgil","virginia","virginija","vito","vitoria","viya","vlad","vladimira","vlasta","vlatko"]'
new = '    U:["ugo","ulrich","ulrika","ulrike","umberto","ursula","ursule","uriel","utah","uta","ute","uta","uzoma","ulysse","udine","udale","ugolin","ugolino","uguette","ugljesic","ugur","ukraina","ulana","ulane","ulca","ulda","uldis","uldine","ulena","ulent","ulexa","ulfen","ulfhildr","ulfi","ulfila","ulfkell","ulfried","ulger","ulha","ulhas","ulia","uliana","ulibe","ulice","ulick","ulid","ulida","ulie","ulijah","ulika","ulila","ulime","ulin","ulind","ulinda","uline","ulinka","ulino","ulion","uliq","ulire","ulla","ullas","ullin","ulloa","ulma","ulmari"],\n    V:["victor","valerie","vincent","virginie","violette","veronique","valentin","vanessa","valentina","valentino","valerio","vanda","vera","veronica","vianney","victoria","victorien","violaine","viviane","vaia","vanille","venisha","vace","vada","vadim","valda","valene","valente","valenti","valentinos","valenza","valere","valeria","valeriane","valeska","valey","vali","valia","valida","valika","valin","valina","valisa","valla","vallie","valma","valois","valona","valor","valora","vandea","vania","vanja","vanna","vanny","vanya","varya","vasil","vasila","vasiliki","vasilis","vassia","vasso","veda","vedat","vedika","veit","vela","velda","veli","velika","venka","verena","verica","verka","verna","verona","vesta","vidal","vigor","viia","vika","vikash","vikta","viktoria","vilja","vilma","vilo","vilva","vince","vincenza","vincenzo","vinicia","vinicio","vinita","viola","violet","violeta","violett","vira","virgil","virginia","virginija","vito","vitoria","viya","vlad","vladimira","vlasta","vlatko"]'
content = content.replace(old, new, 1)

# pays FR - enrichir U, W, X, Y manquants
old = '    V:["venezuela","vietnam","vanuatu"],},'
new = '    U:["ukraine","ouganda","uruguay","ouzbekistan","union europeenne"],\n    W:["wallis et futuna"],\n    X:["xinjiang"],\n    Y:["yemen","yougoslavie"],\n    Z:["zimbabwe","zambie","zone euro"],\n    V:["venezuela","vietnam","vanuatu"],},'
content = content.replace(old, new, 1)

# animal FR - O manque beaucoup
old = '    O:["orque","ours","ocelot","okapi","ornithorynque","outarde"],'
new = '    O:["orque","ours","ocelot","okapi","ornithorynque","outarde","oie","otarie","ouistiti","oryctérope","oiseau","oiseau mouche","ophidien","orang outan","orca","ormeau","oryctère","orvet","oscabie","osmyle","ostracé","otodidacte","otus","ouaouaron","ouette","ounce","outarde canepetiere","ouvrier fourmilier","ovibos","ovin"],'
content = content.replace(old, new, 1)

# animal FR - I manque
old = '    I:["ibis","iguane","impala","isard"],'
new = '    I:["ibis","iguane","impala","isard","insecte","irena","iguanodon","ichneumon","ichtyosaure","isopode","iguane marin"],'
content = content.replace(old, new, 1)

# animal FR - J manque
old = '    J:["jaguar","jerboa","jaguarundi"],'
new = '    J:["jaguar","jerboa","jaguarundi","jars","jument","junco","jumping spider"],'
content = content.replace(old, new, 1)

# sport FR - manquants
old = '    I:["judo","jogging","javelot","indoor","ironman"],'
new = '    I:["judo","jogging","javelot","indoor","ironman","inline skating"],'
content = content.replace(old, new, 1)

old = '    V:["volleyball","velo","voile","vtt","voltige"],'
new = '    U:["ultimate frisbee","ultramarathon"],\n    V:["volleyball","velo","voile","vtt","voltige","volleyball de plage","voile de competition","volo"],\n    X:["xc skiing"],\n    Y:["yoga","yachting"],\n    Z:["zumba"],'
content = content.replace(old, new, 1)

# metier FR - Q et U manquants
old = '    U:["urologue"],'
new = '    U:["urologue","urbaniste","usineuse"],'
content = content.replace(old, new, 1)

# capital FR - manques E, F, G, I, J
old = '    E:["edinburgh","erevan"],'
new = '    E:["edinburgh","erevan","el aaiun","epargne"],'
content = content.replace(old, new, 1)

old = '    J:["jakarta","jerusalem","jamestown","jakartajerusalem","jeddah"],'
new = '    J:["jakarta","jerusalem","jamestown","jeddah"],'
content = content.replace(old, new, 1)

# espace FR - enrichir les lettres faibles
old = '    B:["big bang","binaire","boucle cosmique"],'
new = '    B:["big bang","binaire","boucle cosmique","bolide","binaire stellaire","boite noire"],'
content = content.replace(old, new, 1)

old = '    D:["deimos","dwarf planet","distance astronomique","eclipse","deriv","debris"],'
new = '    D:["deimos","debris spatiaux","distance astronomique","disque daccretion","double etoile","dwarf planet"],'
content = content.replace(old, new, 1)

old = '    F:["fusee","force gravitationnelle","fission"],'
new = '    F:["fusee","force gravitationnelle","fission","fusee ariane","flux solaire","formation stellaire"],'
content = content.replace(old, new, 1)

old = '    H:["horizon des evenements"],'
new = '    H:["horizon des evenements","heliocentrisme","heliopause","heliosph√®re"],'
content = content.replace(old, new, 1)

old = '    I:["iss","impact meteoritique"],'
new = '    I:["iss","impact meteoritique","infrarouge","ionosphere"],'
content = content.replace(old, new, 1)

old = '    K:["kepler"],'
new = '    K:["kepler","kuiper belt","kelvin"],'
content = content.replace(old, new, 1)

old = '    N:["nebuleuse","neutron","nasa","naine blanche","naine brune"],'
new = '    N:["nebuleuse","neutron","nasa","naine blanche","naine brune","nova","nuit","nucleosynthese"],'
content = content.replace(old, new, 1)

# oceane FR - enrichissements
old = '    J:["jellyfish"],'
new = '    J:["jellyfish","jardiniere de mer"],'
content = content.replace(old, new, 1)

old = '    K:["krill","kayak marin"],'
new = '    K:["krill","kayak marin","koi","kelp"],'
content = content.replace(old, new, 1)

old = '    V:["vive","variete marine"],'
new = '    V:["vive","variete marine","vipere des mers","varech","venus de mer"],},'
content = content.replace(old, new, 1)

# medievale FR - enrichir
old = '    I:["impot"],'
new = '    I:["impot","inquisition","investiture","intronisation"],'
content = content.replace(old, new, 1)

old = '    K:["keep"],'
new = '    K:["keep","kirtle"],'
content = content.replace(old, new, 1)

old = '    V:["vassal","vitrail","vicomte"],'
new = '    V:["vassal","vitrail","vicomte","venerie","ventail","votive"],},'
content = content.replace(old, new, 1)

# technologie FR - enrichir
old = '    V:["virtual reality","virus","virtualisation"],'
new = '    U:["ui","ux","uptime"],\n    V:["virtual reality","virus","virtualisation"],\n    W:["web","wifi","widget","webassembly"],\n    X:["xml","xpath"],\n    Y:["yaml"],\n    Z:["zero day"],'
content = content.replace(old, new, 1)

# danse FR - enrichir
old = '    V:["valse","voguing","vogue"],'
new = '    U:["urban dance"],\n    V:["valse","voguing","vogue","varsoviana","ventolines"],\n    W:["waacking","waltz","wop"],\n    Y:["yosakoi"],\n    Z:["zeybek","zydeco"],'
content = content.replace(old, new, 1)

# architecture FR - enrichir
old = '    U:["urbanisme"],'
new = '    U:["urbanisme","usite"],'
content = content.replace(old, new, 1)

old = '    V:["vault","voute","vestibule"],'
new = '    V:["vault","voute","vestibule","viaduct","verandah","veranda"],},'
content = content.replace(old, new, 1)

# sport_star FR - enrichir
old = '    A:["ali","alcaraz","agassi","anelka","ashe","auger aliassime"],'
new = '    A:["ali","alcaraz","agassi","anelka","ashe","auger aliassime","ancelotti","aouita","andreeva","angelique kerber","andres iniesta","alexia putellas","adebayor","afriyie acquah","allyson felix"],'
content = content.replace(old, new, 1)

old = '    B:["bolt","benzema","becker","beckham","bird","best","buffon","biles"],'
new = '    B:["bolt","benzema","becker","beckham","bird","best","buffon","biles","bledsoe","bonne","bautista agut","borg","bojan","blatter","brooks","burns","butler"],'
content = content.replace(old, new, 1)

old = '    C:["cristiano","curry","cantona","carlos","cassius clay","clemson"],'
new = '    C:["cristiano","curry","cantona","carlos","cassius clay","clemson","crespo","casillas","cazorla","clarence seedorf","cech","cousins","copeland","chamberlain","campbell","conte"],'
content = content.replace(old, new, 1)

old = '    D:["djokovic","durant","deschamps","drogba","di stefano"],'
new = '    D:["djokovic","durant","deschamps","drogba","di stefano","dalot","dembele","depay","diego forlan","donovan","dumfries"],'
content = content.replace(old, new, 1)

old = '    E:["eusebio","eto o"],'
new = '    E:["eusebio","eto o","eriksen","embiid","emre can","evra","escobar","eder"],'
content = content.replace(old, new, 1)

old = '    F:["federer","figo"],'
new = '    F:["federer","figo","falcao","fellaini","federa","firmino","fletcher","forsberg","frings","fusco"],'
content = content.replace(old, new, 1)

old = '    G:["griezmann","gasquet","guardiola","grace"],'
new = '    G:["griezmann","gasquet","guardiola","grace","gerrard","giggs","gourcuff","gatuzzo","gyan","grosjean"],'
content = content.replace(old, new, 1)

old = '    H:["hamilton","henry","hatton","hamm"],'
new = '    H:["hamilton","henry","hatton","hamm","heskey","higuain","hazard","haaland","hodgson","hummels","hulk"],'
content = content.replace(old, new, 1)

old = '    J:["james lebron","jordan","jorginho","james"],'
new = '    J:["james lebron","jordan","jorginho","james","javi martinez","jenas","joleon lescott","jorge campos","julian nagelsmann","julius erving"],'
content = content.replace(old, new, 1)

old = '    K:["kylian","kobe","kante"],'
new = '    K:["kylian","kobe","kante","kagawa","kaka","klinsmann","kompany","koscielny","kroos","kuyt"],'
content = content.replace(old, new, 1)

old = '    L:["lebron","lin","lewis","lewandowski"],'
new = '    L:["lebron","lin","lewis","lewandowski","llorente","lukaku","lampard","lahm","laudrup","lavezzi"],'
content = content.replace(old, new, 1)

old = '    N:["nadal","neymar"],'
new = '    N:["nadal","neymar","neuer","nesta","niall quinn","nkunku","navas","nakamura"],'
content = content.replace(old, new, 1)

old = '    P:["pele","pogba","platini"],'
new = '    P:["pele","pogba","platini","payet","pirlo","puig","puskas","pique","philipp lahm","panenka"],'
content = content.replace(old, new, 1)

old = '    Q:["quidditch"],'
new = '    Q:["quidditch","quadriathlon"],\n    U:["ultimate frisbee"],\n    X:["xc mountain bike"],'
content = content.replace(old, new, 1)

old = '    R:["ronaldo","rafael","robinson","robben"],'
new = '    R:["ronaldo","rafael","robinson","robben","ribery","rivaldo","roberto carlos","ramos","rashford","rooney","rudi garcia"],'
content = content.replace(old, new, 1)

old = '    S:["schumacher","serena","salah","sneijder"],'
new = '    S:["schumacher","serena","salah","sneijder","scholes","silva","suarez","schweini","schuster","seedorf","stam","subotic"],'
content = content.replace(old, new, 1)

old = '    T:["tyson","totti"],'
new = '    T:["tyson","totti","trezeguet","thurman","thierry","troussier","tevez","touré"],'
content = content.replace(old, new, 1)

old = '    V:["vieira","van basten","villa"],'
new = '    V:["vieira","van basten","villa","vidic","vidal","valdes","van persie","van dijk"],},'
content = content.replace(old, new, 1)

# personnage FR - enrichir
old = '    A:["anakin","aragorn","alice","astérix","asterix","ariel","aladdin"],'
new = '    A:["anakin","aragorn","alice","asterix","ariel","aladdin","astroboy","achille","athos","aramis","andromede","artémis fowl","arsene lupin","aladin","atticus finch"],'
content = content.replace(old, new, 1)

old = '    B:["batman","bond","belle","bambi"],'
new = '    B:["batman","bond","belle","bambi","bilbo","buzz lightyear","baby yoda","barbarella"],'
content = content.replace(old, new, 1)

old = '    C:["cendrillon","captain jack","conan","capitaine haddock"],'
new = '    C:["cendrillon","captain jack","conan","capitaine haddock","cunégonde","créonte","cyrano"],'
content = content.replace(old, new, 1)

old = '    D:["darth vader","dumbledore","dory","don quichotte"],'
new = '    D:["darth vader","dumbledore","dory","don quichotte","daenerys","deadpool","dorian gray","d artagnan"],'
content = content.replace(old, new, 1)

old = '    E:["elsa","ethan hunt","emma bovary"],'
new = '    E:["elsa","ethan hunt","emma bovary","edmond dantes","egon","ebeneezer scrooge"],'
content = content.replace(old, new, 1)

old = '    F:["forrest","frodo","frollo"],'
new = '    F:["forrest","frodo","frollo","fantomas","fantine","fox mulder"],'
content = content.replace(old, new, 1)

old = '    G:["gandalf","groot","gollum","gaston"],'
new = '    G:["gandalf","groot","gollum","gaston","geralt","goldfinger","gandalf le blanc","gimli"],'
content = content.replace(old, new, 1)

old = '    H:["harry potter","hermione","hulk","hamlet"],'
new = '    H:["harry potter","hermione","hulk","hamlet","hannibal lecter","hercule poirot","hiccup","howl"],'
content = content.replace(old, new, 1)

old = '    I:["ironman"],'
new = '    I:["ironman","indiana jones","iago","inspector gadget","isabella"],'
content = content.replace(old, new, 1)

old = '    J:["james bond","joker","jean valjean"],'
new = '    J:["james bond","joker","jean valjean","jack sparrow","jay gatsby"],'
content = content.replace(old, new, 1)

old = '    K:["king kong","katniss"],'
new = '    K:["king kong","katniss","kirikou","kaido","kermit","kojak"],'
content = content.replace(old, new, 1)

old = '    L:["leia","luke","legolas","lolita","lecter"],'
new = '    L:["leia","luke","legolas","lolita","lecter","lord voldemort","lisbeth salander","lumiere"],'
content = content.replace(old, new, 1)

old = '    M:["matrice","moana","magneto","merlin"],'
new = '    M:["moana","magneto","merlin","mowgli","mcfly","mulan","malefique","micheal corleone"],'
content = content.replace(old, new, 1)

old = '    N:["nemo","neo"],'
new = '    N:["nemo","neo","naruto","norrington","nosferatu"],'
content = content.replace(old, new, 1)

old = '    P:["potter","padme","pinocchio"],'
new = '    P:["potter","padme","pinocchio","peter pan","picsou","pippi","pocahontas","puss in boots"],'
content = content.replace(old, new, 1)

old = '    R:["rocky","rapunzel","romeo"],'
new = '    R:["rocky","rapunzel","romeo","robin hood","ratatouille","ramsay bolton"],'
content = content.replace(old, new, 1)

old = '    S:["simba","sherlock","scar","scarlett"],'
new = '    S:["simba","sherlock","scar","scarlett","sauron","samwise","spiderman","smeagol"],'
content = content.replace(old, new, 1)

old = '    T:["thanos","thor","terminator"],'
new = '    T:["thanos","thor","terminator","tyrion","tarzan","tintin","toad","tony stark"],'
content = content.replace(old, new, 1)

old = '    V:["vaiana","voldemort"],'
new = '    V:["vaiana","voldemort","vito corleone","venom"],},'
content = content.replace(old, new, 1)

# ─── ENRICHISSEMENTS LANGUES FR ───────────────────────────────────
old = '    V:["vietnamien","valencien"],'
new = '    U:["ukrainien","urdu","ouzbek"],\n    V:["vietnamien","valencien"],\n    W:["wolof","walloon"],\n    X:["xhosa"],\n    Y:["yoruba","yiddish"],\n    Z:["zulu","zaza"],'
content = content.replace(old, new, 1)

# ─── ENRICHISSEMENTS INSTRUMENT FR ───────────────────────────────────
old = '    V:["violon","violoncelle","viole","viol","viola","vihuela","veena","viole de gambe"],'
new = '    V:["violon","violoncelle","viole","viol","viola","vihuela","veena","viole de gambe"],\n    W:["waterphone"],\n    X:["xylophone","xylorimba"],\n    Z:["zarb","zither","zurna"],'
content = content.replace(old, new, 1)

# ─── ENRICHISSEMENTS VETEMENT FR ───────────────────────────────────
old = '    V:["veste","voile","vest","veston"],'
new = '    V:["veste","voile","vest","veston"],\n    W:["windbreaker"],\n    X:["xiphos sash"],\n    Y:["yoga pants"],\n    Z:["zapatillas"],'
content = content.replace(old, new, 1)

# ─── ENRICHISSEMENTS EMOTION FR ───────────────────────────────────
old = '    W:["wonder","wrath"],'
new = '    W:["wonder","wrath"],},'
content = content.replace(old, new, 1)

# Emotion FR - Q manquant, W n'existe pas en FR
old = '    V:["vengeance","vertige","vexation","vanite","vaillance","vergogne","vigueur","vitalite"],'
new = '    V:["vengeance","vertige","vexation","vanite","vaillance","vergogne","vigueur","vitalite"],\n    W:["wonder"],'
content = content.replace(old, new, 1)

# ─── ENRICHISSEMENTS MYTHOLOGIE FR ───────────────────────────────────
old = '    V:["venus","vulcain"],'
new = '    U:["ulysse"],\n    V:["venus","vulcain"],\n    W:["wotan"],\n    Z:["zeus","zephyr"],'
content = content.replace(old, new, 1)

# ─── ENRICHISSEMENTS ESPACE FR ───────────────────────────────────
old = '    V:["venus","voie lactee"],'
new = '    V:["venus","voie lactee","vortex","variable stellaire"],\n    W:["warp drive"],\n    X:["xray"],\n    Y:["yeux de cratere"],\n    Z:["zenith","zero gravite"],'
content = content.replace(old, new, 1)

print("Enrichissements FR appliqués.")

# ─── ENGLISH DICTIONARY ENRICHMENTS ───────────────────────────────────

# EN prenom - missing letters
old = '    O:["olivia","owen"],'
new = '    O:["olivia","owen","oscar","oliver","ophelia","odessa","orion","octavia","oriana","otto","omar","opal","oberon","odette","octave","odessa","odelia","odella","odell","odin","odessa","odie","odilon","odis","odo","odysseus","oella","og","oghenerukewe","ohio","oi","oilly","oily","oj","ojeda","okibi","okon","okpara","okwuchukwu","ola","olaf"],\n    Q:["quincy","quinn","quentin"],'
content = content.replace(old, new, 1)

old = '    W:["william","wyatt"],'
new = '    W:["william","wyatt","wendy","walter","warren","wanda","wayne","winston","whitney","wade","walker","watson","wilfred","willis","wren","wade","warren","wade"],'
content = content.replace(old, new, 1)

# EN pays - missing letters
old = '    Z:["zambia","zimbabwe"]\n  },'
new = '    Z:["zambia","zimbabwe"]\n  },\n'
content = content.replace(old, new, 1)

# EN ville - missing lots of letters
old = '    H:["hamburg","hanoi","harare","havana","helsinki","hong kong","houston","hyderabad","haifa"]\n  },'
new = '    H:["hamburg","hanoi","harare","havana","helsinki","hong kong","houston","hyderabad","haifa"],\n    I:["islamabad","istanbul","incheon","ibadan","izmir"],\n    J:["jakarta","jerusalem","johannesburg","jeddah","jacksonville","jaipur","jinan"],\n    K:["kiev","kabul","karachi","kathmandu","khartoum","kigali","kingston","kinshasa","kuala lumpur","kampala","kumasi","kolkata"],\n    L:["london","lagos","lima","lisbon","los angeles","lahore","libreville","luxembourg","lome","luanda","lusaka","lyon","lodz","leningrad","las vegas","lahsa"],\n    M:["madrid","manila","marseille","medellin","mexico city","milan","minsk","mogadishu","monrovia","montevideo","montreal","moscow","mumbai","munich","muscat"],\n    N:["nairobi","nassau","new york","niamey","nice","nicosia","ndjamena"],\n    O:["oslo","osaka","ottawa","oran","ouagadougou"],\n    P:["paris","prague","pretoria","phnom penh","porto","panama city","palermo","perth"],\n    Q:["quito","quebec","quezon city"],\n    R:["rome","rio de janeiro","riyadh","rotterdam","rabat","reykjavik","riga"],\n    S:["sydney","seoul","san francisco","sao paulo","sarajevo","seattle","shanghai","singapore","sofia","stockholm","suva","santiago","santo domingo"],\n    T:["tokyo","toronto","tehran","taipei","tbilisi","tegucigalpa","thessaloniki","tripoli","tunis"],\n    U:["utrecht","ulaanbaatar"],\n    V:["vienna","vancouver","venice","vilnius","vladivostok"],\n    W:["washington","winnipeg","wuhan","warsaw","wellington","windhoek"],\n    X:["xian","xiamen"],\n    Y:["yaounde","yangon","yokohama"],\n    Z:["zurich","zagreb"]\n  },'
content = content.replace(old, new, 1)

# EN fruit - missing letters
old = '    Z:["zucchini"]\n  },'
new = '    Y:["yam"],\n    Z:["zucchini","zucchini flower"]\n  },'
content = content.replace(old, new, 1)

# EN metier - X, Y, Z missing
old = '    W:["waiter","welder","writer"]\n  },'
new = '    W:["waiter","welder","writer"],\n    X:["xylographer"],\n    Y:["yoga instructor"],\n    Z:["zookeeper","zoologist"]\n  },'
content = content.replace(old, new, 1)

# EN sport - missing letters
old = '    W:["wakeboarding","water polo","weightlifting","wrestling"],'
new = '    W:["wakeboarding","water polo","weightlifting","wrestling"],\n    X:["xc skiing"],\n    Y:["yoga","yachting"],\n    Z:["zumba"],'
content = content.replace(old, new, 1)

# EN objet - X, Y, Z missing
old = '    W:["wallet","watch","wheel"],'
new = '    W:["wallet","watch","wheel"],\n    X:["xylophone"],\n    Y:["yarn"],\n    Z:["zipper"],'
content = content.replace(old, new, 1)

# EN film - X,Y,Z missing
old = '    W:["whiplash"],'
new = '    W:["whiplash"],\n    X:["x men"],\n    Y:["yorkshire"],\n    Z:["zorro","zootopia"],'
content = content.replace(old, new, 1)

# EN marque - X,Y,Z
old = '    Z:["zara"]\n  },'
new = '    X:["xbox"],\n    Y:["yamaha","youtube"],\n    Z:["zara","zimmermann"]\n  },'
content = content.replace(old, new, 1)

# EN musique - missing letters
old = '    W:["weeknd"],'
new = '    W:["weeknd","weezer","wu tang clan"],\n    X:["xxxtentacion"],\n    Y:["yeah yeah yeahs"],\n    Z:["zz top"],'
content = content.replace(old, new, 1)

# EN cuisine - missing letters
old = '    W:["waffle","wrap"],'
new = '    W:["waffle","wrap"],\n    X:["xiaolongbao"],\n    Y:["yakitori","yogurt"],\n    Z:["ziti","zabaglione"],'
content = content.replace(old, new, 1)

# EN vehicule - missing letters
old = '    W:["watercraft"],'
new = '    W:["watercraft"],\n    X:["xpeng"],\n    Y:["yacht"],\n    Z:["zeppelin"],'
content = content.replace(old, new, 1)

# EN capital - missing letters (already has Y)
old = '    Y:["yangon","yaounde","yerevan"],'
new = '    Y:["yangon","yaounde","yerevan"],\n    Z:["zagreb","zambia capital"],'
content = content.replace(old, new, 1)

# EN monument - missing letters
old = '    W:["white house"],'
new = '    W:["white house"],\n    X:["xian terracotta"],\n    Y:["yellowstone"],\n    Z:["zeus olympia"],'
content = content.replace(old, new, 1)

# EN langue - X,Y already exists
old = '    Y:["yoruba"],'
new = '    Y:["yoruba","yiddish"],\n    Z:["zulu","zaza"],'
content = content.replace(old, new, 1)

# EN instrument - X already exists, Y,Z
old = '    Z:["zither"]\n  },'
new = '    Y:["yayli tanbur"],\n    Z:["zither","zurna"]\n  },'
content = content.replace(old, new, 1)

# EN vetement - missing
old = '    W:["waistcoat"],'
new = '    W:["waistcoat"],\n    X:["xiphos"],\n    Y:["yoga pants"],\n    Z:["zip up"],'
content = content.replace(old, new, 1)

# EN emotion - missing
old = '    W:["wonder","wrath"],'
new = '    W:["wonder","wrath"],\n    X:["xenophobia"],\n    Y:["yearning"],\n    Z:["zeal"],'
content = content.replace(old, new, 1)

# EN mythologie - missing
old = '    Z:["zeus"]\n  },'
new = '    Z:["zeus","zephyr"]\n  },'
content = content.replace(old, new, 1)

# EN espace - missing
old = '    W:["wormhole"],'
new = '    W:["wormhole"],\n    X:["x ray"],\n    Y:["year light"],\n    Z:["zenith","zero gravity"],'
content = content.replace(old, new, 1)

# EN oceane - missing
old = '    W:["walrus","whale"],'
new = '    W:["walrus","whale"],\n    X:["xiphias"],\n    Y:["yellow tang"],\n    Z:["zebra fish","zooplankton"],'
content = content.replace(old, new, 1)

# EN medievale - missing
old = '    W:["watchtower","warlord"],'
new = '    W:["watchtower","warlord"],\n    X:["xbow"],\n    Y:["yeoman"],\n    Z:["zealot"],'
content = content.replace(old, new, 1)

# EN technologie - missing
old = '    W:["wifi","web","website"],'
new = '    W:["wifi","web","website"],\n    X:["xml","xpath"],\n    Y:["yaml"],\n    Z:["zero day"],'
content = content.replace(old, new, 1)

# EN danse - missing
old = '    W:["waacking","waltz"],'
new = '    W:["waacking","waltz"],\n    X:["xingfu"],\n    Y:["yoga dance"],\n    Z:["zumba","zeybek"],'
content = content.replace(old, new, 1)

# EN architecture - missing
old = '    W:["window"],'
new = '    W:["window"],\n    X:["xenodochium"],\n    Y:["yard"],\n    Z:["ziggurat"],'
content = content.replace(old, new, 1)

# EN sport_star - missing
old = '    Z:["zidane"]\n  },'
new = '    W:["wade","williams"],\n    Y:["yamal"],\n    Z:["zidane","zverev"]\n  },'
content = content.replace(old, new, 1)

# EN personnage - missing
old = '    W:["wolverine"],'
new = '    W:["wolverine"],\n    X:["xavier"],\n    Y:["yoda"],\n    Z:["zorro","zuko"],'
content = content.replace(old, new, 1)

print("Enrichissements EN appliqués.")

# ─── SPANISH DICTIONARY ENRICHMENTS ───────────────────────────────────

# ES prenom - missing letters
old = '    Z:["zoila","zoe"]\n  },'
new = '    U:["ulises","ursula","ubuntu"],\n    W:["walter","william","wendy"],\n    X:["xavier","ximena","xochitl"],\n    Y:["yaira","yesenia","yolanda","yael","yasmin"],\n    Z:["zoila","zoe","zeus","zara"]\n  },'
content = content.replace(old, new, 1)

# ES pays - Q,U,W,X,Y missing (Z exists)
old = '    Z:["zambia","zimbabue"]\n  },'
new = '    Z:["zambia","zimbabue"]\n  },'
content = content.replace(old, new, 1)

# ES sport - missing letters
old = '    W:["wakeboard","water polo"],'
new = '    W:["wakeboard","water polo"],\n    X:["xcountry"],\n    Y:["yoga","yachting"],\n    Z:["zumba"],'
content = content.replace(old, new, 1)

# ES objet - missing letters
old = '    W:["walkman"],'
new = '    W:["walkman"],\n    X:["xilofono"],\n    Y:["yoyo"],\n    Z:["zapato","zipper"],'
content = content.replace(old, new, 1)

# ES film - missing letters
old = '    V:["vertigo"],'
new = '    V:["vertigo"],\n    W:["whiplash"],\n    X:["x men"],\n    Y:["yarns"],\n    Z:["zorro","zootopia"],'
content = content.replace(old, new, 1)

# ES marque - Z already exists
old = '    Z:["zara"]\n  },'
new = '    W:["wrangler"],\n    X:["xbox"],\n    Y:["yamaha"],\n    Z:["zara","zadig et voltaire"]\n  },'
content = content.replace(old, new, 1)

# ES anatomia - missing
old = '    V:["vejiga","vena","vertebra"],'
new = '    V:["vejiga","vena","vertebra"],\n    W:["watson"],\n    X:["xifoides"],\n    Y:["yeyuno"],\n    Z:["zigoma"],'
content = content.replace(old, new, 1)

# ES musique - missing
old = '    V:["vampire weekend"],'
new = '    V:["vampire weekend"],\n    W:["weeknd"],\n    X:["xxxtentacion"],\n    Y:["yeah yeah yeahs"],\n    Z:["zz top"],'
content = content.replace(old, new, 1)

# ES emotion - missing
old = '    Z:["zozobra"]\n  },'
new = '    Z:["zozobra","zen"]\n  },'
content = content.replace(old, new, 1)

# ES mythologie - missing (Z exists)
old = '    Z:["zeus"]\n  },'
new = '    W:["wotan"],\n    Z:["zeus","zefiro"]\n  },'
content = content.replace(old, new, 1)

# ES espace - missing
old = '    V:["venus"],'
new = '    V:["venus"],\n    W:["warp"],\n    X:["xray"],\n    Y:["yarda luz"],\n    Z:["zenith"],'
content = content.replace(old, new, 1)

# ES oceane - missing
old = '    V:["vibora de mar"],'
new = '    V:["vibora de mar"],\n    W:["walrus"],\n    X:["xiphias"],\n    Y:["yellowtail"],\n    Z:["zooplancton"],'
content = content.replace(old, new, 1)

# ES medievale - missing
old = '    V:["vasallo","vidriera","vizconde"],'
new = '    V:["vasallo","vidriera","vizconde"],\n    W:["warlord"],\n    X:["xilografia"],\n    Y:["yeoman"],\n    Z:["zelote"],'
content = content.replace(old, new, 1)

# ES technologie - missing
old = '    W:["wifi","web"],'
new = '    W:["wifi","web"],\n    X:["xml","xpath"],\n    Y:["yaml"],\n    Z:["zero day"],'
content = content.replace(old, new, 1)

# ES danse - missing
old = '    V:["vals","voguing"],'
new = '    V:["vals","voguing"],\n    W:["waacking"],\n    X:["xingfu"],\n    Y:["yoga dance"],\n    Z:["zumba","zeybek"],'
content = content.replace(old, new, 1)

# ES architecture - missing
old = '    V:["boveda","vestibulo","viaducto"],'
new = '    V:["boveda","vestibulo","viaducto"],\n    W:["watchtower"],\n    X:["xenodoquio"],\n    Y:["yurta"],\n    Z:["zigurat"],'
content = content.replace(old, new, 1)

# ES sport_star - missing
old = '    Z:["zidane"]\n  },'
new = '    W:["wade"],\n    Y:["yamal"],\n    Z:["zidane","zverev"]\n  },'
content = content.replace(old, new, 1)

# ES personnage - missing
old = '    W:["wolverine"],'
new = '    W:["wolverine"],\n    X:["xavier"],\n    Y:["yoda"],\n    Z:["zorro","zuko"],'
content = content.replace(old, new, 1)

print("Enrichissements ES appliqués.")

with open('/Users/bgr/petit-bac/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fichier sauvegardé.")
