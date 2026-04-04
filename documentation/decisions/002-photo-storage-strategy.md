# ADR 002: Strategia przechowywania zdjęć

## Status

Accepted

## Kontekst

Projekt wymaga przechowywania zdjęć dodawanych przez twórców oraz ich późniejszego udostępniania użytkownikom systemu.

Należy rozdzielić:

- przechowywanie metadanych zdjęcia,
- przechowywanie samego pliku zdjęcia.

System powinien być możliwie prosty do wdrożenia na etapie MVP, ale jednocześnie nie powinien zamykać drogi do późniejszego przejścia na bardziej skalowalny model przechowywania plików.

## Decyzja

Na obecnym etapie projektu zdjęcia będą przechowywane na lokalnym systemie plików, w katalogu montowanym do kontenera backendu.

PostgreSQL nie będzie przechowywać binarnej zawartości zdjęć. W bazie danych będą przechowywane wyłącznie:

- metadane zdjęcia,
- informacje o właścicielu,
- informacje opisowe,
- referencja do zapisanego pliku, na przykład ścieżka lub klucz pliku.

## Uzasadnienie

To rozwiązanie zostało wybrane, ponieważ:

- jest prostsze do wdrożenia na etapie MVP,
- zmniejsza złożoność infrastruktury na początku projektu,
- dobrze współpracuje z lokalnym środowiskiem Docker,
- pozwala szybciej wdrożyć podstawowy przepływ dodawania i odczytu zdjęć,
- umożliwia późniejsze przejście na magazyn obiektowy bez zmiany głównego modelu domenowego.

Przechowywanie zdjęć bezpośrednio w PostgreSQL nie zostało wybrane, ponieważ:

- zwiększa złożoność operacji na dużych danych binarnych,
- jest mniej naturalne dla obsługi plików multimedialnych,
- utrudnia późniejszą skalowalność i zmianę sposobu dostarczania plików.

## Sposób odczytu właściwego zdjęcia

System będzie odnajdywał właściwy plik zdjęcia na podstawie danych zapisanych w bazie.

Przykładowy przepływ będzie wyglądał następująco:

1. użytkownik lub twórca wysyła zdjęcie do backendu,
2. backend zapisuje plik w katalogu przeznaczonym do przechowywania zdjęć,
3. backend zapisuje w bazie danych rekord zdjęcia wraz z metadanymi oraz referencją do pliku,
4. podczas odczytu backend pobiera z bazy referencję do pliku,
5. na tej podstawie backend odnajduje właściwy plik i zwraca go klientowi albo generuje odpowiedni adres dostępu.

Oznacza to, że baza danych pozostaje źródłem prawdy dla opisu i identyfikacji zdjęcia, natomiast sam plik jest przechowywany osobno.

## Konsekwencje

Pozytywne konsekwencje:

- prostszy start projektu,
- czytelny podział między metadanymi a plikami,
- mniejsza złożoność wdrożenia w MVP,
- dobra podstawa do dalszego rozwoju.

Tradeoffs:

- rozwiązanie lokalne nie jest jeszcze docelowym rozwiązaniem dla większej skali,
- późniejsza migracja na magazyn obiektowy będzie wymagała warstwy abstrakcji lub dostosowania implementacji storage,
- trzeba pilnować spójności między rekordem w bazie a plikiem na dysku.

## Kierunek dalszego rozwoju

W przyszłości strategia przechowywania zdjęć może zostać zmieniona na magazyn obiektowy zgodny z S3, na przykład:

- MinIO w środowisku lokalnym lub deweloperskim,
- Amazon S3 lub inny kompatybilny storage w środowisku docelowym.

Obecna decyzja została podjęta w taki sposób, aby taka zmiana była możliwa bez przebudowy głównego modelu danych zdjęcia. Docelowo zmieni się miejsce przechowywania pliku, ale nie sam fakt, że baza danych przechowuje metadane oraz referencję do pliku.
