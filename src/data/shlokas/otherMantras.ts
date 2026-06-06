import type { ShlokaLanguages } from '../../types/content';

type MantraDraft = {
  id: string;
  title: string;
  languages: ShlokaLanguages;
};

export const otherShlokas: MantraDraft[] = [
  {
    id: 'mrityunjaya-mantra',
    title: 'Mrityunjaya Mantra',
    languages: {
      sanskrit: [
        'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्।',
        'उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात्॥',
      ],
      hindi: [
        'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्।',
        'उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात्॥',
        'अर्थ: हम तीन नेत्रों वाले, सुगंधित और पोषण देने वाले भगवान शिव की उपासना करते हैं।',
        'कृपा करके हमें मृत्यु के बंधन से मुक्त करें, परंतु अमरता से न वंचित करें।',
      ],
      english: [
        'Om Tryambakam Yajamahe Sugandhim Pushtivardhanam,',
        'Urvarukamiva Bandhanan Mrityor Mukshiya Maamritat.',
        'We worship the three-eyed Lord Shiva, fragrant and nourishing.',
        'May He liberate us from the bondage of death, but not from immortality.',
      ],
      telugu: [
        'ఓం త్ర్యంబకం యజామహే సుగంధిం పుష్టివర్ధనమ్।',
        'ఉర్వారుకమివ బంధనాన్ మృత్యోర్ముక్షీయ మామృతాత్॥',
        'మూడు కన్నుల శివuni, sugandhi mariyu pushti ivvuchuni poojistunnamu.',
        'Krupa mrtyuvu bandhanam nunchi vimukti ivvandi; amaratvam nunchi vadili pettakandi.',
      ],
    },
  },
  {
    id: 'krishna-mantra',
    title: 'Krishna Mantra',
    languages: {
      sanskrit: [
        'ॐ कृष्णाय वासुदेवाय हरये परमात्मने।',
        'प्रणतः क्लेशनाशाय गोविन्दाय नमो नमः॥',
      ],
      hindi: [
        'ॐ कृष्णाय वासुदेवाय हरये परमात्मने।',
        'प्रणतः क्लेशनाशाय गोविन्दाय नमो नमः॥',
        'अर्थ: वासुदेव पुत्र कृष्ण, हरि, परमात्मा, शरणागतों के क्लेश नाश करने वाले गोविन्द को बार-बार नमस्कार।',
      ],
      english: [
        'Om Krishnaya Vasudevaya Haraye Paramatmane,',
        'Pranatah Kleshanashaya Govindaya Namo Namah.',
        'Salutations again and again to Krishna, son of Vasudeva, Hari, the Supreme Soul,',
        'and Govinda, who destroys the sorrows of those who surrender.',
      ],
      telugu: [
        'ఓం కృష్ణాయ వాసుదేవాయ హరయే పరమాత్మనే।',
        'ప్రణతః క్లేశనాశాయ గోవిందాయ నమో నమః॥',
        'వాసుదేవuni kumarudu Krishna, Hari, Paramatma, saranu agatula kleshalanu tolaginche Govinduniki namaskaramulu.',
      ],
    },
  },
  {
    id: 'kubera-mantra',
    title: 'Kubera Mantra',
    languages: {
      sanskrit: [
        'ॐ यक्षाय कुबेराय वैश्रवणाय धनधान्यपतये।',
        'धनधान्य समृद्धिं मे देहि दापय स्वाहा॥',
      ],
      hindi: [
        'ॐ यक्षाय कुबेराय वैश्रवणाय धनधान्यपतये।',
        'धनधान्य समृद्धिं मे देहि दापय स्वाहा॥',
        'अर्थ: यक्षराज कुबेर, वैश्रवण, धन और धान्य के स्वामी, मुझे धन-धान्य की समृद्धि प्रदान करें।',
      ],
      english: [
        'Om Yakshaya Kuberaaya Vaishravanaya Dhanadhaanyapataye,',
        'Dhanadhaanya Samriddhim Me Dehi Daapaya Swaha.',
        'O Kubera, lord of the Yakshas, Vaishravana, master of wealth and grain,',
        'grant me abundance of riches and prosperity.',
      ],
      telugu: [
        'ఓం యక్షాయ కుబేరాయ వైశ్రవణాయ ధనధాన్య పతయే',
        'ధనధాన్య సమృద్ధిం మే దేహి దాపయ స్వాహా',
        'Yaksharaja Kubera, Vaishravana, dhana-dhanyadhipati — naku dhanam mariyu samriddhi prasadinchandi.',
      ],
    },
  },
  {
    id: 'navagraha-mantra',
    title: 'Navagraha Mantra',
    languages: {
      sanskrit: [
        'ॐ आदित्याय च सोमाय मंगलाय बुधाय च।',
        'गुरु शुक्र शनिभ्यश्च राहवे केतवे नमः॥',
      ],
      hindi: [
        'ॐ आदित्याय च सोमाय मंगलाय बुधाय च।',
        'गुरु शुक्र शनिभ्यश्च राहवे केतवे नमः॥',
        'अर्थ: सूर्य, चंद्र, मंगल, बुध, गुरु, शुक्र, शनि, राहु और केतु — नौ ग्रहों को नमस्कार।',
      ],
      english: [
        'Om Aadityaya Cha Somaya Mangalaya Budhayacha,',
        'Guru Shukra Shanibhyascha Raahave Ketave Namah.',
        'Salutations to the Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, and Ketu.',
      ],
      telugu: [
        'ఓం ఆదిత్యాయ చ సోమాయ మంగళాయ బుధాయ చ।',
        'గురు శుక్ర శనిభ్యశ్చ రాహవే కేతవే నమః॥',
        'Surya, Chandra, Kuja, Budha, Guru, Shukra, Shani, Rahu, Ketu — navagrahalaku namaskaramulu.',
      ],
    },
  },
];
