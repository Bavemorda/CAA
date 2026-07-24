// Vocabulaire français de base pour la banque Mulberry (v1).
// Chaque entrée : mot-clé français -> un ou plusieurs noms de fichiers anglais
// candidats dans le dépôt officiel mulberrysymbols/mulberry-symbols (dossier /EN).
// build-index-mulberry.mjs vérifie chaque fichier (HEAD sur le CDN) et ne garde
// que ceux qui existent réellement ; les candidats en trop sont simplement ignorés.
//
// Mulberry n'a pas de traduction française officielle et son vocabulaire est
// plus orienté "objets concrets" que "mots-outils sociaux" (pas de symbole dédié
// pour bonjour/merci/oui/non dans ce jeu) : la couverture v1 est donc plus
// réduite qu'ARASAAC. Étendre ce fichier et relancer le script pour l'enrichir.

export const MULBERRY_VOCAB = [
  ["bonjour", ["hello.svg"]],
  ["aider", ["help_,_to.svg", "help_1_,_to.svg"]],

  ["maman", ["mum_parent.svg"]],
  ["papa", ["dad_parent.svg"]],
  ["frère", ["brother.svg"]],
  ["sœur", ["sister.svg"]],
  ["bébé", ["baby.svg"]],
  ["famille", ["family.svg"]],
  ["grand-mère", ["grandmother.svg"]],
  ["grand-père", ["grandfather.svg"]],

  ["manger", ["eat_,_to.svg"]],
  ["boire", ["drink_,_to.svg"]],
  ["eau", ["water.svg"]],
  ["lait", ["milk.svg"]],
  ["pain", ["bread.svg"]],
  ["pomme", ["apple.svg"]],
  ["banane", ["banana.svg"]],
  ["fromage", ["cheese.svg"]],
  ["gâteau", ["cake.svg"]],
  ["biscuit", ["biscuits.svg", "biscuit_chocolate_chip.svg"]],
  ["soupe", ["soup.svg"]],
  ["café", ["coffee.svg"]],
  ["thé", ["tea.svg"]],
  ["petit-déjeuner", ["breakfast_1.svg", "breakfast_2.svg"]],
  ["déjeuner", ["lunch_1.svg", "lunch_2.svg"]],
  ["dîner", ["dinner.svg", "dinner_1.svg"]],

  ["tête", ["head.svg"]],
  ["pied", ["foot.svg"]],
  ["bouche", ["mouth.svg"]],
  ["oreille", ["ear.svg"]],
  ["ventre", ["stomach.svg"]],
  ["médecin", ["doctor_1a.svg", "doctor_1b.svg"]],
  ["dormir", ["sleep_female_,_to.svg", "sleep_male_,_to.svg"]],

  ["content", ["happy_lady.svg", "happy_man.svg"]],
  ["triste", ["sad_lady.svg", "sad_man.svg"]],
  ["en colère", ["angry_lady.svg", "angry_man.svg"]],
  ["peur", ["afraid_lady.svg", "afraid_man.svg"]],

  ["aller", ["go_,_to.svg"]],
  ["venir", ["come_,_to.svg"]],
  ["jouer", ["play_,_to.svg"]],
  ["regarder", ["look_,_to.svg"]],
  ["parler", ["talk_1_,_to.svg"]],
  ["lire", ["read_,_to.svg"]],
  ["écrire", ["write_,_to.svg"]],
  ["marcher", ["walk_,_to.svg"]],
  ["courir", ["run_,_to.svg"]],
  ["sauter", ["jump_,_to.svg"]],
  ["tomber", ["fall_over_,_to.svg", "fall_off_,_to.svg"]],
  ["ouvrir", ["open_,_to.svg"]],
  ["fermer", ["close_,_to.svg"]],
  ["donner", ["give_,_to.svg"]],
  ["prendre", ["take_,_to.svg"]],
  ["laver", ["wash_up_,_to.svg"]],
  ["travailler", ["work_,_to.svg"]],
  ["attendre", ["wait_,_to.svg"]],

  ["maison", ["house.svg"]],
  ["école", ["school.svg"]],
  ["voiture", ["car.svg"]],
  ["jardin", ["back_garden.svg"]],
  ["toilettes", ["toilet.svg"]],
  ["magasin", ["shop.svg"]],

  ["chat", ["cat.svg"]],
  ["chien", ["dog.svg"]],
  ["oiseau", ["bird.svg"]],
  ["cheval", ["horse.svg"]],
  ["poisson", ["fish.svg"]],
  ["lapin", ["rabbit.svg"]],

  ["ballon", ["ball.svg"]],
  ["téléphone", ["mobile_phone.svg"]],
  ["ordinateur", ["computer_1.svg", "computer_2.svg"]],
  ["chaise", ["chair.svg"]],
  ["table", ["table.svg"]],
  ["lit", ["single_bed.svg", "double_bed.svg"]],
  ["porte", ["door.svg"]],
  ["jouet", ["toys.svg", "toy_box.svg"]],

  ["professeur", ["teacher_1a.svg", "teacher_1b.svg"]],

  ["aujourd'hui", ["today.svg"]],
  ["demain", ["tomorrow.svg"]],
  ["hier", ["yesterday.svg"]],
  ["matin", ["morning.svg"]],
  ["nuit", ["night.svg"]],

  ["rouge", ["red.svg"]],
  ["bleu", ["blue.svg"]],
  ["vert", ["green.svg"]],
  ["jaune", ["yellow.svg"]],
  ["noir", ["black.svg"]],
  ["blanc", ["white.svg"]],

  ["un", ["one.svg"]],
  ["deux", ["two.svg"]],
  ["trois", ["three.svg"]],
  ["quatre", ["four.svg"]],
  ["cinq", ["five.svg"]],

  ["soleil", ["sun.svg"]],
  ["pluie", ["rain.svg"]],
  ["neige", ["snow.svg"]],
  ["chaud", ["hot.svg"]],
];
