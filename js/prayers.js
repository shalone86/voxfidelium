// Prayer texts (traditional English and Latin) and mystery data.
export const PRAYERS = {
  sign: {
    en: { title: "The Sign of the Cross", text: "In the name of the Father, and of the Son, and of the Holy Spirit. Amen." },
    la: { title: "Signum Crucis", text: "In nómine Patris, et Fílii, et Spíritus Sancti. Amen." },
  },
  creed: {
    en: { title: "The Apostles' Creed", text: "I believe in God, the Father almighty, Creator of heaven and earth, and in Jesus Christ, his only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried; he descended into hell; on the third day he rose again from the dead; he ascended into heaven, and is seated at the right hand of God the Father almighty; from there he will come to judge the living and the dead. I believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen." },
    la: { title: "Symbolum Apostolorum", text: "Credo in Deum Patrem omnipoténtem, Creatórem cæli et terræ. Et in Iesum Christum, Fílium eius únicum, Dóminum nostrum, qui concéptus est de Spíritu Sancto, natus ex María Vírgine, passus sub Póntio Piláto, crucifíxus, mórtuus, et sepúltus, descéndit ad ínferos, tértia die resurréxit a mórtuis, ascéndit ad cælos, sedet ad déxteram Dei Patris omnipoténtis, inde ventúrus est iudicáre vivos et mórtuos. Credo in Spíritum Sanctum, sanctam Ecclésiam cathólicam, Sanctórum communiónem, remissiónem peccatórum, carnis resurrectiónem, vitam ætérnam. Amen." },
  },
  ourFather: {
    en: { title: "Our Father", text: "Our Father, who art in heaven, hallowed be thy name; thy kingdom come, thy will be done on earth as it is in heaven. Give us this day our daily bread, and forgive us our trespasses, as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen." },
    la: { title: "Pater Noster", text: "Pater noster, qui es in cælis, sanctificétur nomen tuum. Advéniat regnum tuum. Fiat volúntas tua, sicut in cælo et in terra. Panem nostrum quotidiánum da nobis hódie, et dimítte nobis débita nostra sicut et nos dimíttimus debitóribus nostris. Et ne nos indúcas in tentatiónem, sed líbera nos a malo. Amen." },
  },
  hailMary: {
    en: { title: "Hail Mary", text: "Hail Mary, full of grace, the Lord is with thee; blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen." },
    la: { title: "Ave Maria", text: "Ave María, grátia plena, Dóminus tecum. Benedícta tu in muliéribus, et benedíctus fructus ventris tui, Iesus. Sancta María, Mater Dei, ora pro nobis peccatóribus, nunc et in hora mortis nostræ. Amen." },
  },
  gloryBe: {
    en: { title: "Glory Be", text: "Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen." },
    la: { title: "Gloria Patri", text: "Glória Patri, et Fílio, et Spirítui Sancto. Sicut erat in princípio, et nunc, et semper, et in sǽcula sæculórum. Amen." },
  },
  fatima: {
    en: { title: "O My Jesus", text: "O my Jesus, forgive us our sins, save us from the fires of hell; lead all souls to heaven, especially those in most need of thy mercy." },
    la: { title: "Oratio Fatimae", text: "O mi Iesu, dimítte nobis débita nostra, líbera nos ab igne inférni, conduc in cælum omnes ánimas, præsértim illas quæ misericórdiæ tuæ máxime índigent." },
  },
  hailHolyQueen: {
    en: { title: "Hail, Holy Queen", text: "Hail, holy Queen, Mother of mercy, our life, our sweetness and our hope. To thee do we cry, poor banished children of Eve; to thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, thine eyes of mercy toward us, and after this our exile show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary.\n\nV. Pray for us, O holy Mother of God.\nR. That we may be made worthy of the promises of Christ." },
    la: { title: "Salve Regina", text: "Salve, Regína, Mater misericórdiæ, vita, dulcédo, et spes nostra, salve. Ad te clamámus éxsules fílii Hevæ. Ad te suspirámus, geméntes et flentes in hac lacrimárum valle. Eia ergo, advocáta nostra, illos tuos misericórdes óculos ad nos convérte. Et Iesum, benedíctum fructum ventris tui, nobis post hoc exsílium osténde. O clemens, O pia, O dulcis Virgo María.\n\nV. Ora pro nobis, sancta Dei Génetrix.\nR. Ut digni efficiámur promissiónibus Christi." },
  },
  rosaryPrayer: {
    en: { title: "Let Us Pray", text: "O God, whose only begotten Son, by his life, death, and resurrection, has purchased for us the rewards of eternal life; grant, we beseech thee, that meditating upon these mysteries of the most holy Rosary of the Blessed Virgin Mary, we may imitate what they contain and obtain what they promise, through the same Christ our Lord. Amen." },
    la: { title: "Oremus", text: "Deus, cuius Unigénitus per vitam, mortem et resurrectiónem suam nobis salútis ætérnæ prǽmia comparávit: concéde, quǽsumus; ut hæc mystéria sanctíssimo beátæ Maríæ Vírginis Rosário recoléntes, et imitémur quod cóntinent, et quod promíttunt assequámur. Per eúndem Christum Dóminum nostrum. Amen." },
  },
};

export const OPENING_INTENTIONS = {
  en: ["for an increase of Faith", "for an increase of Hope", "for an increase of Charity"],
  la: ["pro augmento fidei", "pro augmento spei", "pro augmento caritatis"],
};

export const ORDINALS = {
  en: ["First", "Second", "Third", "Fourth", "Fifth"],
  la: ["Primum", "Secundum", "Tertium", "Quartum", "Quintum"],
};

// days: 0=Sunday … 6=Saturday
export const MYSTERIES = {
  joyful: {
    name: { en: "Joyful Mysteries", la: "Mysteria Gaudiosa" }, days: [1, 6],
    decades: [
      { pool: "annunciation", name: { en: "The Annunciation", la: "Annuntiatio" }, fruit: "Humility", ref: "Luke 1:28", verse: "And the angel being come in, said unto her: Hail, full of grace, the Lord is with thee: blessed art thou among women." },
      { pool: "visitation", name: { en: "The Visitation", la: "Visitatio" }, fruit: "Love of neighbour", ref: "Luke 1:41–42", verse: "And Elizabeth was filled with the Holy Ghost: and she cried out with a loud voice, and said: Blessed art thou among women, and blessed is the fruit of thy womb." },
      { pool: "nativity", name: { en: "The Nativity", la: "Nativitas" }, fruit: "Poverty of spirit", ref: "Luke 2:7", verse: "And she brought forth her firstborn son, and wrapped him up in swaddling clothes, and laid him in a manger; because there was no room for them in the inn." },
      { pool: "presentation", name: { en: "The Presentation in the Temple", la: "Praesentatio in Templo" }, fruit: "Obedience", ref: "Luke 2:28–30", verse: "He also took him into his arms, and blessed God, and said: Now thou dost dismiss thy servant, O Lord, according to thy word in peace; because my eyes have seen thy salvation." },
      { pool: "finding", name: { en: "The Finding in the Temple", la: "Inventio in Templo" }, fruit: "Piety", ref: "Luke 2:46", verse: "And it came to pass, that, after three days, they found him in the temple, sitting in the midst of the doctors, hearing them, and asking them questions." },
    ],
  },
  luminous: {
    name: { en: "Luminous Mysteries", la: "Mysteria Luminosa" }, days: [4],
    decades: [
      { pool: "baptism", name: { en: "The Baptism of the Lord", la: "Baptismus in Iordane" }, fruit: "Openness to the Holy Spirit", ref: "Matthew 3:17", verse: "And behold a voice from heaven, saying: This is my beloved Son, in whom I am well pleased." },
      { pool: "cana", name: { en: "The Wedding at Cana", la: "Nuptiae in Cana" }, fruit: "To Jesus through Mary", ref: "John 2:5", verse: "His mother saith to the waiters: Whatsoever he shall say to you, do ye." },
      { pool: "proclamation", name: { en: "The Proclamation of the Kingdom", la: "Proclamatio Regni Dei" }, fruit: "Repentance and trust in God", ref: "Mark 1:15", verse: "The time is accomplished, and the kingdom of God is at hand: repent, and believe the gospel." },
      { pool: "transfiguration", name: { en: "The Transfiguration", la: "Transfiguratio" }, fruit: "Desire for holiness", ref: "Matthew 17:2", verse: "And he was transfigured before them. And his face did shine as the sun: and his garments became white as snow." },
      { pool: "eucharist", name: { en: "The Institution of the Eucharist", la: "Institutio Eucharistiae" }, fruit: "Adoration", ref: "Luke 22:19", verse: "And taking bread, he gave thanks, and brake; and gave to them, saying: This is my body, which is given for you. Do this for a commemoration of me." },
    ],
  },
  sorrowful: {
    name: { en: "Sorrowful Mysteries", la: "Mysteria Dolorosa" }, days: [2, 5],
    decades: [
      { pool: "agony", name: { en: "The Agony in the Garden", la: "Agonia in Horto" }, fruit: "Conformity to the will of God", ref: "Luke 22:42", verse: "Father, if thou wilt, remove this chalice from me: but yet not my will, but thine be done." },
      { pool: "scourging", name: { en: "The Scourging at the Pillar", la: "Flagellatio" }, fruit: "Mortification", ref: "John 19:1", verse: "Then therefore, Pilate took Jesus, and scourged him." },
      { pool: "crowning", name: { en: "The Crowning with Thorns", la: "Coronatio Spinis" }, fruit: "Courage", ref: "Matthew 27:29", verse: "And platting a crown of thorns, they put it upon his head, and a reed in his right hand. And bowing the knee before him, they mocked him, saying: Hail, King of the Jews." },
      { pool: "carrying", name: { en: "The Carrying of the Cross", la: "Baiulatio Crucis" }, fruit: "Patience", ref: "John 19:17", verse: "And bearing his own cross, he went forth to that place which is called Calvary, but in Hebrew Golgotha." },
      { pool: "crucifixion", name: { en: "The Crucifixion", la: "Crucifixio" }, fruit: "Perseverance", ref: "Luke 23:46", verse: "And Jesus crying with a loud voice, said: Father, into thy hands I commend my spirit. And saying this, he gave up the ghost." },
    ],
  },
  glorious: {
    name: { en: "Glorious Mysteries", la: "Mysteria Gloriosa" }, days: [0, 3],
    decades: [
      { pool: "resurrection", name: { en: "The Resurrection", la: "Resurrectio" }, fruit: "Faith", ref: "Matthew 28:6", verse: "He is not here, for he is risen, as he said. Come, and see the place where the Lord was laid." },
      { pool: "ascension", name: { en: "The Ascension", la: "Ascensio" }, fruit: "Hope", ref: "Acts 1:9", verse: "And when he had said these things, while they looked on, he was raised up: and a cloud received him out of their sight." },
      { pool: "pentecost", name: { en: "The Descent of the Holy Spirit", la: "Descensus Spiritus Sancti" }, fruit: "Love of God", ref: "Acts 2:4", verse: "And they were all filled with the Holy Ghost, and they began to speak with divers tongues, according as the Holy Ghost gave them to speak." },
      { pool: "assumption", name: { en: "The Assumption", la: "Assumptio" }, fruit: "Grace of a happy death", ref: "Psalm 44:10", verse: "The queen stood on thy right hand, in gilded clothing; surrounded with variety." },
      { pool: "coronation", name: { en: "The Coronation of Mary", la: "Coronatio in Caelo" }, fruit: "Trust in Mary's intercession", ref: "Apocalypse 12:1", verse: "And a great sign appeared in heaven: A woman clothed with the sun, and the moon under her feet, and on her head a crown of twelve stars." },
    ],
  },
};

/* ---------------- chaplets ---------------- */
// Prayers missing a Latin form fall back to English.
Object.assign(PRAYERS, {
  // Divine Mercy
  dmOpening: {
    en: { title: "You Expired, Jesus", text: "You expired, Jesus, but the source of life gushed forth for souls, and the ocean of mercy opened up for the whole world. O Fount of Life, unfathomable Divine Mercy, envelop the whole world and empty Yourself out upon us." },
  },
  bloodWater: {
    en: { title: "O Blood and Water", text: "O Blood and Water, which gushed forth from the Heart of Jesus as a fountain of mercy for us, I trust in You!" },
    la: { title: "O Sanguis et Aqua", text: "O Sanguis et Aqua, quæ de Corde Iesu ut fons misericórdiæ pro nobis emanásti, confído in te!" },
  },
  eternalFather: {
    en: { title: "Eternal Father", text: "Eternal Father, I offer You the Body and Blood, Soul and Divinity of Your dearly beloved Son, Our Lord Jesus Christ, in atonement for our sins and those of the whole world." },
    la: { title: "Pater Æterne", text: "Pater ætérne, óffero tibi Corpus et Sánguinem, Animam et Divinitátem dilectíssimi Fílii tui, Dómini nostri Iesu Christi, in propitiatiónem pro peccátis nostris et totíus mundi." },
  },
  sorrowfulPassion: {
    en: { title: "For the Sake of His Sorrowful Passion", text: "For the sake of His sorrowful Passion, have mercy on us and on the whole world." },
    la: { title: "Pro Dolorosa Eius Passione", text: "Pro dolorósa eius passióne, miserére nobis et totíus mundi." },
  },
  holyGod: {
    en: { title: "Holy God", text: "Holy God, Holy Mighty One, Holy Immortal One, have mercy on us and on the whole world." },
    la: { title: "Sanctus Deus", text: "Sanctus Deus, Sanctus Fortis, Sanctus Immortális, miserére nobis et totíus mundi." },
  },
  dmClosing: {
    en: { title: "Closing Prayer", text: "Eternal God, in whom mercy is endless and the treasury of compassion inexhaustible, look kindly upon us and increase Your mercy in us, that in difficult moments we might not despair nor become despondent, but with great confidence submit ourselves to Your holy will, which is Love and Mercy itself.\n\nJesus, I trust in You." },
  },
  // Seven Sorrows
  deusInAdiutorium: {
    en: { title: "O God, Come to My Assistance", text: "V. O God, come to my assistance.\nR. O Lord, make haste to help me.\n\nGlory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen." },
    la: { title: "Deus, in Adiutorium", text: "V. Deus, in adiutórium meum inténde.\nR. Dómine, ad adiuvándum me festína.\n\nGlória Patri, et Fílio, et Spirítui Sancto. Sicut erat in princípio, et nunc, et semper, et in sǽcula sæculórum. Amen." },
  },
  contrition: {
    en: { title: "Act of Contrition", text: "O my God, I am heartily sorry for having offended Thee, and I detest all my sins because of Thy just punishments, but most of all because they offend Thee, my God, who art all good and deserving of all my love. I firmly resolve, with the help of Thy grace, to sin no more and to avoid the near occasion of sin. Amen." },
    la: { title: "Actus Contritionis", text: "Deus meus, ex toto corde pǽnitet me ómnium meórum peccatórum, éaque detéstor, quia peccándo, non solum pœnas a te iuste statútas proméritus sum, sed præsértim quia offéndi te, summum bonum, ac dignum qui super ómnia diligáris. Ideo fírmiter propóno, adiuvánte grátia tua, de cétero me non peccatúrum peccandíque occasiónes próximas fugitúrum. Amen." },
  },
  sorrowsClosing: {
    en: { title: "Closing Prayer", text: "V. Pray for us, O most sorrowful Virgin.\nR. That we may be made worthy of the promises of Christ.\n\nLord Jesus, we now implore, both for the present and for the hour of our death, the intercession of the most Blessed Virgin Mary, Thy Mother, whose holy soul was pierced at the time of Thy Passion by a sword of grief. Grant us this favor, O Savior of the world, who livest and reignest with the Father and the Holy Spirit, world without end. Amen." },
  },
  // St. Michael
  michaelClosing: {
    en: { title: "O Glorious Prince", text: "O glorious prince St. Michael, chief and commander of the heavenly hosts, guardian of souls, vanquisher of rebel spirits, servant in the house of the Divine King and our admirable conductor, you who shine with excellence and superhuman virtue: deliver us from all evil, who turn to you with confidence, and enable us by your gracious protection to serve God more and more faithfully every day." },
  },
  michaelPrayer: {
    en: { title: "Let Us Pray", text: "V. Pray for us, O glorious St. Michael, Prince of the Church of Jesus Christ.\nR. That we may be made worthy of His promises.\n\nAlmighty and Everlasting God, who by a prodigy of goodness and a merciful desire for the salvation of all men, has appointed the most glorious Archangel St. Michael Prince of Your Church: make us worthy, we ask You, to be delivered from all our enemies, that none of them may harass us at the hour of death, but that we may be conducted by him into Your presence. This we ask through the merits of Jesus Christ Our Lord. Amen." },
  },
});

const CHOIRS = [
  ["Seraphim", "Seraphim", "may the Lord make us worthy to burn with the fire of perfect charity"],
  ["Cherubim", "Cherubim", "may the Lord grant us the grace to leave the ways of sin and run in the paths of Christian perfection"],
  ["Thrones", "Throni", "may the Lord infuse into our hearts a true and sincere spirit of humility"],
  ["Dominions", "Dominationes", "may the Lord give us grace to govern our senses and overcome any unruly passions"],
  ["Virtues", "Virtutes", "may the Lord preserve us from evil and falling into temptation"],
  ["Powers", "Potestates", "may the Lord protect our souls against the snares and temptations of the devil"],
  ["Principalities", "Principatus", "may God fill our souls with a true spirit of obedience"],
  ["Archangels", "Archangeli", "may the Lord give us perseverance in faith and in all good works, in order that we may attain the glory of Heaven"],
  ["Angels", "Angeli", "may the Lord grant us to be protected by them in this mortal life and conducted in the life to come to Heaven"],
];
CHOIRS.forEach(([en, , grace], i) => {
  PRAYERS["salutation" + i] = { en: { title: `The ${en}`, text: `By the intercession of St. Michael and the celestial choir of ${en}, ${grace}. Amen.` } };
});

// Labels shown above a prayer title (keyed by step.note)
export const NOTES = {
  faith: { en: "for an increase of Faith", la: "pro augmento fidei" },
  hope: { en: "for an increase of Hope", la: "pro augmento spei" },
  charity: { en: "for an increase of Charity", la: "pro augmento caritatis" },
  tears: { en: "in honor of the tears of Our Sorrowful Mother", la: "in honorem lacrimarum Matris Dolorosæ" },
  michael: { en: "in honor of St. Michael", la: "in honorem S. Michaëlis" },
  gabriel: { en: "in honor of St. Gabriel", la: "in honorem S. Gabriëlis" },
  raphael: { en: "in honor of St. Raphael", la: "in honorem S. Raphaëlis" },
  guardian: { en: "in honor of our Guardian Angel", la: "in honorem Angeli Custodis" },
};

const ORD_EN = ["First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth", "Ninth"];
const ORD_LA = ["Primum", "Secundum", "Tertium", "Quartum", "Quintum", "Sextum", "Septimum", "Octavum", "Nonum"];
ORDINALS.en = ORD_EN; ORDINALS.la = ORD_LA;

// pool may be an array: images are dealt from the pools combined
export const CHAPLETS = {
  divineMercy: {
    kind: "divineMercy",
    name: { en: "Divine Mercy Chaplet", la: "Coronula Divinæ Misericordiæ" },
    sub: "Five decades on rosary beads",
    begin: "Begin Divine Mercy",
    groupWord: { en: "Decade", la: "Decas" },
    cover: "mercy",
    options: {
      opening: ["Opening prayers", "“You expired, Jesus…” and “O Blood and Water…” three times"],
      closing: ["Closing prayer", "“Eternal God, in whom mercy is endless…”"],
    },
    groups: [
      { pool: "agony", name: { en: "The Agony in the Garden", la: "Agonia in Horto" } },
      { pool: "scourging", name: { en: "The Scourging at the Pillar", la: "Flagellatio" } },
      { pool: "crowning", name: { en: "The Crowning with Thorns", la: "Coronatio Spinis" } },
      { pool: "carrying", name: { en: "The Carrying of the Cross", la: "Baiulatio Crucis" } },
      { pool: "crucifixion", name: { en: "The Crucifixion", la: "Crucifixio" } },
    ],
  },
  sevenSorrows: {
    kind: "sevenSorrows",
    name: { en: "Chaplet of the Seven Sorrows", la: "Coronula Septem Dolorum" },
    sub: "Seven sorrows of Our Lady, seven Hail Marys each",
    begin: "Begin the Seven Sorrows",
    groupWord: { en: "Sorrow", la: "Dolor" },
    cover: "pieta",
    options: {
      opening: ["Act of Contrition", "Prayed after “O God, come to my assistance”"],
      closing: ["Closing prayer", "“Pray for us, O most sorrowful Virgin…”"],
    },
    groups: [
      { pool: "presentation", name: { en: "The Prophecy of Simeon", la: "Prophetia Simeonis" }, ref: "Luke 2:34–35", verse: "Behold this child is set for the fall, and for the resurrection of many in Israel, and for a sign which shall be contradicted; and thy own soul a sword shall pierce." },
      { pool: "flight", name: { en: "The Flight into Egypt", la: "Fuga in Ægyptum" }, ref: "Matthew 2:13–14", verse: "Arise, and take the child and his mother, and fly into Egypt. Who arose, and took the child and his mother by night, and retired into Egypt." },
      { pool: "finding", name: { en: "The Loss of Jesus in the Temple", la: "Amissio Iesu in Templo" }, ref: "Luke 2:48", verse: "Son, why hast thou done so to us? behold thy father and I have sought thee sorrowing." },
      { pool: "carrying", name: { en: "Mary Meets Jesus on the Way to Calvary", la: "Occursus in Via Crucis" }, ref: "Luke 23:27", verse: "And there followed him a great multitude of people, and of women, who bewailed and lamented him." },
      { pool: "crucifixion", name: { en: "The Crucifixion", la: "Crucifixio" }, ref: "John 19:26–27", verse: "When Jesus therefore had seen his mother and the disciple standing whom he loved, he saith to his mother: Woman, behold thy son. After that, he saith to the disciple: Behold thy mother." },
      { pool: ["deposition", "pieta"], name: { en: "Jesus Is Taken Down from the Cross", la: "Depositio de Cruce" }, ref: "Lamentations 1:12", verse: "O all ye that pass by the way, attend, and see if there be any sorrow like to my sorrow." },
      { pool: "entombment", name: { en: "The Burial of Jesus", la: "Sepultura" }, ref: "John 19:41–42", verse: "Now there was in the place where he was crucified, a garden; and in the garden a new sepulchre, wherein no man yet had been laid. There, therefore, they laid Jesus." },
    ],
  },
  stMichael: {
    kind: "stMichael",
    name: { en: "Chaplet of St. Michael", la: "Coronula S. Michaëlis" },
    sub: "Nine salutations to the choirs of angels",
    begin: "Begin St. Michael's Chaplet",
    groupWord: { en: "Salutation", la: "Salutatio" },
    cover: "michael",
    options: {},
    groups: CHOIRS.map(([en, la]) => ({ pool: "angels", name: { en: `The ${en}`, la } })),
  },
};
