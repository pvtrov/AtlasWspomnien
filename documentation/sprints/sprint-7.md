# Sprint 7

## Sprint Goal

Dopracować publiczną warstwę archiwum tak, aby produkt był bardziej spójny, czytelny i wyrazisty dla użytkownika końcowego, a jednocześnie przygotować go pod nową nazwę i polskojęzyczny interfejs.

Sprint 7 skupia się na jakości doświadczenia użytkownika, lekkim odświeżeniu wizualnym oraz dopracowaniu warstwy publicznej, a nie na dużej nowej logice domenowej.

## In Scope

Sprint 7 obejmuje:

- dopracowanie publicznej warstwy przeglądania archiwum,
- poprawę czytelności listy zdjęć i widoków szczegółów,
- poprawę podstawowych stanów pustych, ładowania i komunikatów,
- wprowadzenie nazwy produktu `Atlas Wspomnień`,
- lekki refresh identyfikacji wizualnej w kierunku `Rose Dust`,
- zmianę podstawowego języka interfejsu aplikacji na polski,
- uporządkowanie podstawowych tekstów i brandingowych elementów interfejsu,
- aktualizację dokumentacji związaną z brandingiem i refinmentem publicznego archiwum.

## Out of Scope

Sprint 7 nie obejmuje:

- pełnego redesignu całej aplikacji,
- nowego systemu nawigacji od zera,
- zaawansowanych animacji i rozbudowanego motion designu,
- pełnego systemu i18n z wieloma językami,
- rozbudowy logiki wyszukiwania lub mapy poza drobnymi korektami UX,
- dużych zmian architektonicznych w backendzie.

## Expected Outcome

Po zakończeniu Sprintu 7 projekt powinien zapewniać:

- bardziej spójną publiczną warstwę archiwum,
- widoczny i konsekwentny branding `Atlas Wspomnień`,
- podstawowy interfejs użytkownika w języku polskim,
- subtelnie odświeżoną kolorystykę opartą o beż, przygaszony róż i śliwkowy fiolet,
- dokumentację zgodną z nowym kierunkiem produktu.

## Sprint 7 Task Breakdown

### 1. Public Archive Refinement

#### Goal

Dopracować publiczne doświadczenie archiwum bez zmiany jego podstawowej logiki.

#### Tasks

- Uporządkować najważniejsze widoki publiczne związane z listą zdjęć, mapą i szczegółem.
- Poprawić podstawowe komunikaty, stany puste i ton tekstów.
- Zachować wspólną warstwę przeglądania dla użytkowników anonimowych i zalogowanych.
- W razie potrzeby lekko uprościć lub dopracować istniejące teksty i sekcje widoczne w publicznej części aplikacji.

#### Recommended Layout Refinement Focus

Przy dopracowaniu publicznej warstwy archiwum warto w pierwszej kolejności skupić się na następujących obszarach:

- wzmocnienie headera i brandingu tak, aby `Atlas Wspomnień` był bardziej wyczuwalny jako produkt publiczny, a mniej jak roboczy shell aplikacji,
- uproszczenie strony głównej archiwum tak, aby była odbierana jako jedna spójna kompozycja, a nie zbiór ciężkich paneli,
- wyraźniejsze uporządkowanie relacji między listą zdjęć, mapą i szczegółem wybranego zdjęcia,
- odchudzenie wizualne sekcji filtrów i lepsze prowadzenie wzroku użytkownika przez pola i aktywne filtry,
- mocniejsze rozróżnienie dużych paneli strony, kart zdjęć i paneli szczegółów,
- dopracowanie mapy jako elementu odkrywania archiwum, a nie wyłącznie komponentu technicznego,
- poprawa rytmu pionowego, oddechu i hierarchii typografii w publicznej warstwie archiwum.

#### Suggested First Implementation Slice

Jako pierwszy większy ticket refinmentowy rekomendowany jest zakres:

- header i branding,
- strona główna archiwum,
- shell filtrów,
- relacja lista / mapa / szczegóły,
- hierarchia wizualna i spacing.

Ten pierwszy krok powinien poprawić odbiór całej warstwy publicznej bez wchodzenia jeszcze w głębszy polish widoków twórcy i administratora.

#### Implemented In This Task

- wzmocniono publiczny header strony głównej archiwum tak, aby `Atlas Wspomnień` był czytelniejszy jako produkt publiczny,
- uporządkowano kompozycję strony głównej archiwum wokół lżejszego hero, odchudzonego shellu filtrów i bardziej spójnej relacji lista / mapa / detal,
- dopracowano wizualną hierarchię wspólnej warstwy przeglądania bez zmiany istniejącej logiki filtrowania, wyboru zdjęcia i nawigacji,
- poprawiono rytm spacingu, oddech sekcji i gęstość paneli w publicznym widoku archiwum,
- zachowano jedną wspólną warstwę przeglądania dla użytkowników anonimowych i zalogowanych,
- utrzymano refinment w granicach Sprintu 7 bez zmian backendowych i bez wprowadzania nowych funkcji produktowych.

### 2. Branding and Language Refresh

#### Goal

Wprowadzić spójny kierunek produktu pod nazwą `Atlas Wspomnień` oraz przejść na polski język podstawowego interfejsu.

#### Tasks

- Zastąpić roboczą nazwę techniczną nazwą `Atlas Wspomnień` w podstawowych miejscach interfejsu i dokumentacji.
- Wprowadzić paletę `Rose Dust` do tokenów kolorystycznych frontendu.
- Przetłumaczyć podstawowe widoczne teksty aplikacji na język polski.
- Zachować istniejący układ aplikacji i potraktować zmianę jako kontrolowany refresh, nie pełny rebranding od zera.

#### Implemented In This Task

- dopracowano układ przestrzeni twórcy tak, aby formularz dodawania zdjęcia i lista własnych materiałów miały spokojniejszą hierarchię oraz spójniejszy rytm z publiczną warstwą archiwum,
- uporządkowano stronę szczegółów i edycji zdjęcia twórcy, w tym ustawienie pola tytułu na górze oraz opisu bezpośrednio pod nim,
- dopracowano stronę administracyjnego zarządzania użytkownikami tak, aby lepiej wpisywała się w kierunek `Atlas Wspomnień` i `Rose Dust` bez zmiany dotychczasowej akcji blokady,
- poprawiono zachowanie podpowiedzi lokalizacji tak, aby znikały po utracie aktywności pola wpisywania,
- uporządkowano układ pól szerokości i długości geograficznej, aby były czytelniejsze i wizualnie równe,
- utrzymano istniejące funkcjonalności i przepływy twórcy oraz administratora bez zmian backendowych i bez dodawania nowych funkcji produktowych.

### 3. Documentation Updates

#### Goal

Utrzymać zgodność dokumentacji z nową nazwą produktu, kierunkiem wizualnym i refinmentem warstwy publicznej.

#### Tasks

- Dodać decyzję dokumentującą nazwę `Atlas Wspomnień` i kierunek `Rose Dust`.
- Zaktualizować dokumenty wysokiego poziomu, jeśli branding zmieni ich opis produktu.
- Zaktualizować `documentation/sprints/sprint-7.md` wraz z postępem prac.
- Po zakończeniu prac zapytać, czy należy zaktualizować `documentation/current-status.md`.

## Suggested Delivery Order Inside Sprint 7

Rekomendowana kolejność prac:

1. decyzja brandingowa i sprintowa,
2. podstawowe zmiany nazwy i języka interfejsu,
3. odświeżenie tokenów kolorystycznych i lekkie dopracowanie publicznych widoków,
4. domknięcie dokumentacji.

## Definition of Done for Sprint 7

Sprint 7 można uznać za zakończony, gdy:

- publiczna warstwa archiwum jest bardziej spójna i czytelna,
- produkt używa nazwy `Atlas Wspomnień`,
- podstawowy interfejs użytkownika działa po polsku,
- frontend używa kierunku kolorystycznego `Rose Dust`,
- dokumentacja odzwierciedla nowy branding i refinment publicznej warstwy archiwum.
