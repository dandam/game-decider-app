I need some help writing a requirements document for a vibe coding project. I want to create a small website to help my friends make decisions and track outcomes for our board game evenings.

This could be a bit involved, but I'm willing to give it a shot working iteratively to build first, something minimally viable, and then full-featured with several iterations in between. I'd like the requirements to reflect that approach with some clear milestones that lead eventually to a live web app.

Please ask me questions for clarity or offer advice/recommendations prior to generating this plan. Once we have a draft, we'll revise it together. Take your time with my prompt. If you think the prompt deserves revision in order to get optimal results, let's start there. Check your work. 

There are four of us in the group and we typically play online.
The first thing the app would help with is tracking which games we know and which we like in order to decide which of the many games on BoardGameArena.com we might play next.
Some complications:
not all games are four player games
not all of us like the same games
not all of us will play every game or show up every evening
each of us have specific preferences for types of games (cards, roll & write, resource management, etc)
Some of us are better at certain types of games or certain games
Some of us play games on BoardGameArena.com with other players and this affects our ELO scores for those games
The web app would ultimately help determine a short list of games, possibly ranked by fit, given the number of players, which players were playing, and the time we have to play.

It should offer a fun and easy to use interface.
Future features might include a full tracker for all games we play, ways to add new games or scan BoardGameArena.com for new games we might like, ways to edit profiles (avatar, name, preferences, etc), and a secure login for each player. Users would need to login in order to view and use the web app, but login and authentication would likely be something we would add later after principle development but before deploying a beta version to production.

A little thematic humor or whimsy in the interface and approach to using would also be fun. Everything should run quickly without much fuss, so that it's an encouraging supplement to our night of online game play. 

We chat via text and audio on Discord, so having some sort of integration with that at some point, might also come in handy. For example, the app might post when a game starts and its URL when we start a new game, so that late comers could watch the others, etc. And it might also post results. 

There are, of course, a number of dependencies including the level of access the app will have at BoardGameArena. Let's be sure to think about all the possible dependencies as we consider the milestones. We want to add them as we go, rather than trying to boil the ocean with the first release.

More about the tech:
It will be hosted on Cloudways.
I would like to develop using docker or another virtual environment set up that supports that eventual production deployment
I would like to make sure the app has good test coverage, unit, integration, and functional - this is especially important as I will be supporting this site on my own and do not want added features to cause regressions.
Javascript and/or Python are the preferred languages. We should leverage open source and commonly used technology that is fully up to date.
I will use git and github for source control and can set up Github Actions to assist with the build and deploy process as needed, though I want to be able to view and test everything locally in a dev environment. There should be three environments, dev, test, and prod.
Security is extremely important and should be a milestone on its own prior to production deployment, in which the authentication and login approach will be fully vetted and site security fully reviewed, etc.

Product & Project
This product requirements document will serve as a central manifest for the projects various detailed feature requirements and deployment plans. As a markdown file, it will have ways of indicating progress toward completion, noting changes or pivots vs the plan, and link to and/or embed visuals or other design artifacts. 

It should include a brief "TLDR" about the project at the beginning.
It can have a bit of a sense of humor in naming and other conventions, but don't overdo it.
It should include a table of contents and area to list links to supporting materials near the beginning as well.

Generate everything in a format that is easy to read for both humans and AI code generation software.
