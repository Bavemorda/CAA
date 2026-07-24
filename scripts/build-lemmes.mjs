// Construit /data/fr-lemmes.json : table "forme fléchie -> lemme" (forme de base).
// Approche v1, assumée et documentée dans CLAUDE.md :
//  - verbes réguliers (-er, -ir du 2e groupe) : formes générées par des règles
//    de conjugaison appliquées à une liste de verbes courants ci-dessous.
//  - verbes irréguliers très fréquents : table écrite à la main.
//  - pluriels et féminins irréguliers : table écrite à la main.
//    (Les pluriels/féminins réguliers -s/-e sont gérés par une règle de repli
//    dans src/lemmatizer.js, pas besoin de les lister ici.)
// Remplacer ce fichier par un export d'un lexique complet (type Lexique/Lefff)
// est possible plus tard sans changer le format ni le reste du pipeline.
// Usage : node scripts/build-lemmes.mjs

import { writeFile } from "node:fs/promises";

const OUT_FILE = new URL("../data/fr-lemmes.json", import.meta.url);

const table = {};
function ajouter(forme, lemme) {
  const f = forme.toLowerCase().trim();
  if (!f || f === lemme) return;
  table[f] = lemme;
}

// ---------------------------------------------------------------------------
// 1. Verbes réguliers du 1er groupe (-er), ex. "parler"
// ---------------------------------------------------------------------------
// Verbes réguliers "simples" : la règle de conjugaison ci-dessous s'applique
// sans changement orthographique. Les verbes en -cer/-ger/-yer/-e.er/-é.er
// (manger, commencer, payer, lever, espérer...) ont des particularités
// d'orthographe et sont traités à part, dans IRREGULIERS_ORTHOGRAPHE plus bas.
const VERBES_ER = [
  "parler","aimer","donner","jouer","regarder","écouter","chercher",
  "trouver","penser","demander","montrer","aider","porter","rester","arriver",
  "entrer","tomber","passer","dessiner","chanter","danser","marcher","travailler",
  "apporter","fermer","laver","habiller","préparer","couper",
  "tourner","garder","laisser","continuer","utiliser",
  "expliquer","raconter","compter","gagner","casser","tirer","pousser",
  "poser","toucher","frapper","embrasser","pleurer","crier","signaler","noter",
  "colorier","coller","découper","balayer","cuisiner",
  "goûter","souhaiter","rêver","oublier",
  "téléphoner","inviter","visiter","habiter","décorer",
  "fêter","célébrer",
];

function conjuguerER(inf) {
  const stem = inf.slice(0, -2); // enlève "er"
  const formes = [
    stem + "e", stem + "es", stem + "e", stem + "ons", stem + "ez", stem + "ent", // présent
    stem + "ais", stem + "ais", stem + "ait", stem + "ions", stem + "iez", stem + "aient", // imparfait
    inf + "ai", inf + "as", inf + "a", inf + "ons", inf + "ez", inf + "ont", // futur (mangerai...)
    stem + "é", stem + "ée", stem + "és", stem + "ées", // participe passé + accords
    stem + "ant", // participe présent / gérondif
  ];
  for (const f of formes) ajouter(f, inf);
}
for (const v of VERBES_ER) conjuguerER(v);

// ---------------------------------------------------------------------------
// 2. Verbes réguliers du 2e groupe (-ir type "finir")
// ---------------------------------------------------------------------------
const VERBES_IR = [
  "finir","choisir","remplir","réussir","grandir","grossir","maigrir","rougir",
  "réfléchir","obéir","punir","guérir","vieillir","noircir","blanchir","atterrir",
  "avertir","bâtir","établir","fournir","nourrir","saisir","salir","unir",
];
function conjuguerIR(inf) {
  const stem = inf.slice(0, -2); // enlève "ir"
  const formes = [
    stem + "is", stem + "is", stem + "it", stem + "issons", stem + "issez", stem + "issent",
    stem + "issais", stem + "issais", stem + "issait", stem + "issions", stem + "issiez", stem + "issaient",
    inf + "ai", inf + "as", inf + "a", inf + "ons", inf + "ez", inf + "ont",
    stem + "i", stem + "ie", stem + "is", stem + "ies",
    stem + "issant",
  ];
  for (const f of formes) ajouter(f, inf);
}
for (const v of VERBES_IR) conjuguerIR(v);

// ---------------------------------------------------------------------------
// 2 bis. Verbes en -er à particularité orthographique (formes écrites à la
// main : -cer, -ger, -yer, -eler/-eter, e/é + consonne + er)
// ---------------------------------------------------------------------------
const VERBES_ER_ORTHOGRAPHE = {
  manger: ["mange","manges","mangeons","mangez","mangent","mangeais","mangeait","mangions","mangiez","mangeaient","mangerai","mangeras","mangera","mangerons","mangerez","mangeront","mangé","mangée","mangeant"],
  voyager: ["voyage","voyages","voyageons","voyagez","voyagent","voyageais","voyageait","voyagions","voyagiez","voyageaient","voyagerai","voyageras","voyagera","voyagé","voyageant"],
  déménager: ["déménage","déménages","déménageons","déménagez","déménagent","déménageais","déménageait","déménagions","déménagiez","déménageaient","déménagerai","déménagé","déménageant"],
  ranger: ["range","ranges","rangeons","rangez","rangent","rangeais","rangeait","rangions","rangiez","rangeaient","rangerai","rangé","rangeant"],
  changer: ["change","changes","changeons","changez","changent","changeais","changeait","changions","changiez","changeaient","changerai","changé","changeant"],
  commencer: ["commence","commences","commençons","commencez","commencent","commençais","commençait","commencions","commenciez","commençaient","commencerai","commencé","commençant"],
  avancer: ["avance","avances","avançons","avancez","avancent","avançais","avançait","avancions","avanciez","avançaient","avancerai","avancé","avançant"],
  nettoyer: ["nettoie","nettoies","nettoyons","nettoyez","nettoient","nettoyais","nettoyait","nettoyions","nettoyiez","nettoyaient","nettoierai","nettoyé","nettoyant"],
  payer: ["paie","paies","paye","payes","payons","payez","paient","payent","payais","payait","payions","payiez","payaient","paierai","payerai","payé","payant"],
  essayer: ["essaie","essaies","essaye","essayes","essayons","essayez","essaient","essayent","essayais","essayait","essayions","essayiez","essayaient","essaierai","essayerai","essayé","essayant"],
  envoyer: ["envoie","envoies","envoyons","envoyez","envoient","envoyais","envoyait","envoyions","envoyiez","envoyaient","enverrai","enverras","enverra","envoyé","envoyant"],
  lever: ["lève","lèves","levons","levez","lèvent","levais","levait","levions","leviez","levaient","lèverai","levé","levant"],
  acheter: ["achète","achètes","achetons","achetez","achètent","achetais","achetait","achetions","achetiez","achetaient","achèterai","acheté","achetant"],
  appeler: ["appelle","appelles","appelons","appelez","appellent","appelais","appelait","appelions","appeliez","appelaient","appellerai","appelé","appelant"],
  rappeler: ["rappelle","rappelles","rappelons","rappelez","rappellent","rappelais","rappelait","rappelions","rappeliez","rappelaient","rappellerai","rappelé","rappelant"],
  jeter: ["jette","jettes","jetons","jetez","jettent","jetais","jetait","jetions","jetiez","jetaient","jetterai","jeté","jetant"],
  espérer: ["espère","espères","espérons","espérez","espèrent","espérais","espérait","espérions","espériez","espéraient","espérerai","espéré","espérant"],
  préférer: ["préfère","préfères","préférons","préférez","préfèrent","préférais","préférait","préférions","préfériez","préféraient","préférerai","préféré","préférant"],
  répéter: ["répète","répètes","répétons","répétez","répètent","répétais","répétait","répétions","répétiez","répétaient","répéterai","répété","répétant"],
};
for (const [lemme, formes] of Object.entries(VERBES_ER_ORTHOGRAPHE)) {
  for (const f of formes) ajouter(f, lemme);
}

// ---------------------------------------------------------------------------
// 3. Verbes irréguliers fréquents (formes écrites à la main)
// ---------------------------------------------------------------------------
const IRREGULIERS = {
  être: ["suis","es","est","sommes","êtes","sont","étais","était","étions","étiez","étaient","serai","seras","sera","serons","serez","seront","été","fus","fut","fûmes","fûtes","furent"],
  avoir: ["ai","as","a","avons","avez","ont","avais","avait","avions","aviez","avaient","aurai","auras","aura","aurons","aurez","auront","eu","eue","eus","eut","eûmes","eûtes","eurent"],
  aller: ["vais","vas","va","allons","allez","vont","allais","allait","allions","alliez","allaient","irai","iras","ira","irons","irez","iront","allé","allée","allés","allées"],
  faire: ["fais","fait","faisons","faites","font","faisais","faisait","faisions","faisiez","faisaient","ferai","feras","fera","ferons","ferez","feront","faisant"],
  dire: ["dis","dit","disons","dites","disent","disais","disait","disions","disiez","disaient","dirai","diras","dira","dirons","direz","diront","disant"],
  pouvoir: ["peux","peut","pouvons","pouvez","peuvent","pouvais","pouvait","pouvions","pouviez","pouvaient","pourrai","pourras","pourra","pourrons","pourrez","pourront","pu"],
  vouloir: ["veux","veut","voulons","voulez","veulent","voulais","voulait","voulions","vouliez","voulaient","voudrai","voudras","voudra","voudrons","voudrez","voudront","voulu"],
  devoir: ["dois","doit","devons","devez","doivent","devais","devait","devions","deviez","devaient","devrai","devras","devra","devrons","devrez","devront","dû","due"],
  savoir: ["sais","sait","savons","savez","savent","savais","savait","savions","saviez","savaient","saurai","sauras","saura","saurons","saurez","sauront","su"],
  voir: ["vois","voit","voyons","voyez","voient","voyais","voyait","voyions","voyiez","voyaient","verrai","verras","verra","verrons","verrez","verront","vu","vue"],
  venir: ["viens","vient","venons","venez","viennent","venais","venait","venions","veniez","venaient","viendrai","viendras","viendra","viendrons","viendrez","viendront","venu","venue"],
  tenir: ["tiens","tient","tenons","tenez","tiennent","tenais","tenait","tenions","teniez","tenaient","tiendrai","tiendras","tiendra","tenu","tenue"],
  prendre: ["prends","prend","prenons","prenez","prennent","prenais","prenait","prenions","preniez","prenaient","prendrai","prendras","prendra","pris","prise"],
  mettre: ["mets","met","mettons","mettez","mettent","mettais","mettait","mettions","mettiez","mettaient","mettrai","mettras","mettra","mis","mise"],
  boire: ["bois","boit","buvons","buvez","boivent","buvais","buvait","buvions","buviez","buvaient","boirai","boiras","boira","bu","bue"],
  croire: ["crois","croit","croyons","croyez","croient","croyais","croyait","croyions","croyiez","croyaient","croirai","croiras","croira","cru","crue"],
  connaître: ["connais","connaît","connaissons","connaissez","connaissent","connaissais","connaissait","connaissions","connaissiez","connaissaient","connaîtrai","connaîtras","connaîtra","connu","connue"],
  écrire: ["écris","écrit","écrivons","écrivez","écrivent","écrivais","écrivait","écrivions","écriviez","écrivaient","écrirai","écriras","écrira","écrite"],
  lire: ["lis","lit","lisons","lisez","lisent","lisais","lisait","lisions","lisiez","lisaient","lirai","liras","lira","lu","lue"],
  vivre: ["vis","vit","vivons","vivez","vivent","vivais","vivait","vivions","viviez","vivaient","vivrai","vivras","vivra","vécu","vécue"],
  suivre: ["suit","suivons","suivez","suivent","suivais","suivait","suivions","suiviez","suivaient","suivrai","suivras","suivra","suivi","suivie"],
  courir: ["cours","court","courons","courez","courent","courais","courait","courions","couriez","couraient","courrai","courras","courra","couru","courue"],
  mourir: ["meurs","meurt","mourons","mourez","meurent","mourais","mourait","mourions","mouriez","mouraient","mourrai","mourras","mourra","mort","morte"],
  naître: ["nais","naît","naissons","naissez","naissent","naissais","naissait","naissions","naissiez","naissaient","naîtrai","naîtras","naîtra","né","née"],
  sortir: ["sors","sort","sortons","sortez","sortent","sortais","sortait","sortions","sortiez","sortaient","sortirai","sortiras","sortira","sorti","sortie"],
  partir: ["pars","part","partons","partez","partent","partais","partait","partions","partiez","partaient","partirai","partiras","partira","parti","partie"],
  dormir: ["dors","dort","dormons","dormez","dorment","dormais","dormait","dormions","dormiez","dormaient","dormirai","dormiras","dormira","dormi"],
  sentir: ["sens","sent","sentons","sentez","sentent","sentais","sentait","sentions","sentiez","sentaient","sentirai","sentiras","sentira","senti","sentie"],
  servir: ["sers","sert","servons","servez","servent","servais","servait","servions","serviez","servaient","servirai","serviras","servira","servi","servie"],
  ouvrir: ["ouvre","ouvres","ouvrons","ouvrez","ouvrent","ouvrais","ouvrait","ouvrions","ouvriez","ouvraient","ouvrirai","ouvriras","ouvrira","ouvert","ouverte"],
  offrir: ["offre","offres","offrons","offrez","offrent","offrais","offrait","offrions","offriez","offraient","offrirai","offriras","offrira","offert","offerte"],
  rire: ["ris","rit","rions","riez","rient","riais","riait","riions","riiez","riaient","rirai","riras","rira","ri"],
  attendre: ["attends","attend","attendons","attendez","attendent","attendais","attendait","attendions","attendiez","attendaient","attendrai","attendras","attendra","attendu","attendue"],
  entendre: ["entends","entend","entendons","entendez","entendent","entendais","entendait","entendions","entendiez","entendaient","entendrai","entendras","entendra","entendu","entendue"],
  vendre: ["vends","vend","vendons","vendez","vendent","vendais","vendait","vendions","vendiez","vendaient","vendrai","vendras","vendra","vendu","vendue"],
  perdre: ["perds","perd","perdons","perdez","perdent","perdais","perdait","perdions","perdiez","perdaient","perdrai","perdras","perdra","perdu","perdue"],
  répondre: ["réponds","répond","répondons","répondez","répondent","répondais","répondait","répondions","répondiez","répondaient","répondrai","répondras","répondra","répondu","répondue"],
  descendre: ["descends","descend","descendons","descendez","descendent","descendais","descendait","descendions","descendiez","descendaient","descendrai","descendras","descendra","descendu","descendue"],
  falloir: ["faut","fallait","faudra","fallu"],
  pleuvoir: ["pleut","pleuvait","pleuvra","plu"],
};
for (const [lemme, formes] of Object.entries(IRREGULIERS)) {
  for (const f of formes) ajouter(f, lemme);
}

// ---------------------------------------------------------------------------
// 4. Pluriels et féminins irréguliers (noms / adjectifs courants)
//    (les pluriels réguliers en -s et féminins réguliers en -e sont gérés par
//    une règle de repli dans src/lemmatizer.js)
// ---------------------------------------------------------------------------
const IRREGULIERS_NOM_ADJ = {
  cheval: ["chevaux"],
  animal: ["animaux"],
  journal: ["journaux"],
  hôpital: ["hôpitaux"],
  travail: ["travaux"],
  œil: ["yeux"],
  ciel: ["cieux"],
  bijou: ["bijoux"],
  chou: ["choux"],
  genou: ["genoux"],
  neveu: ["neveux"],
  jeu: ["jeux"],
  feu: ["feux"],
  lieu: ["lieux"],
  chapeau: ["chapeaux"],
  bateau: ["bateaux"],
  gâteau: ["gâteaux"],
  couteau: ["couteaux"],
  oiseau: ["oiseaux"],
  bureau: ["bureaux"],
  cadeau: ["cadeaux"],
  beau: ["belle","beaux","belles","bel"],
  nouveau: ["nouvelle","nouveaux","nouvelles","nouvel"],
  vieux: ["vieille","vieilles","vieil"],
  blanc: ["blanche","blancs","blanches"],
  long: ["longue","longs","longues"],
  doux: ["douce","douces"],
  faux: ["fausse","fausses"],
  roux: ["rousse","rousses"],
  gros: ["grosse","grosses"],
  bon: ["bonne","bons","bonnes"],
  gentil: ["gentille","gentils","gentilles"],
  frais: ["fraîche","fraîches"],
  sec: ["sèche","secs","sèches"],
  premier: ["première","premiers","premières"],
  dernier: ["dernière","derniers","dernières"],
  entier: ["entière","entiers","entières"],
  fou: ["folle","fous","folles","fol"],
  mou: ["molle","mous","molles","mol"],
  sportif: ["sportive","sportifs","sportives"],
  actif: ["active","actifs","actives"],
  neuf: ["neuve","neuves"],
};
for (const [lemme, formes] of Object.entries(IRREGULIERS_NOM_ADJ)) {
  for (const f of formes) ajouter(f, lemme);
}

// ---------------------------------------------------------------------------
await writeFile(OUT_FILE, JSON.stringify(table), "utf-8");
console.log(`Table de lemmatisation écrite : ${Object.keys(table).length} formes -> lemme.`);
