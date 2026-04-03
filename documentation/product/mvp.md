# MVP

## Cel MVP

Celem MVP jest dostarczenie minimalnej, ale użytecznej wersji aplikacji internetowej dla cyfrowego archiwum społecznościowego, która umożliwi:

- dodawanie materiałów fotograficznych przez twórców,
- opisywanie materiałów podstawowymi metadanymi,
- przeglądanie i wyszukiwanie materiałów przez użytkowników,
- podstawową moderację treści przez administratora.

MVP ma potwierdzić, że główny przepływ wartości w systemie działa od początku do końca:

- twórca dodaje zdjęcie i opisuje je,
- przeglądający może takie zdjęcie odnaleźć i obejrzeć,
- administrator może zareagować w przypadku błędnych lub niepożądanych treści.

## Co wchodzi do MVP

W skład MVP wchodzą następujące funkcjonalności:

### 1. Konta użytkowników i role

- rejestracja użytkownika typu twórca,
- logowanie użytkownika,
- podstawowe role systemowe:
  - administrator,
  - przeglądający,
  - twórca.

### 2. Dodawanie i zarządzanie zdjęciami

- dodawanie zdjęcia przez twórcę,
- zapisywanie podstawowych metadanych zdjęcia:
  - lokalizacja,
  - data wykonania zdjęcia z elastyczną dokładnością,
  - opis tekstowy,
- przypisanie zdjęcia do struktury hierarchicznej lub kategorii,
- edycja własnego zdjęcia i jego metadanych,
- usuwanie własnego zdjęcia.

### 3. Przeglądanie i wyszukiwanie

- przeglądanie dostępnych zdjęć,
- podgląd szczegółów pojedynczego zdjęcia,
- wyszukiwanie po frazie tekstowej,
- filtrowanie po lokalizacji,
- filtrowanie po dacie lub zakresie dat,
- przeglądanie treści w oparciu o strukturę hierarchiczną.

### 4. Podstawowa administracja

- usuwanie wadliwych treści,
- edycja opisu i metadanych przesłanego zdjęcia,
- blokowanie użytkownika przed dodawaniem nowych materiałów.

### 5. Podstawy API

- prywatne API dla działań twórcy,
- podstawowe publiczne API do przeglądania i wyszukiwania materiałów.

## Co nie wchodzi do MVP

Na etapie MVP świadomie nie uwzględniamy:

- logowania przez Google, Facebook lub innych zewnętrznych dostawców tożsamości,
- zaawansowanego audytu bezpieczeństwa,
- rozbudowanych statystyk i raportów administracyjnych,
- zaawansowanego wyszukiwania geoprzestrzennego,
- rozbudowanych workflow moderacyjnych,
- zaawansowanej wersji publicznego API,
- automatycznej analizy zdjęć lub inteligentnego tagowania.

## Proponowana kolejność realizacji

Rekomendowana kolejność prac nad MVP:

1. fundament techniczny aplikacji,
2. uwierzytelnianie i role,
3. dodawanie zdjęć i metadanych,
4. przeglądanie oraz wyszukiwanie,
5. zarządzanie własnymi materiałami,
6. podstawowe funkcje administracyjne.

## Znaczenie MVP dla dalszego rozwoju

MVP nie jest docelową pełną wersją produktu. Jego celem jest zbudowanie pierwszej spójnej wersji systemu, która pozwoli:

- zweryfikować model działania aplikacji,
- uporządkować architekturę techniczną,
- przygotować podstawę pod rozwój kolejnych funkcji,
- szybciej podejmować dalsze decyzje projektowe na podstawie działającego rozwiązania.
