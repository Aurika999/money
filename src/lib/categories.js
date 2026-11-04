// Categorii, culori și cuvintele-cheie folosite la încadrarea automată.

export const CATS = [
  {id:"mancare",   name:"Mâncare (supermarket)", color:"#D9822B"},
  {id:"restaurant",name:"Restaurante & livrări", color:"#C2524A"},
  {id:"utilitati", name:"Utilități", color:"#3B7DD8"},
  {id:"transport", name:"Transport & combustibil", color:"#7A5BC7"},
  {id:"distractie",name:"Distracție & vacanțe", color:"#D4499A"},
  {id:"abonamente",name:"Abonamente online", color:"#B061D6"},
  {id:"cumparaturi",name:"Cumpărături", color:"#2E9E8F"},
  {id:"sanatate",  name:"Sănătate", color:"#4CA65A"},
  {id:"locuinta",  name:"Locuință & rate", color:"#8C6D46"},
  {id:"numerar",   name:"Retrageri numerar", color:"#6B7A8F"},
  {id:"comisioane",name:"Comisioane bancare", color:"#A08A2E"},
  {id:"transfer",  name:"Transferuri", color:"#5C8FA8"},
  {id:"altele",    name:"Altele", color:"#9AA0A6"},
  {id:"venituri",  name:"Venituri", color:"#1F8A5B"},
];

export const CAT = Object.fromEntries(CATS.map((c) => [c.id, c]));

// Ordinea contează: prima potrivire câștigă (ex. „bolt food” înaintea lui „bolt”).
export const BUILTIN = [
  ["restaurant",["bolt food","glovo","tazz","foodpanda","wolt","mcdonald","mcdonalds","kfc","burger king","starbucks","5 to go","teds coffee","ted's coffee","restaurant","restaurantul","pizza","pizzeria","bistro","cafenea","coffee","salad box","subway","spartan","trattoria","shaorma","fast food"]],
  ["mancare",["kaufland","lidl","mega image","carrefour","profi","auchan","penny","cora","selgros","metro cash","la doi pasi","annabella","supeco","freshful","sezamo","supermarket","hypermarket","market","alimentara","alimentar","brutarie","macelarie","piata","paine"]],
  ["utilitati",["enel","e.on","eon energie","engie","electrica","hidroelectrica","ppc","premier energy","digi","rcs","rds","orange","vodafone","telekom","upc","apa nova","aquatim","apavital","compania de apa","veolia","intretinere","asociatia de proprietari","termoenergetica","salubris","factura","energie","gaze"]],
  ["transport",["uber","bolt","free now","freenow","blackcab","omv","petrom","mol","rompetrol","lukoil","socar","gazprom","stb","metrorex","ratb","ctp","cfr","tarom","wizz","wizzair","ryanair","hisky","parcare","parking","rovinieta","taxi","flixbus","benzinarie","carburant","itp","service auto","vulcanizare"]],
  ["abonamente",["netflix","spotify","hbo","hbo max","disney","youtube","apple.com","itunes","google play","icloud","chatgpt","openai","prime video","voyo","antena play","skyshowtime"]],
  ["distractie",["cinema city","happy cinema","cineplexx","cinema","steam","playstation","xbox","nintendo","iabilet","eventim","entertix","bilete","teatru","concert","club","bowling","escape","booking.com","booking","airbnb","hotel","pensiune","travel","agentie de turism"]],
  ["cumparaturi",["emag","altex","flanco","media galaxy","zara","h&m","hm","reserved","decathlon","dedeman","ikea","jysk","leroy merlin","hornbach","brico","amazon","temu","shein","aliexpress","answear","fashion days","notino","douglas","sephora","dm drogerie","pepco","action","libris","carturesti","elefant","sinsay","lc waikiki","about you"]],
  ["sanatate",["farmacia","farmacie","catena","dr. max","dr max","help net","sensiblu","belladonna","farmacia tei","regina maria","medlife","sanador","synevo","bioclinica","medicover","stomatolog","dentist","clinica","spital","optica"]],
  ["locuinta",["chirie","rent","ipotecar","rata credit","rata","asigurare","imobiliare","administrare imobil"]],
  ["numerar",["atm","retragere numerar","retragere","cash withdrawal","numerar"]],
  ["comisioane",["comision","comisioane","taxa administrare","taxa lunara","dobanda debitoare","fee","abonament cont"]],
  ["transfer",["transfer","revolut","top-up","topup","alimentare cont","schimb valutar","exchange","p2p","instant payment","plata catre"]],
];

// Cuvinte din capul de tabel după care recunoaștem coloanele.
export const KEYS = {
  date:["data tranzactiei","data tranzactie","data inregistrare","data inregistrarii","data operatiunii","data","date","started date","completed date","booking date","transaction date","data contabila"],
  desc:["descriere","detalii tranzactie","detalii","description","explicatii","explicatie","beneficiar","merchant","payee","denumire","informatii","tranzactie","details","narrative"],
  debit:["debit","suma debit","debit amount","plati","iesiri","retrageri","money out","paid out"],
  credit:["credit","suma credit","credit amount","incasari","intrari","depuneri","money in","paid in"],
  amount:["suma","amount","valoare","suma tranzactie","total","suma (ron)","suma ron"],
  skip:["sold","balance","sold final","sold initial","balanta"]
};
