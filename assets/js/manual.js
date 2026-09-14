(()=>{
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));

  const AO_MODES=[
    {code:0,label:'Робоча частота',scale:['0','13','25','38','50']},
    {code:1,label:'Задана частота',scale:['0','13','25','38','50']},
    {code:2,label:'Опорна частота',scale:['0','13','25','38','50']},
    {code:3,label:'Швидкість',scale:['0','¼','½','¾','MAX']},
    {code:4,label:'Струм ПЧ',scale:['0','¼','½','¾','MAX']},
    {code:5,label:'Струм двигуна',scale:['0','¼','½','¾','MAX']},
    {code:6,label:'Напруга',scale:['0','¼','½','¾','MAX']},
    {code:7,label:'Потужність',scale:['0','¼','½','¾','MAX']},
    {code:9,label:'Момент',scale:['0','¼','½','¾','MAX']}
  ];
  let aoIndex=0;

  const screens={
    main:{title:'ГОЛОВНА',image:'./assets/img/main.png',sourceSize:[480,272],caption:'Основний екран для швидкого контролю вибраного сигналу, заданої частоти та фактичної швидкості.',objects:[
      {id:'m-title',code:'M-01',type:'view',title:'Назва екрана «ГОЛОВНА»',summary:'Дає однозначне розуміння, що відкритий основний екран контролю.',purpose:'Потрібна, щоб користувач не плутав робочий екран із керуванням або налаштуваннями.',action:'Позначає поточну сторінку.',use:'Для швидкої орієнтації під час переходів між екранами.',attention:'Це лише назва сторінки; вона нічого не змінює.',px:[4,2,172,32]},
      {id:'m-ao-panel',code:'M-02',type:'view',title:'Блок «Вихід AO ПЧ»',summary:'Головний блок спостереження за параметром, який зараз повертає перетворювач.',purpose:'Дозволяє одним місцем контролювати різні параметри ПЧ без дублювання окремих індикаторів.',action:'Показує назву вибраного параметра, його значення та bar.',use:'Під час дослідження роботи ПЧ і порівняння режимів.',attention:'Зміст цього блока залежить від вибору на сторінці «ПАРАМЕТРИ».',px:[8,36,232,115]},
      {id:'m-ao-mode',code:'M-03',type:'view',title:'Назва активного параметра AO',summary:'Пояснює, що саме зараз означає сигнал у лівому блоці.',purpose:'Без цього підпису одне й те саме число неможливо правильно трактувати.',action:'Автоматично змінюється разом із вибраним режимом.',use:'Перед оцінкою bar або цифрового значення.',attention:'Режим тут не змінюється — він лише відображається.',px:[17,68,210,31]},
      {id:'m-ao-value',code:'M-04',type:'view',title:'Цифрове значення AO',summary:'Точне числове значення активного параметра.',purpose:'Bar зручний для швидкої оцінки, а число потрібне для точного зчитування результату.',action:'Показує поточне значення вибраного параметра.',use:'Коли треба записати результат або порівняти його з іншим вимірюванням.',attention:'Одиниця та зміст числа змінюються разом із режимом AO.',px:[77,103,94,43]},
      {id:'m-ao-bar',code:'M-05',type:'view',title:'Bar активного параметра',summary:'Візуальна оцінка рівня сигналу без необхідності постійно читати цифри.',purpose:'Допомагає одразу побачити, чи параметр малий, середній або наближається до верхньої межі.',action:'Разом із режимом змінює призначення та шкалу.',use:'Для швидкого спостереження за зміною параметра в динаміці.',attention:'Це той самий активний параметр, що показаний числом вище.',px:[8,152,232,57]},
      {id:'m-cmd',code:'M-06',type:'view',title:'Задана частота',summary:'Показує, яку частоту стенд зараз задає приводу.',purpose:'Потрібна для порівняння команди з реальною реакцією ПЧ та механізму.',action:'Відображає поточне частотне завдання.',use:'Під час зміни аналогового завдання та перевірки реакції стенду.',attention:'Не плутати з параметром AO — це окреме задане значення.',px:[242,36,230,115]},
      {id:'m-speed',code:'M-07',type:'view',title:'Швидкість обертання',summary:'Незалежний показ фактичної механічної швидкості.',purpose:'Дозволяє перевірити, чи відповідає реальна швидкість тому, як керується двигун.',action:'Показує швидкість за даними енкодера.',use:'Для порівняння з заданою частотою та контролю механічної частини.',attention:'Цей показ не залежить від того, який параметр вибрано для AO.',px:[242,152,230,57]},
      {id:'m-nav-main',code:'M-N1',type:'nav',title:'Кнопка «ГОЛОВНА»',summary:'Повертає до основного екрана контролю.',purpose:'Потрібна для швидкого повернення до загальної картини після налаштувань або керування.',action:'Відкриває «ГОЛОВНА».',use:'Коли потрібно знову бачити основні результати.',attention:'Навігація не змінює режим роботи стенду.',goto:'main',px:[5,215,108,38]},
      {id:'m-nav-control',code:'M-N2',type:'nav',title:'Кнопка «КЕРУВАННЯ»',summary:'Відкриває сторінку команд стенду.',purpose:'Відокремлює дії користувача від сторінки спостереження.',action:'Переходить на «КЕРУВАННЯ».',use:'Коли треба змінити команду або аналогове завдання.',attention:'Перехід сам по собі нічого не вмикає.',goto:'control',px:[118,215,113,38]},
      {id:'m-nav-params',code:'M-N3',type:'nav',title:'Кнопка «ПАРАМЕТРИ»',summary:'Відкриває вихідні дані двигуна та ПЧ.',purpose:'Потрібна, щоб усі дані, які впливають на трактування показів, були зібрані в одному місці.',action:'Переходить на «ПАРАМЕТРИ».',use:'Перед лабораторною роботою або при зміні конфігурації.',attention:'Змінювати значення слід усвідомлено.',goto:'params',px:[237,215,114,38]},
      {id:'m-nav-encoder',code:'M-N4',type:'nav',title:'Кнопка «ЕНКОДЕР»',summary:'Відкриває окрему сторінку контролю енкодера.',purpose:'Дає швидкий доступ до механічної швидкості та діагностики імпульсів.',action:'Переходить на «ЕНКОДЕР».',use:'Для перевірки обертання та налаштувань датчика.',attention:'Навігація не змінює параметри енкодера.',goto:'encoder',px:[357,215,113,38]}
    ]},

    control:{title:'КЕРУВАННЯ',image:'./assets/img/control.png',sourceSize:[480,272],caption:'Сторінка команд: силова частина, функціональні входи ПЧ та аналогове завдання.',objects:[
      {id:'c-title',code:'C-01',type:'view',title:'Назва екрана «КЕРУВАННЯ»',summary:'Показує, що відкрито сторінку активних дій користувача.',purpose:'Допомагає не сплутати керування з екраном спостереження.',action:'Позначає поточну сторінку.',use:'Для орієнтації.',attention:'Сама назва нічого не перемикає.',px:[5,2,214,32]},
      {id:'c-km1',code:'C-02',type:'command',title:'Живлення ПЧ',summary:'Основна команда подачі живлення на перетворювач.',purpose:'Дає можливість окремо підготувати або відключити ПЧ під час лабораторної роботи.',action:'Перемикає стан живлення ПЧ.',use:'Перед роботою з приводом та після завершення досліду.',attention:'Перед увімкненням переконайся, що стенд готовий до запуску.',px:[17,65,87,69]},
      {id:'c-acl1',code:'C-03',type:'command',title:'Шунт ACL1',summary:'Керує станом першого дроселя стенду.',purpose:'Потрібен, щоб у лабораторній роботі можна було порівнювати поведінку привода з дроселем і без нього.',action:'Вмикає або вимикає шунтування ACL1.',use:'Під час дослідження впливу елементів силової частини.',attention:'Змінюй стан тільки відповідно до завдання лабораторної роботи.',px:[106,65,87,69]},
      {id:'c-acl2',code:'C-04',type:'command',title:'Шунт ACL2',summary:'Керує станом другого дроселя стенду.',purpose:'Дозволяє окремо досліджувати вплив вихідного дроселя на роботу електропривода.',action:'Вмикає або вимикає шунтування ACL2.',use:'Коли лабораторна робота вимагає порівняння режимів.',attention:'Не перемикай без розуміння поточного режиму стенду.',px:[205,65,87,69]},
      {id:'c-s1',code:'C-05',type:'command',title:'S1',summary:'Перша універсальна функціональна команда ПЧ.',purpose:'Дає студенту можливість перевірити функцію, призначену входу S1 у поточній конфігурації ПЧ.',action:'Вмикає або вимикає S1.',use:'Коли в лабораторній роботі досліджується відповідна функція ПЧ.',attention:'Призначення S1 визначається налаштуванням самого ПЧ.',px:[304,89,36,43]},
      {id:'c-s2',code:'C-06',type:'command',title:'S2',summary:'Друга універсальна функціональна команда ПЧ.',purpose:'Потрібна для окремого тестування функції, призначеної входу S2.',action:'Вмикає або вимикає S2.',use:'За умовами конкретного лабораторного досліду.',attention:'Назва S2 не визначає її функцію — вона задається в ПЧ.',px:[348,89,36,43]},
      {id:'c-s3',code:'C-07',type:'command',title:'S3',summary:'Третя універсальна функціональна команда ПЧ.',purpose:'Дозволяє досліджувати третю дискретну функцію без зміни самої HMI.',action:'Вмикає або вимикає S3.',use:'За програмою лабораторної роботи.',attention:'Спочатку перевір, яка функція призначена S3.',px:[393,89,36,43]},
      {id:'c-s4',code:'C-08',type:'command',title:'S4',summary:'Четверта універсальна функціональна команда ПЧ.',purpose:'Завершує набір дискретних команд для дослідження різних функцій привода.',action:'Вмикає або вимикає S4.',use:'Коли це передбачено налаштуванням ПЧ та лабораторною роботою.',attention:'Не вважай S4 фіксованою функцією — її призначення може змінюватися.',px:[437,89,36,43]},
      {id:'c-analog-bar',code:'C-09',type:'param',title:'Bar аналогового завдання',summary:'Наочно показує рівень команди, яку користувач подає на ПЧ.',purpose:'Дає швидке розуміння величини завдання без читання числа.',action:'Відображає поточний рівень від 0 до 100%.',use:'Під час плавної зміни швидкості або іншого параметра, який керується аналоговим входом ПЧ.',attention:'Bar і числове поле поруч показують одне й те саме завдання.',px:[8,140,334,66]},
      {id:'c-analog-num',code:'C-10',type:'param',title:'Числове аналогове завдання',summary:'Точний ввід рівня аналогової команди.',purpose:'Потрібен, коли значення треба встановити точно, а не приблизно по bar.',action:'Дозволяє задати значення у відсотках.',use:'Для фіксованих точок досліду та повторюваних вимірювань.',attention:'Перед зміною перевір, який параметр ПЧ керується аналоговим завданням.',px:[348,140,124,66]},
      {id:'c-nav-main',code:'C-N1',type:'nav',title:'Кнопка «ГОЛОВНА»',summary:'Повернення до основних результатів.',purpose:'Потрібна, щоб після зміни команди одразу побачити реакцію стенду.',action:'Відкриває «ГОЛОВНА».',use:'Після зміни завдання або команд.',attention:'Перехід не скасовує вже задані команди.',goto:'main',px:[5,215,108,38]},
      {id:'c-nav-control',code:'C-N2',type:'nav',title:'Кнопка «КЕРУВАННЯ»',summary:'Залишає на поточному екрані керування.',purpose:'Показує активний пункт навігації.',action:'Відкриває «КЕРУВАННЯ».',use:'Для повернення до команд після перегляду іншої сторінки.',attention:'Не змінює стан команд.',goto:'control',px:[118,215,113,38]},
      {id:'c-nav-params',code:'C-N3',type:'nav',title:'Кнопка «ПАРАМЕТРИ»',summary:'Перехід до вихідних даних та вибору AO.',purpose:'Дає доступ до параметрів, які пояснюють масштаб і зміст показів.',action:'Відкриває «ПАРАМЕТРИ».',use:'Перед налаштуванням або зміною режиму AO.',attention:'Параметри впливають на інтерпретацію результатів.',goto:'params',px:[237,215,114,38]},
      {id:'c-nav-encoder',code:'C-N4',type:'nav',title:'Кнопка «ЕНКОДЕР»',summary:'Перехід до контролю енкодера.',purpose:'Потрібна для перевірки фактичної механічної швидкості.',action:'Відкриває «ЕНКОДЕР».',use:'Під час порівняння команди зі швидкістю вала.',attention:'Перехід нічого не змінює.',goto:'encoder',px:[357,215,113,38]}
    ]},

    params:{title:'ПАРАМЕТРИ',image:'./assets/img/params.png',sourceSize:[480,272],caption:'Вихідні дані двигуна і ПЧ та вибір того, який параметр показувати на головному екрані.',objects:[
      {id:'p-title',code:'P-01',type:'view',title:'Назва екрана «ПАРАМЕТРИ»',summary:'Показує, що користувач працює з вихідними даними стенду.',purpose:'Відділяє налаштування від оперативного керування.',action:'Позначає поточний екран.',use:'Для орієнтації.',attention:'Сама назва нічого не змінює.',px:[4,2,202,32]},
      {id:'p-power',code:'P-02',type:'param',title:'Номінальна потужність двигуна',summary:'Паспортна потужність встановленого двигуна.',purpose:'Потрібна, щоб система правильно трактувала навантаження та розрахункові величини.',action:'Зберігає номінальну потужність двигуна.',use:'При першому налаштуванні або заміні двигуна.',attention:'Вводь значення з шильдика двигуна.',px:[148,61,62,22]},
      {id:'p-voltage',code:'P-03',type:'param',title:'Номінальна напруга двигуна',summary:'Паспортна напруга двигуна.',purpose:'Допомагає узгодити параметри стенду з конкретним двигуном.',action:'Зберігає номінальну напругу.',use:'При налаштуванні стенду під інший двигун.',attention:'Не вводь значення навмання.',px:[148,84,62,20]},
      {id:'p-current',code:'P-04',type:'param',title:'Номінальний струм двигуна',summary:'Паспортний струм двигуна.',purpose:'Потрібен для коректного порівняння струму навантаження з номінальним режимом двигуна.',action:'Зберігає номінальний струм.',use:'При налаштуванні або заміні двигуна.',attention:'Бери значення з паспортної таблички.',px:[148,105,62,20]},
      {id:'p-freq',code:'P-05',type:'param',title:'Номінальна частота двигуна',summary:'Частота, для якої задані паспортні характеристики двигуна.',purpose:'Дає базову точку для порівняння робочої частоти з номінальним режимом.',action:'Зберігає номінальну частоту.',use:'Під час первинного налаштування.',attention:'Не плутати з максимальною вихідною частотою ПЧ.',px:[148,126,62,20]},
      {id:'p-rpm',code:'P-06',type:'param',title:'Номінальні оберти двигуна',summary:'Паспортна швидкість вала у номінальному режимі.',purpose:'Потрібна для порівняння фактичної швидкості з паспортною та для розрахункових оцінок.',action:'Зберігає номінальні оберти.',use:'При налаштуванні двигуна.',attention:'Вводь фактичне паспортне значення, а не синхронну швидкість.',px:[148,147,62,20]},
      {id:'p-cosphi',code:'P-07',type:'param',title:'Коефіцієнт потужності cos φ',summary:'Паспортний коефіцієнт потужності двигуна.',purpose:'Потрібен для коректних розрахункових оцінок електричного навантаження.',action:'Зберігає значення cos φ.',use:'При введенні паспортних даних двигуна.',attention:'Значення береться з шильдика або документації двигуна.',px:[148,168,62,20]},
      {id:'p-eff',code:'P-08',type:'param',title:'ККД двигуна',summary:'Паспортний коефіцієнт корисної дії.',purpose:'Дає можливість враховувати різницю між спожитою і корисною потужністю.',action:'Зберігає ККД двигуна.',use:'При налаштуванні паспортних даних.',attention:'Вводь значення у форматі, прийнятому на HMI.',px:[148,189,62,20]},
      {id:'p-fmax',code:'P-09',type:'param',title:'Максимальна вихідна частота ПЧ',summary:'Верхня межа частотного діапазону, з яким працює стенд.',purpose:'Потрібна, щоб частотні покази та шкали відповідали реальним налаштуванням ПЧ.',action:'Задає верхню робочу межу для відображення частоти.',use:'Після зміни налаштувань ПЧ.',attention:'Це не номінальна частота двигуна.',px:[394,84,61,21]},
      {id:'p-inom',code:'P-10',type:'param',title:'Номінальний струм ПЧ',summary:'Номінальний струм встановленого перетворювача.',purpose:'Потрібен, щоб струмовий показ на HMI мав зрозумілий масштаб відносно можливостей ПЧ.',action:'Зберігає номінальний струм перетворювача.',use:'При заміні ПЧ або налаштуванні іншого стенду.',attention:'Бери значення з даних конкретного ПЧ.',px:[394,106,61,20]},
      {id:'p-unom',code:'P-11',type:'param',title:'Номінальна напруга ПЧ',summary:'Номінальна вихідна напруга перетворювача.',purpose:'Потрібна, щоб напруга на головному екрані відображалась у правильному контексті.',action:'Зберігає номінальну напругу ПЧ.',use:'При зміні конфігурації стенду.',attention:'Має відповідати фактичному ПЧ.',px:[394,130,61,21]},
      {id:'p-mode',code:'P-12',type:'param',title:'P06.14 — вибір параметра AO',summary:'Визначає, який параметр ПЧ буде показаний у великому блоці на «ГОЛОВНА».',purpose:'Потрібен, щоб один аналоговий канал можна було використовувати для різних лабораторних вимірювань.',action:'Кожне натискання в цій вебмоделі переходить до наступного режиму AO.',use:'Перед дослідом, коли потрібно змінити параметр спостереження.',attention:'Після вибору перейди на «ГОЛОВНА» і перевір, що змінилися назва та bar.',special:'cycleAO',px:[337,176,136,31]},
      {id:'p-mode-text',code:'P-13',type:'view',title:'Розшифрування вибраного режиму',summary:'Текстом пояснює, що означає поточне числове значення P06.14.',purpose:'Прибирає необхідність пам’ятати код кожного режиму.',action:'Автоматично змінюється разом із P06.14.',use:'Одразу після зміни режиму.',attention:'Це індикація; окремо натискати її не потрібно.',px:[382,176,90,31]},
      {id:'p-nav-main',code:'P-N1',type:'nav',title:'Кнопка «ГОЛОВНА»',summary:'Повертає до результатів після зміни параметрів.',purpose:'Дає змогу одразу перевірити, як змінився екран після вибору AO.',action:'Відкриває «ГОЛОВНА».',use:'Після зміни P06.14 або паспортних даних.',attention:'Перехід сам нічого не змінює.',goto:'main',px:[5,215,108,38]},
      {id:'p-nav-control',code:'P-N2',type:'nav',title:'Кнопка «КЕРУВАННЯ»',summary:'Переходить до команд стенду.',purpose:'Потрібна для повернення до досліду після налаштувань.',action:'Відкриває «КЕРУВАННЯ».',use:'Коли параметри вже перевірені.',attention:'Команди на керуванні залишаються окремими від параметрів.',goto:'control',px:[118,215,113,38]},
      {id:'p-nav-params',code:'P-N3',type:'nav',title:'Кнопка «ПАРАМЕТРИ»',summary:'Активний пункт поточної сторінки.',purpose:'Показує, де користувач зараз знаходиться.',action:'Відкриває «ПАРАМЕТРИ».',use:'Для повернення до налаштувань.',attention:'Натискання не змінює значення.',goto:'params',px:[237,215,114,38]},
      {id:'p-nav-encoder',code:'P-N4',type:'nav',title:'Кнопка «ЕНКОДЕР»',summary:'Відкриває контроль механічної швидкості.',purpose:'Дає змогу після налаштувань перевірити фактичне обертання.',action:'Відкриває «ЕНКОДЕР».',use:'Після запуску двигуна або при перевірці датчика.',attention:'Перехід не змінює параметри.',goto:'encoder',px:[357,215,113,38]}
    ]},

    encoder:{title:'ЕНКОДЕР',image:'./assets/img/encoder.png',sourceSize:[480,272],caption:'Окремий екран для контролю фактичної швидкості, сигналів A/B та параметрів енкодера.',objects:[
      {id:'e-title',code:'E-01',type:'view',title:'Назва екрана «ЕНКОДЕР»',summary:'Позначає сторінку контролю датчика швидкості.',purpose:'Допомагає швидко відрізнити діагностику енкодера від інших сторінок.',action:'Показує назву поточного екрана.',use:'Для орієнтації.',attention:'Не впливає на роботу датчика.',px:[5,2,165,32]},
      {id:'e-speed',code:'E-02',type:'view',title:'Поточна швидкість',summary:'Основний результат роботи енкодера — фактична швидкість вала.',purpose:'Потрібна для незалежної перевірки механічної частини привода.',action:'Показує швидкість обертання.',use:'Під час порівняння команди ПЧ з реальною швидкістю.',attention:'За нерухомого вала значення має бути близьким до нуля.',px:[8,43,178,80]},
      {id:'e-a',code:'E-03',type:'view',title:'Фаза A',summary:'Показує активність першого каналу енкодера.',purpose:'Потрібна для швидкої перевірки, що один із двох каналів датчика реально перемикається.',action:'Індикатор змінює стан при проходженні імпульсів.',use:'Особливо корисно при повільному ручному прокручуванні вала.',attention:'На високій швидкості окремі спалахи візуально не оцінюються.',px:[190,49,80,71]},
      {id:'e-b',code:'E-04',type:'view',title:'Фаза B',summary:'Показує активність другого каналу енкодера.',purpose:'Разом із фазою A дозволяє перевірити повноцінну роботу двоканального датчика.',action:'Індикатор змінює стан при проходженні імпульсів.',use:'При первинній перевірці підключення та напрямку обертання.',attention:'Для нормальної роботи мають бути доступні обидва канали.',px:[275,49,80,71]},
      {id:'e-motion',code:'E-05',type:'view',title:'РУХ / СТОП',summary:'Швидка ознака того, чи бачить система імпульси від енкодера.',purpose:'Дає відповідь без аналізу лічильників: вал рухається чи система не бачить руху.',action:'Показує «РУХ» при наявності імпульсів і «СТОП» за їх відсутності.',use:'Для швидкої перевірки перед детальною діагностикою.',attention:'Якщо вал обертається, а тут «СТОП», треба перевіряти сигнал енкодера.',px:[357,49,114,71]},
      {id:'e-count',code:'E-06',type:'view',title:'Лічильник HSC0',summary:'Накопичує імпульси енкодера.',purpose:'Допомагає переконатися, що імпульси реально надходять і рахуються.',action:'Значення змінюється під час обертання.',use:'Коли швидкість не відображається або є сумнів у роботі датчика.',attention:'Для звичайної роботи оператору цей лічильник не потрібен постійно.',px:[28,172,70,27]},
      {id:'e-window',code:'E-07',type:'view',title:'Імпульси / 100 мс',summary:'Показує, скільки імпульсів надійшло за короткий інтервал.',purpose:'Дає швидке уявлення про інтенсивність сигналу і використовується для розрахунку швидкості.',action:'Зростає зі збільшенням швидкості обертання.',use:'Для діагностики та перевірки розрахунку швидкості.',attention:'На нерухомому валу має бути нуль.',px:[130,172,70,27]},
      {id:'e-ppr',code:'E-08',type:'param',title:'PPR',summary:'Кількість імпульсів енкодера на один оберт, задана виробником.',purpose:'Потрібна, щоб система могла перетворити імпульси у реальну швидкість.',action:'Задає паспортний параметр енкодера.',use:'При встановленні або заміні енкодера.',attention:'Для поточного енкодера значення має відповідати його маркуванню.',px:[229,172,67,27]},
      {id:'e-mult',code:'E-09',type:'param',title:'Множник',summary:'Визначає, скільки фронтів сигналу враховується за один базовий імпульс.',purpose:'Потрібен для узгодження способу підрахунку з типом обробки квадратурного сигналу.',action:'Змінює підсумкову кількість відліків за оберт.',use:'Під час налаштування енкодера.',attention:'Без потреби не змінювати — неправильне значення дасть неправильну швидкість.',px:[304,172,68,27]},
      {id:'e-cpr',code:'E-10',type:'view',title:'Імп./об',summary:'Підсумкова кількість відліків, яку система використовує на один повний оберт.',purpose:'Дає просту перевірку, що PPR і множник узгоджені між собою.',action:'Автоматично формується з параметрів енкодера.',use:'Після зміни PPR або множника.',attention:'Це контрольне поле, його не потрібно вводити вручну.',px:[387,172,69,27]},
      {id:'e-nav-main',code:'E-N1',type:'nav',title:'Кнопка «ГОЛОВНА»',summary:'Повернення до основних результатів.',purpose:'Дозволяє після перевірки енкодера одразу порівняти швидкість з іншими показами.',action:'Відкриває «ГОЛОВНА».',use:'Після діагностики енкодера.',attention:'Перехід не скидає параметри.',goto:'main',px:[5,215,108,38]},
      {id:'e-nav-control',code:'E-N2',type:'nav',title:'Кнопка «КЕРУВАННЯ»',summary:'Переходить до команд стенду.',purpose:'Потрібна, коли після перевірки швидкості треба змінити завдання.',action:'Відкриває «КЕРУВАННЯ».',use:'Під час досліду.',attention:'Сам перехід не змінює команду.',goto:'control',px:[118,215,113,38]},
      {id:'e-nav-params',code:'E-N3',type:'nav',title:'Кнопка «ПАРАМЕТРИ»',summary:'Перехід до налаштувань двигуна, ПЧ та режиму AO.',purpose:'Потрібна, якщо результати перевірки вимагають переглянути вихідні дані.',action:'Відкриває «ПАРАМЕТРИ».',use:'При налаштуванні або перевірці конфігурації.',attention:'Не змінюй параметри без причини.',goto:'params',px:[237,215,114,38]},
      {id:'e-nav-encoder',code:'E-N4',type:'nav',title:'Кнопка «ЕНКОДЕР»',summary:'Активний пункт сторінки енкодера.',purpose:'Показує поточне місце в навігації.',action:'Відкриває «ЕНКОДЕР».',use:'Для повернення до діагностики датчика.',attention:'Натискання не змінює налаштування.',goto:'encoder',px:[357,215,113,38]}
    ]}
  };

  const selector=$('#screenSelector'),screenImg=$('#interactiveScreen'),hotspotLayer=$('#hotspotLayer'),dynamicLayer=$('#dynamicLayer'),screenTitle=$('#screenTitle'),screenCaption=$('#screenCaption'),register=$('#objectRegister'),objectCount=$('#objectCount');
  const selectionCode=$('#selectionCode'),selectionTitle=$('#selectionTitle'),selectionHint=$('#selectionHint');
  let currentScreen='main',selectedId=null;
  const classLabel={view:'ІНДИКАЦІЯ',nav:'НАВІГАЦІЯ',param:'ПАРАМЕТР',command:'КОМАНДА'};

  function mode(){return AO_MODES[aoIndex]}
  function renderDynamic(){
    dynamicLayer.innerHTML='';
    const m=mode();
    if(currentScreen==='main'){
      const modeBox=document.createElement('div'); modeBox.className='dynamic-chip dynamic-main-mode'; modeBox.textContent=`${m.code} - ${m.label}`; dynamicLayer.appendChild(modeBox);
      const scale=document.createElement('div'); scale.className='dynamic-chip dynamic-main-scale'; scale.innerHTML=m.scale.map(v=>`<span>${v}</span>`).join(''); dynamicLayer.appendChild(scale);
    }
    if(currentScreen==='params'){
      const code=document.createElement('div'); code.className='dynamic-chip dynamic-param-code'; code.textContent=m.code; dynamicLayer.appendChild(code);
      const text=document.createElement('div'); text.className='dynamic-chip dynamic-param-mode'; text.textContent=m.label; dynamicLayer.appendChild(text);
    }
  }

  function updateObjectPosition(){
    const objects=screens[currentScreen].objects,idx=objects.findIndex(o=>o.id===selectedId);
    $('#objectPosition').textContent=idx>=0?`${idx+1} / ${objects.length}`:`— / ${objects.length}`;
  }
  function updateInspector(obj){
    $('#objectCode').textContent=obj?.code||'HMI-00';
    $('#objectClass').textContent=obj?(classLabel[obj.type]||'ОБ’ЄКТ ІНТЕРФЕЙСУ'):'ОБ’ЄКТ ІНТЕРФЕЙСУ';
    $('#objectTitle').textContent=obj?.title||'Оберіть об’єкт на екрані';
    $('#objectSummary').textContent=obj?.summary||'Натисни на виділену область HMI, щоб побачити її призначення та правильний спосіб використання.';
    $('#objectPurpose').textContent=obj?.purpose||'—';
    $('#objectAction').textContent=obj?.action||'—';
    $('#objectUse').textContent=obj?.use||'—';
    $('#objectAttention').textContent=obj?.attention||'—';
    const warning=$('#objectWarning'); warning.hidden=!obj?.warning; warning.textContent=obj?.warning||'';
    updateObjectPosition();
  }
  function cycleAO(){
    aoIndex=(aoIndex+1)%AO_MODES.length;
    renderDynamic();
    const obj=screens.params.objects.find(o=>o.id==='p-mode');
    updateInspector({...obj,summary:`Зараз вибрано: ${mode().code} — ${mode().label}. Натисни ще раз, щоб перейти до наступного режиму.`});
    selectionHint.textContent=`Поточний вибір: ${mode().code} — ${mode().label}`;
  }
  function selectObject(id,opts={}){
    const obj=screens[currentScreen].objects.find(o=>o.id===id); if(!obj)return;
    selectedId=id;
    $$('.hmi-hotspot',hotspotLayer).forEach(b=>b.classList.toggle('active',b.dataset.id===id));
    $$('button',register).forEach(b=>b.classList.toggle('active',b.dataset.id===id));
    selectionCode.textContent=obj.code; selectionTitle.textContent=obj.title; selectionHint.textContent=obj.summary;
    updateInspector(obj);
    if(obj.special==='cycleAO'){cycleAO();return}
    if(opts.navigate&&obj.goto)setScreen(obj.goto);
  }
  function renderObjects(){
    const screen=screens[currentScreen];
    hotspotLayer.innerHTML=''; register.innerHTML=''; selectedId=null;
    screen.objects.forEach((obj,i)=>{
      const b=document.createElement('button'); b.type='button'; b.className=`hmi-hotspot type-${obj.type}`; b.dataset.id=obj.id; b.setAttribute('aria-label',`${i+1}. ${obj.title}`);
      const [x,y,w,h]=obj.px; const [sw,sh]=screen.sourceSize; Object.assign(b.style,{left:`${x/sw*100}%`,top:`${y/sh*100}%`,width:`${w/sw*100}%`,height:`${h/sh*100}%`});
      b.addEventListener('click',()=>selectObject(obj.id,{navigate:Boolean(obj.goto)})); hotspotLayer.appendChild(b);
      const r=document.createElement('button'); r.type='button'; r.dataset.id=obj.id; r.innerHTML=`<em>${String(i+1).padStart(2,'0')}</em><b>${obj.title}</b><span>${classLabel[obj.type]||''}</span>`; r.addEventListener('click',()=>selectObject(obj.id)); register.appendChild(r);
    });
    objectCount.textContent=`${screen.objects.length} об’єктів`;
    selectionCode.textContent='—'; selectionTitle.textContent='Оберіть елемент HMI'; selectionHint.textContent='Клік по виділеній зоні відкриває пояснення нижче.';
    updateInspector(null); renderDynamic();
  }
  function setScreen(key){
    if(!screens[key])return; currentScreen=key; const screen=screens[key]; screenImg.src=screen.image; screenImg.alt=`Екран ${screen.title}`; screenTitle.textContent=screen.title; screenCaption.textContent=screen.caption;
    $$('.screen-tab',selector).forEach(btn=>{const active=btn.dataset.screen===key;btn.classList.toggle('active',active);btn.setAttribute('aria-selected',active?'true':'false')});
    renderObjects();
  }
  selector.addEventListener('click',e=>{const b=e.target.closest('[data-screen]');if(b)setScreen(b.dataset.screen)});
  $('#toggleHotspots').addEventListener('click',e=>{const hidden=hotspotLayer.classList.toggle('hidden-hotspots');e.currentTarget.textContent=hidden?'Показати позначення':'Сховати позначення'});
  $('#resetExplorer').addEventListener('click',()=>{aoIndex=0;hotspotLayer.classList.remove('hidden-hotspots');$('#toggleHotspots').textContent='Сховати позначення';setScreen('main')});
  $('#prevObject').addEventListener('click',()=>step(-1)); $('#nextObject').addEventListener('click',()=>step(1));
  function step(d){const list=screens[currentScreen].objects;if(!list.length)return;let i=list.findIndex(o=>o.id===selectedId);if(i<0)i=d>0?-1:0;selectObject(list[(i+d+list.length)%list.length].id)}

  const menuButton=$('#menuButton'),sidebar=$('#sidebar'),drawer=$('#drawerOverlay');
  menuButton.addEventListener('click',()=>{const open=!sidebar.classList.contains('open');sidebar.classList.toggle('open',open);drawer.hidden=!open;document.body.classList.toggle('drawer-open',open)});
  drawer.addEventListener('click',()=>{sidebar.classList.remove('open');drawer.hidden=true;document.body.classList.remove('drawer-open')});
  $$('.toc-link').forEach(a=>a.addEventListener('click',()=>{sidebar.classList.remove('open');drawer.hidden=true;document.body.classList.remove('drawer-open')}));
  $('#printButton').addEventListener('click',()=>window.print()); $('#headerSearchButton').addEventListener('click',()=>$('#searchInput').focus());

  const sections=$$('.searchable'),searchInput=$('#searchInput'),searchResults=$('#searchResults');
  searchInput.addEventListener('input',()=>{const q=searchInput.value.trim().toLowerCase();if(!q){searchResults.hidden=true;searchResults.innerHTML='';return}const hits=sections.filter(s=>s.textContent.toLowerCase().includes(q)).slice(0,8);searchResults.innerHTML=hits.length?hits.map(s=>`<button class="search-result" data-target="${s.id}"><strong>${s.dataset.title||$('h1,h2',s)?.textContent||s.id}</strong></button>`).join(''):'<div class="search-empty">Нічого не знайдено</div>';searchResults.hidden=false});
  searchResults.addEventListener('click',e=>{const b=e.target.closest('[data-target]');if(!b)return;document.getElementById(b.dataset.target)?.scrollIntoView({behavior:'smooth'});searchResults.hidden=true});

  const label=$('#currentSectionLabel');
  const observer=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!visible)return;label.textContent=visible.target.dataset.title||$('h1,h2',visible.target)?.textContent||'Розділ';}, {rootMargin:'-20% 0px -65% 0px',threshold:[0,.05,.2]});
  sections.forEach(s=>observer.observe(s));

  document.addEventListener('keydown',e=>{if(e.key==='/'&&document.activeElement?.tagName!=='INPUT'){e.preventDefault();searchInput.focus()}});
  setScreen('main');
})();
