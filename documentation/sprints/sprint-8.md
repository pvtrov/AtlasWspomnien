# Sprint 8

## Sprint Goal

Doprowadzić aplikację do poziomu praktycznej dostępności zgodnej z wymaganiami projektu, ze szczególnym uwzględnieniem standardów WCAG 2.1 AA, czytelności interfejsu, obsługi klawiaturą oraz jakości formularzy i komunikatów.

Sprint 8 skupia się na dostępności i używalności wynikającej bezpośrednio z dostępności, a nie na dodawaniu nowych funkcji biznesowych.

## In Scope

Sprint 8 obejmuje:

- audyt dostępności najważniejszych ekranów i przepływów aplikacji,
- poprawę semantyki HTML i landmarków,
- poprawę widoczności focus states,
- poprawę obsługi klawiaturą,
- przegląd i poprawę kontrastu kolorów,
- poprawę formularzy, etykiet i komunikatów błędów,
- poprawę komunikatów statusowych i live regions tam, gdzie to uzasadnione,
- poprawę dostępności komponentów interaktywnych, w tym niestandardowych paneli i mapy,
- poprawę responsywności w zakresie wpływającym na czytelność i nawigację,
- aktualizację dokumentacji dotyczącą wdrożonych standardów dostępności.

## Out of Scope

Sprint 8 nie obejmuje:

- pełnego zewnętrznego audytu certyfikacyjnego,
- formalnej certyfikacji WCAG,
- rozległego redesignu aplikacji niezwiązanego z dostępnością,
- nowych funkcji biznesowych niezwiązanych z używalnością,
- pełnego systemu wielojęzyczności,
- eksperymentalnych rozwiązań wykraczających poza praktyczne potrzeby projektu.

## Expected Outcome

Po zakończeniu Sprintu 8 projekt powinien zapewniać:

- bardziej dostępny i przewidywalny interfejs,
- wyraźniejsze stany focus i lepszą nawigację klawiaturą,
- bardziej czytelne formularze i komunikaty błędów,
- lepiej uporządkowaną semantykę ekranów,
- poprawioną dostępność publicznej warstwy archiwum, widoków szczegółów, ekranów auth, twórcy i administratora,
- dokumentację zgodną z wdrożonym zakresem dostępności.

## Sprint 8 Task Breakdown

### 1. Accessibility Audit and Remediation

#### Goal

Zidentyfikować i poprawić najważniejsze problemy dostępności w całej aplikacji.

#### Tasks

- Przejrzeć najważniejsze widoki pod kątem semantyki, landmarków i struktury nagłówków.
- Sprawdzić, czy wszystkie ważne interakcje są dostępne z klawiatury.
- Poprawić focus states tam, gdzie są niewidoczne, zbyt słabe lub niespójne.
- Sprawdzić kontrast tekstu, przycisków, elementów aktywnych i komunikatów.
- Uporządkować formularze, etykiety, błędy walidacji i komunikaty statusowe.
- Przejrzeć dostępność bardziej złożonych komponentów, zwłaszcza mapy i interaktywnych paneli.
- Wprowadzić poprawki bez naruszania głównych przepływów produktu.

#### Agent Notes

- Priorytet mają problemy wpływające na praktyczne spełnienie WCAG 2.1 AA.
- Najpierw należy poprawić rzeczy blokujące używanie interfejsu, potem dopracować pozostałe niedoskonałości.
- Dostępność należy traktować jako cechę całego produktu, nie tylko formularzy.

### 2. Accessibility Documentation Update

#### Goal

Zachować zgodność dokumentacji z wdrożonymi zmianami dostępnościowymi.

#### Tasks

- Uzupełnić dokumentację sprintową o zrealizowany zakres prac.
- Zaktualizować dokumentację wysokiego poziomu, jeśli wdrożone poprawki zmieniają praktyczne założenia interfejsu.
- Po zakończeniu prac zapytać, czy należy zaktualizować `documentation/current-status.md`.

#### Agent Notes

- Dokumentacja ma odzwierciedlać faktycznie wdrożone poprawki.
- Nie należy automatycznie aktualizować `current-status.md` bez potwierdzenia użytkownika.

## Suggested Delivery Order Inside Sprint 8

Rekomendowana kolejność prac:

1. audyt najważniejszych ekranów i komponentów,
2. wdrożenie poprawek dostępnościowych,
3. domknięcie dokumentacji.

## Definition of Done for Sprint 8

Sprint 8 można uznać za zakończony, gdy:

- najważniejsze przepływy aplikacji są używalne z klawiatury,
- fokus i interakcje są czytelne i spójne,
- formularze i komunikaty błędów są bardziej dostępne,
- główne widoki mają poprawioną semantykę i strukturę,
- kontrast i czytelność interfejsu zostały praktycznie poprawione,
- dokumentacja odzwierciedla wdrożony zakres dostępności.

## Implemented Accessibility Remediation

W ramach zadania "Accessibility Audit and Remediation" wdrożono praktyczne poprawki dostępnościowe w najważniejszych widokach Sprintu 8:

- dodano skip link oraz poprawiono semantykę nawigacji i głównej treści w shellu aplikacji,
- uporządkowano komunikaty statusowe i błędów w formularzach logowania oraz rejestracji,
- poprawiono opisy, wskazówki i grupowanie pól daty częściowej oraz zakresu dat,
- poprawiono dostępność filtrów wspólnego archiwum, w tym ich stan, komunikaty i relacje z wynikami,
- rozszerzono dostępność niestandardowej mapy o obsługę klawiatury, instrukcje i komunikaty statusowe,
- poprawiono dostępność edytora lokalizacji i wzorca wyboru podpowiedzi adresowych,
- wzmocniono widoczność focus states oraz kontrast kluczowych interaktywnych elementów,
- poprawiono dostępność paneli wyboru w administracji oraz statusowych komunikatów edycji i moderacji,
- poprawiono obsługę klawiaturą w powiększonym widoku zdjęcia, w tym focus po otwarciu i zamknięciu oraz zamykanie klawiszem Escape,
- dodano przełącznik motywu interfejsu z wariantami jasnym, ciemnym i wysokiego kontrastu oraz zapamiętywaniem wyboru użytkownika.
