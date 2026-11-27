export type DirectoryKind = 'recruitment' | 'rent' | 'buy'
export type DirectoryEntry = { id: string; name: string; kind: DirectoryKind; url: string; da: string; en: string }
// Official destinations checked 27 November 2026. Alphabetical, unpaid selection.
export const directoryEntries: DirectoryEntry[] = [
  { id:'academic',name:'Academic Work',kind:'recruitment',url:'https://www.academicwork.dk/ledige-stillinger',da:'Rekruttering og konsulentstillinger med fokus på starten af karrieren.',en:'Recruitment and consulting roles with an early-career focus.' },
  { id:'actief',name:'Actief Hartmanns',kind:'recruitment',url:'https://actief-hartmanns.dk/jobsoegende/',da:'Find faste jobs, vikariater og muligheder for dit næste karriereskridt.',en:'Find permanent roles, temporary work, and your next career opportunity.' },
  { id:'humanizer',name:'HumanizeR',kind:'recruitment',url:'https://humanizer.dk/find-job/',da:'Jobmuligheder og match mellem kandidater og virksomheder i Danmark.',en:'Job opportunities and candidate matches with employers in Denmark.' },
  { id:'jks',name:'JKS',kind:'recruitment',url:'https://www.jks.dk/for-vikarer/ledige-stillinger',da:'Søg ledige vikarjobs og stillinger via JKS’ joboversigt.',en:'Browse temporary jobs and vacancies through JKS’s job listings.' },
  { id:'jobteam',name:'JobTeam',kind:'recruitment',url:'https://jobteam.dk/',da:'Vikar- og rekrutteringsbureau med jobdatabase for jobsøgende.',en:'Temporary staffing and recruitment agency with a job database.' },
  { id:'matchmind',name:'MatchMind',kind:'recruitment',url:'https://matchmind.dk/ledige-jobs',da:'Oversigt over både faste og midlertidige stillinger.',en:'A directory of permanent and temporary positions.' },
  { id:'moment',name:'Moment',kind:'recruitment',url:'https://www.moment.dk/find-job/',da:'Filtrér ledige stillinger efter branche, område og jobtype.',en:'Filter vacancies by industry, area, and employment type.' },
  { id:'randstad',name:'Randstad',kind:'recruitment',url:'https://www.randstad.dk/jobs/',da:'Job inden for blandt andet IT, kontor, teknik, lager og produktion.',en:'Jobs in areas including IT, office work, engineering, warehousing, and production.' },
  { id:'tempteam',name:'Temp-Team',kind:'recruitment',url:'https://temp-team.dk/job-search',da:'Søg faste jobs og vikariater på tværs af flere fagområder.',en:'Search permanent jobs and temporary positions across several sectors.' },
  { id:'worksupply',name:'Work Supply',kind:'recruitment',url:'https://worksupply.dk/ledige-stillinger/',da:'Rekruttering og headhunting med en oversigt over ledige stillinger.',en:'Recruitment and headhunting with current vacancy listings.' },
  { id:'balder',name:'Balder',kind:'rent',url:'https://www.balder.dk/lejeboliger',da:'Private lejeboliger i København og omegn.',en:'Private rental homes in Copenhagen and the surrounding area.' },
  { id:'domea',name:'Domea.dk',kind:'rent',url:'https://www.domea.dk/soeg-bolig/',da:'Almene lejeboliger via DomeaBolig; se ledige boliger og ventelister.',en:'Non-profit rental housing through DomeaBolig; view vacancies and waiting lists.' },
  { id:'heimstaden',name:'Heimstaden',kind:'rent',url:'https://www.heimstaden.dk/ledige-lejeboliger/',da:'Søg ledige lejeboliger i flere dele af Danmark.',en:'Search available rental homes in multiple parts of Denmark.' },
  { id:'kab',name:'KAB',kind:'rent',url:'https://www.kab-bolig.dk/boligsoegende',da:'Almene boliger i hovedstadsområdet. Se aktuelle muligheder og ventelister.',en:'Non-profit housing in the capital region. Check current options and waiting lists.' },
  { id:'newsec',name:'Newsec',kind:'rent',url:'https://www.newsec.dk/hjaelp/bolig',da:'Boligudlejning med link til Newsecs aktuelle udlejningsportal.',en:'Rental housing with a link to Newsec’s current letting portal.' },
  { id:'danbolig',name:'danbolig',kind:'buy',url:'https://danbolig.dk/',da:'Boligsøgning og lokale ejendomsmæglere i Danmark.',en:'Property search and local estate agents in Denmark.' },
  { id:'edc',name:'EDC',kind:'buy',url:'https://www.edc.dk/bolig/',da:'Søg boliger til salg og find en lokal ejendomsmægler.',en:'Search homes for sale and find a local estate agent.' },
  { id:'estate',name:'Estate',kind:'buy',url:'https://www.estate.dk/til-salg',da:'Oversigt over boliger til salg med filtre til din boligsøgning.',en:'Homes for sale with filters for your property search.' },
  { id:'home',name:'home',kind:'buy',url:'https://www.home.dk/til-salg/',da:'Find huse, lejligheder og andre boligtyper til salg.',en:'Find houses, apartments, and other property types for sale.' },
  { id:'nybolig',name:'Nybolig',kind:'buy',url:'https://www.nybolig.dk/til-salg',da:'Boliger til salg og lokalt ejendomsmæglernetværk.',en:'Homes for sale and a network of local estate agents.' },
]
