# Jobify
![workers](https://user-images.githubusercontent.com/105429984/178597381-2b2685d9-7508-4036-badc-dfe03bf06b27.png)

Jobify è una Web Application progettata da:

- Matteo Papa: 1896945;
- Matteo Cutroni: 1918336;
 
per il corso di Reti di Calcolatori 2021/2022;

L'applicazione offre alcuni servizi agli utenti, distinguendo questi ultimi in:
  
- Datori di Lavoro, i quali possono pubblicare offerte lavorative;
- Lavoratori, i quali possono contattare i datori e proporsi per un colloquio;
  
# Prerequisiti

    docker
    node.js
    npm

# Step per l'installazione:

1) Accedere al [Google Cloud Console](https://console.cloud.google.com) -> "Api e Servizi" -> "Credenziali" -> "+ Crea Credenziali" -> "ID client OAuth"
Inserire come tipo di applicazione Web Application e aggiungere nei Redirect URI:
  
		http://localhost:8080/google/callback
		https://developers.google.com/oauthplayground
		
Appuntarsi il CLIENT_ID e il CLIENT_SECRET.

2)  Accedere all'[OAuth Playground](https://developers.google.com/oauthplayground/).
Selezione la Drive API v3 e la Google Calendar API v3 dal menu a sinistra, e cliccando sull'icona delle impostazioni spuntare "Use your own OAuth credentials".
Inserire successivamente il CLIENT_ID e il CLIENT_SECRET ottenuti nel passaggio 1 negli appositi riquadri.
Autorizzare le API e appuntarsi il REFRESH TOKEN.


3) Aggiungere nella cartella server un file .env con i seguenti campi:

		GOOGLE_CLIENT_ID= Il CLIENT_ID appuntato prima
		GOOGLE_CLIENT_SECRET= Il CLIENT_SECRET appuntato prima
		REFRESH_TOKEN= Il REFRESH_TOKEN appuntato prima

# Avvio 

Eseguire il seguente comando per clonare la repository:

	git clone https://github.com/matteo-cutroni/progettordc.git;

Nella directory "server" eseguire il comando:

	npm install

Eseguire il build delle immagini e avviare il compose:

	docker compose up --build

Tramite qualsiasi Web Browser visitare http://localhost:8080/ oppure https://localhost:8083/

# Test 

I test sono stati creati utilizzando il modulo Mocha.

Testare le API del sito web accedendo alla cartella "server" ed eseguendo:

	npm test	


# Soddisfacimento dei Requisiti

- Il servizio offre delle API documentate con APIDOC. La documentazione è accessibile da "http://localhost:8080/apidoc";
- Utilizza la Drive API v3 per salvare il curriculum degli utenti sul loro drive personale, e la Google Calendar API v3 per salvare le date dei colloqui confermati;
- Il servizio di registrazione e di login è interamente basato su Google OAuth (mediante Passport.js). Inoltre sia Drive che Calendar richiedono l'utilizzo di Google OAuth;
- Il sistema di messagistica (chat) tra datore e lavoratore è interamente basato sul protocollo AMQP (tramite RabbitMQ);
- L'applicazione fa uso di Docker per la containerizzazione delle varie parti della Web App e Docker Compose per orchestrarle;
- Le Github Actions forniscono una procedura CI/CD;
- Il sito è protetto tramite il protocollo HTTPS (il certificato è self-signed);
