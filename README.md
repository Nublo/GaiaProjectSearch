# BGA Gaia Parser

A tool for collecting and searching Gaia Project game data from Board Game Arena (BGA).

## What it does

Collects game logs from BGA and stores structured data about each game — which races were played, what buildings were built each round, and how research tracks progressed. This data is then searchable through a web interface.

**Example queries:**
- Find games where Terrans built a Research Lab in round ≤ 3
- Find games where Gleens had Navigation level ≥ 2 by end of round 1
- Find games with player ELO ≥ 300 and Nevlas present

## Analytics

A dedicated analytics view aggregates faction performance across all collected games. For each faction it shows a faction score (based on finishing position relative to player count), average final points, and placement distribution (1st/2nd/3rd/4th). All the same search filters apply, so you can slice stats by ELO range, player count, race combinations, and more.
